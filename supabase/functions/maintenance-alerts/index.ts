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

function saoPauloClock() {
  const pieces = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (type: string) => pieces.find((part) => part.type === type)?.value || "";
  return { date: `${value("year")}-${value("month")}-${value("day")}`, hour: Number(value("hour")) };
}

function saoPauloDate(value: string) {
  const pieces = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => pieces.find((entry) => entry.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
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
  const now = Date.now(), candidates: Array<{ issue: any; kind: string; deadline: string }> = [], results: unknown[] = [];
  for (const row of rows || []) {
    const issue = row.data || {}, maintenance = issue.maintenance || {};
    if (maintenance.status === "Em manutenção" && maintenance.supplierDeadlineAt && new Date(maintenance.supplierDeadlineAt).getTime() <= now) {
      candidates.push({ issue, kind: "prazo-fornecedor", deadline: maintenance.supplierDeadlineAt });
    } else if (maintenance.status === "Agendada" && maintenance.scheduledAt && new Date(maintenance.scheduledAt).getTime() + 30 * 60000 <= now && !maintenance.deliveryAt) {
      candidates.push({ issue, kind: "agendamento-vencido", deadline: maintenance.scheduledAt });
    }
  }

  for (const candidate of candidates) {
    const { issue, kind, deadline } = candidate;
    const notificationKey = `${issue.id}:${kind}:${String(deadline).slice(0, 13)}`;
    const { data: inserted, error: insertError } = await admin.from("fleet_server_notifications").insert({ notification_key: notificationKey, issue_id: String(issue.id), notification_type: kind }).select("notification_key").maybeSingle();
    if (insertError || !inserted) continue;
    const base = String(issue.baseName || "sem-base"), prefix = issue.vehiclePrefix || "—";
    const title = kind === "prazo-fornecedor" ? "Prazo de manutenção vencido" : "Agendamento sem entrega";
    const body = kind === "prazo-fornecedor" ? `Prefixo ${prefix}: ultrapassou o prazo de 6 horas na manutenção.` : `Prefixo ${prefix}: o horário agendado passou e a entrega não foi registrada.`;
    const appUrl = `https://4lves-dev.github.io/checkfrota/lider.html?v=224&base=${encodeURIComponent(base)}&issue=${encodeURIComponent(issue.id || "")}`;
    const leader = await sendPush(oneSignalKey, appId, title, body, appUrl, [{ field: "tag", key: "area", relation: "=", value: "lideranca" }, { operator: "AND" }, { field: "tag", key: "base", relation: "=", value: base }]);
    const management = await sendPush(oneSignalKey, appId, title, body, `https://4lves-dev.github.io/checkfrota/?gestao=1&v=224&issue=${encodeURIComponent(issue.id || "")}`, [{ field: "tag", key: "perfil", relation: "=", value: "gestao" }]);
    results.push({ issueId: issue.id, kind, leader: leader.ok, management: management.ok });
  }

  const clock = saoPauloClock();
  if (clock.hour === 8) {
    const [{ data: vehicles, error: vehiclesError }, { data: inspections, error: inspectionsError }] = await Promise.all([
      admin.from("fleet_vehicles").select("id,prefix,plate,data").limit(5000),
      admin.from("fleet_inspections").select("data").limit(10000),
    ]);
    if (vehiclesError || inspectionsError) {
      results.push({ kind: "checklist-diario", error: vehiclesError?.message || inspectionsError?.message });
    } else {
      const inspectedToday = new Set((inspections || [])
        .map((row: any) => row.data || {})
        .filter((inspection: any) => inspection.createdAt && saoPauloDate(String(inspection.createdAt)) === clock.date)
        .map((inspection: any) => String(inspection.vehicleId || "")));
      const missing = (vehicles || []).filter((vehicle: any) => !inspectedToday.has(String(vehicle.id)));
      if (missing.length) {
        const notificationKey = `checklist-diario:${clock.date}`;
        const { data: inserted, error: insertError } = await admin.from("fleet_server_notifications")
          .insert({ notification_key: notificationKey, issue_id: notificationKey, notification_type: "checklist-diario" })
          .select("notification_key").maybeSingle();
        if (!insertError && inserted) {
          const management = await sendPush(oneSignalKey, appId, "Checklist diário pendente",
            `${missing.length} veículo(s) estão sem checklist às 08:00. Abra a Gestão para conferir.`,
            "https://4lves-dev.github.io/checkfrota/?gestao=1&v=224#controle",
            [{ field: "tag", key: "perfil", relation: "=", value: "gestao" }]);
          results.push({ kind: "checklist-diario", missing: missing.length, management: management.ok });
        } else if (insertError) results.push({ kind: "checklist-diario", error: insertError.message });
      } else results.push({ kind: "checklist-diario", missing: 0, management: false });
    }
  }
  return json({ checked: rows?.length || 0, delivered: results.length, results });
});
