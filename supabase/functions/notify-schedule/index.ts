import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://4lves-dev.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});

async function idempotencyKey(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const url = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const oneSignalKey = Deno.env.get("ONESIGNAL_REST_API_KEY") || Deno.env.get("ONESIGNAL_API_KEY") || "";
  const appId = Deno.env.get("ONESIGNAL_APP_ID") || "3d57134c-adf3-4f8f-8ec2-093b1d02f3bf";
  const authorization = request.headers.get("Authorization") || "";
  if (!oneSignalKey) return json({ error: "Notificações não configuradas" }, 503);
  if (!authorization) return json({ error: "Autenticação obrigatória" }, 401);

  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser(authorization.replace(/^Bearer\s+/i, ""));
  if (userError || !userData.user) return json({ error: "Sessão inválida" }, 401);
  const { data: role } = await userClient.rpc("fleet_current_management_role");
  if (!["master", "gestor"].includes(String(role || ""))) return json({ error: "Sem permissão para agendar" }, 403);

  const { issueId } = await request.json().catch(() => ({ issueId: "" }));
  if (!issueId) return json({ error: "Chamado não informado" }, 400);
  const admin = createClient(url, serviceKey);
  const { data: row, error } = await admin.from("fleet_issues").select("data").eq("id", issueId).single();
  if (error || !row?.data) return json({ error: "Chamado não encontrado" }, 404);

  const issue = row.data;
  const maintenance = issue.maintenance || {};
  if (maintenance.status !== "Agendada" || !maintenance.scheduledAt) return json({ error: "Chamado ainda não está agendado" }, 409);
  const when = new Date(maintenance.scheduledAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const title = "Manutenção agendada";
  const body = `Prefixo ${issue.vehiclePrefix || "—"}: ${when} · ${maintenance.provider || maintenance.address || "local informado"}`;
  const base = String(issue.baseName || "sem-base");
  const common = { app_id: appId, headings: { en: title, pt: title }, contents: { en: body, pt: body }, url: `https://4lves-dev.github.io/checkfrota/?v=201&matricula=${encodeURIComponent(issue.driverRegistration || "")}` };

  const messages = [
    issue.driverRegistration ? { ...common, include_aliases: { external_id: [`colaborador:${issue.driverRegistration}`] }, target_channel: "push" } : null,
    { ...common, filters: [{ field: "tag", key: "area", relation: "=", value: "lideranca" }, { operator: "AND" }, { field: "tag", key: "base", relation: "=", value: base }] },
    { ...common, filters: [{ field: "tag", key: "area", relation: "=", value: "lideranca" }, { operator: "AND" }, { field: "tag", key: "base", relation: "=", value: "Todas as bases" }] },
  ].filter(Boolean);

  const results = [];
  for (let index = 0; index < messages.length; index += 1) {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: { Authorization: `Key ${oneSignalKey}`, "Content-Type": "application/json", "Idempotency-Key": await idempotencyKey(`${issue.id}:${maintenance.updatedAt}:${index}`) },
      body: JSON.stringify(messages[index]),
    });
    results.push({ ok: response.ok, status: response.status, body: await response.json().catch(() => ({})) });
  }
  if (results.some((result) => !result.ok)) return json({ error: "Uma ou mais notificações falharam", results }, 502);
  return json({ delivered: results.length, results });
});
