import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-cron-secret" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function sendPush(apiKey: string, appId: string, title: string, body: string, url: string, filters: unknown[]) {
  const response = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, headings: { en: title, pt: title }, contents: { en: body, pt: body }, url, filters }),
  });
  return { ok: response.ok, status: response.status, result: await response.json().catch(() => ({})) };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);
  const expectedSecret = Deno.env.get("MAINTENANCE_ALERTS_CRON_SECRET") || "";
  if (!expectedSecret || request.headers.get("x-cron-secret") !== expectedSecret) return json({ error: "Acesso negado" }, 401);

  const url = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const oneSignalKey = Deno.env.get("ONESIGNAL_REST_API_KEY") || Deno.env.get("ONESIGNAL_API_KEY") || "";
  const appId = Deno.env.get("ONESIGNAL_APP_ID") || "3d57134c-adf3-4f8f-8ec2-093b1d02f3bf";
  if (!url || !serviceKey || !oneSignalKey) return json({ error: "Segredos do servidor não configurados" }, 503);

  const admin = createClient(url, serviceKey);
  const { data: rows, error } = await admin.from("fleet_issues").select("id,data,status").neq("status", "resolvida").limit(1000);
  if (error) return json({ error: error.message }, 500);
  const now = Date.now(), candidates: Array<{ issue: any; kind: string; deadline: string }> = [];
  for (const row of rows || []) {
    const issue = row.data || {}, maintenance = issue.maintenance || {};
    if (maintenance.status === "Em manutenção" && maintenance.supplierDeadlineAt && new Date(maintenance.supplierDeadlineAt).getTime() <= now) {
      candidates.push({ issue, kind: "prazo-fornecedor", deadline: maintenance.supplierDeadlineAt });
    } else if (maintenance.status === "Agendada" && maintenance.scheduledAt && new Date(maintenance.scheduledAt).getTime() + 30 * 60000 <= now && !maintenance.deliveryAt) {
      candidates.push({ issue, kind: "agendamento-vencido", deadline: maintenance.scheduledAt });
    }
  }

  const results = [];
  for (const candidate of candidates) {
    const { issue, kind, deadline } = candidate;
    const notificationKey = `${issue.id}:${kind}:${String(deadline).slice(0, 13)}`;
    const { data: inserted, error: insertError } = await admin.from("fleet_server_notifications").insert({ notification_key: notificationKey, issue_id: String(issue.id), notification_type: kind }).select("notification_key").maybeSingle();
    if (insertError || !inserted) continue;
    const base = String(issue.baseName || "sem-base"), prefix = issue.vehiclePrefix || "—";
    const title = kind === "prazo-fornecedor" ? "Prazo de manutenção vencido" : "Agendamento sem entrega";
    const body = kind === "prazo-fornecedor" ? `Prefixo ${prefix}: ultrapassou o prazo de 6 horas na manutenção.` : `Prefixo ${prefix}: o horário agendado passou e a entrega não foi registrada.`;
    const appUrl = `https://4lves-dev.github.io/checkfrota/lider.html?v=205&base=${encodeURIComponent(base)}`;
    const leader = await sendPush(oneSignalKey, appId, title, body, appUrl, [{ field: "tag", key: "area", relation: "=", value: "lideranca" }, { operator: "AND" }, { field: "tag", key: "base", relation: "=", value: base }]);
    const management = await sendPush(oneSignalKey, appId, title, body, `https://4lves-dev.github.io/checkfrota/?gestao=1&v=205`, [{ field: "tag", key: "perfil", relation: "=", value: "gestao" }]);
    results.push({ issueId: issue.id, kind, leader: leader.ok, management: management.ok });
  }
  return json({ checked: rows?.length || 0, delivered: results.length, results });
});
