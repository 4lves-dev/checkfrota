/* CheckFrota - MVP local-first. Dados ficam neste navegador até uma integração ser configurada. */
const STORAGE_KEY = "checkfrota-v1";
const CHECKLIST = [
  ["pneus", "Pneus e estepe", "Rodagem"],
  ["luzes", "Faróis, lanternas e setas", "Elétrica"],
  ["freios", "Freios e freio de estacionamento", "Segurança"],
  ["fluidos", "Óleo, água e demais fluidos", "Motor"],
  ["vazamentos", "Vazamentos visíveis", "Motor"],
  ["buzina", "Buzina", "Segurança"],
  ["limpador", "Limpador e para-brisa", "Segurança"],
  ["espelhos", "Retrovisores", "Segurança"],
  ["cinto", "Cintos de segurança", "Segurança"],
  ["documentos", "Documentos do veículo", "Documentação"],
  ["carga", "Carga / carroceria / amarração", "Operação"],
  ["kit", "Triângulo, macaco e extintor", "Segurança"],
].map(([id, name, category]) => ({ id, name, category }));

const initialData = {
  settings: { maintenancePhone: "5512988400316", maintenanceGroupPhone: "", leaderPhone: "", fleetManagerPhone: "", webhookUrl: "" },
  vehicles: [
    { id: "v1446", prefix: "1446", plate: "SHR7161", type: "Carro", model: "Onix", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "50/23", urbamContract: "620/24", odometer: "" },
    { id: "v1447", prefix: "1447", plate: "SHL7J59", type: "Carro", model: "Onix", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "50/23", urbamContract: "482/22", odometer: "" },
    { id: "v1456", prefix: "1456", plate: "SHR7128", type: "Utilitário", model: "Furgão Peugeot", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "58/23", urbamContract: "44/23", odometer: "" },
    { id: "v1466", prefix: "1466", plate: "SIA9F89", type: "Carro", model: "Orochi", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "115/23", urbamContract: "620/24", odometer: "" },
    { id: "v1894", prefix: "1894", plate: "TKI5A73", type: "Carro", model: "Kwid", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "40/2025", urbamContract: "620/24", odometer: "" },
    { id: "v1922", prefix: "1922", plate: "QSR4H49", type: "Utilitário", model: "Saveiro", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "100/25", urbamContract: "620/24", odometer: "" },
    { id: "v1484", prefix: "1484", plate: "TEW4C59", type: "Caminhão", model: "VUC", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "066/25", urbamContract: "620/24", odometer: "" },
    { id: "v1485", prefix: "1485", plate: "TEW4C66", type: "Caminhão", model: "VUC", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "066/25", urbamContract: "620/24", odometer: "" },
    { id: "v1486", prefix: "1486", plate: "TEW4C63", type: "Caminhão", model: "VUC", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "066/25", urbamContract: "482/22", odometer: "" },
    { id: "v1799", prefix: "1799", plate: "CZR0J46", type: "Utilitário", model: "Saveiro", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "178/23", urbamContract: "620/24", odometer: "" },
    { id: "v1969", prefix: "1969", plate: "UDR0F38", type: "Caminhão", model: "Caminhão plataforma", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "172/25", urbamContract: "620/24", odometer: "" },
    { id: "v1126", prefix: "1126", plate: "GHI9I25", type: "Caminhão", model: "Caminhão pequeno porte com cabine estendida", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "608/22", urbamContract: "482/22", odometer: "" },
    { id: "v1919", prefix: "1919", plate: "TXF5B12", type: "Caminhão", model: "Caminhão 3/4 com cabine suplementar e cesto aéreo", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "075/25", urbamContract: "620/24", odometer: "" },
    { id: "v1082", prefix: "1082", plate: "GAS8B76", type: "Caminhão", model: "Caminhão guindauto cesto", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "096/25", urbamContract: "482/22", odometer: "" },
    { id: "v1084", prefix: "1084", plate: "FVY2G68", type: "Caminhão", model: "Caminhão guindauto cesto", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "096/25", urbamContract: "620/24", odometer: "" },
    { id: "v1577", prefix: "1577", plate: "FVQ8C09", type: "Caminhão", model: "Caminhão 3/4 com cabine suplementar", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "095/25", urbamContract: "620/24", odometer: "" },
    { id: "v1967", prefix: "1967", plate: "UET6G08", type: "Carro", model: "Strada", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "059/26", urbamContract: "620/24", odometer: "" },
    { id: "v1968", prefix: "1968", plate: "UED5G69", type: "Carro", model: "Strada", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "059/26", urbamContract: "620/24", odometer: "" },
    { id: "v157", prefix: "157", plate: "SVP0D79", type: "Caminhão", model: "Iveco/Tector 17-280", ownerName: "URBAM", ownerPhone: "", email: "", contract: "", urbamContract: "", odometer: "" },
  ],
  inspections: [],
  issues: [],
};

let data = loadData();
let current = { driver: "", driverPhone: "", vehicleId: "", odometer: "", states: {}, notes: "" };
let issueDraft = { itemId: null, severity: "Leve" };
let deferredInstallPrompt = null;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const esc = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const today = () => new Date().toISOString().slice(0, 10);
const dateTime = (value) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const phoneOnly = (phone = "") => phone.replace(/\D/g, "");

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return structuredClone(initialData);
    // Atualiza aparelhos que ainda guardam os três veículos de demonstração,
    // preservando veículos reais já cadastrados manualmente pela base.
    const storedVehicles = Array.isArray(stored.vehicles) ? stored.vehicles : [];
    const seededVehicles = initialData.vehicles.map((seed) => ({
      ...seed,
      ...(storedVehicles.find((vehicle) => vehicle.prefix === seed.prefix || vehicle.plate === seed.plate) || {}),
    }));
    const customVehicles = storedVehicles.filter((vehicle) =>
      !["v1", "v2", "v3"].includes(vehicle.id) &&
      !initialData.vehicles.some((seed) => seed.prefix === vehicle.prefix || seed.plate === vehicle.plate)
    );
    return { ...initialData, ...stored, vehicles: [...seededVehicles, ...customVehicles], settings: { ...initialData.settings, ...stored.settings } };
  } catch { return structuredClone(initialData); }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function vehicleById(id) { return data.vehicles.find((vehicle) => vehicle.id === id); }
function checkById(id) { return CHECKLIST.find((item) => item.id === id); }

function showScreen(name) {
  $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "controle") renderControl();
  if (name === "inicio") renderStart();
}

function renderStart() {
  const select = $("#vehicleSelect");
  const rememberedDriver = localStorage.getItem("checkfrota-driver") || "";
  const rememberedDriverPhone = localStorage.getItem("checkfrota-driver-phone") || "";
  if (!$("#driverName").value) $("#driverName").value = rememberedDriver;
  if (!$("#driverPhone").value) $("#driverPhone").value = rememberedDriverPhone;
  select.innerHTML = `<option value="">Selecione o veículo</option>${data.vehicles.map((vehicle) => `<option value="${vehicle.id}">Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} · ${esc(vehicle.model || vehicle.type)}</option>`).join("")}`;
  if (current.vehicleId && vehicleById(current.vehicleId)) select.value = current.vehicleId;
  renderVehicleOwner();
  const todaysInspections = data.inspections.filter((inspection) => inspection.createdAt.slice(0, 10) === today());
  $("#dailyDone").textContent = todaysInspections.length;
  $("#openIssues").textContent = data.issues.filter((issue) => issue.status === "aberta").length;
}
function renderVehicleOwner() {
  const vehicle = vehicleById($("#vehicleSelect").value);
  $("#vehicleOwner").textContent = vehicle ? `Responsável: ${vehicle.ownerName}${vehicle.email ? ` · ${vehicle.email}` : ""}` : "";
}

function beginChecklist() {
  const driver = $("#driverName").value.trim();
  const driverPhone = phoneOnly($("#driverPhone").value);
  const vehicleId = $("#vehicleSelect").value;
  const odometer = Number($("#odometer").value);
  if (!driver) return alert("Informe seu nome antes de iniciar.");
  if (!vehicleId) return alert("Selecione o veículo que será utilizado.");
  if (!Number.isFinite(odometer) || odometer < 0) return alert("Informe a quilometragem atual do veículo.");
  current = { driver, driverPhone, vehicleId, odometer, states: Object.fromEntries(CHECKLIST.map((item) => [item.id, { status: "pending" }])), notes: "" };
  localStorage.setItem("checkfrota-driver", driver);
  localStorage.setItem("checkfrota-driver-phone", driverPhone);
  const vehicle = vehicleById(vehicleId);
  $("#checklistVehicle").textContent = `Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate} · ${vehicle.model || vehicle.type}`;
  renderChecklist();
  showScreen("checklist");
}
function renderChecklist() {
  const items = $("#checklistItems");
  items.innerHTML = CHECKLIST.map((item) => {
    const state = current.states[item.id] || { status: "pending" };
    const issueClass = state.status === "issue" ? "has-issue" : "";
    const issueHint = state.status === "issue" ? `<small class="chip ${state.issue.severity.toLowerCase()}">${state.issue.severity}</small>` : "";
    return `<article class="check-item ${issueClass}">
      <div><span class="check-name">${esc(item.name)}</span><span class="check-category">${esc(item.category)} ${issueHint}</span></div>
      <div class="check-controls">
        <button class="state-button ok ${state.status === "ok" ? "active" : ""}" data-state="ok" data-item="${item.id}" aria-label="${esc(item.name)} está em ordem" title="Em ordem">✓</button>
        <button class="state-button issue ${state.status === "issue" ? "active" : ""}" data-state="issue" data-item="${item.id}" aria-label="${esc(item.name)} tem problema" title="Registrar problema">!</button>
      </div>
    </article>`;
  }).join("");
  updateProgress();
}
function updateProgress() {
  const completed = Object.values(current.states).filter((state) => state.status !== "pending").length;
  $("#progressText").textContent = `${completed} de ${CHECKLIST.length} itens verificados`;
  $("#progressBar").style.width = `${(completed / CHECKLIST.length) * 100}%`;
}

function openIssue(itemId) {
  issueDraft = { itemId, severity: current.states[itemId]?.issue?.severity || "Leve" };
  const item = checkById(itemId);
  $("#issueItemName").textContent = item.name;
  $("#issueDescription").value = current.states[itemId]?.issue?.description || "";
  $("#issuePhoto").value = "";
  $$(".severity").forEach((button) => button.classList.toggle("active", button.dataset.severity === issueDraft.severity));
  $("#issueDialog").showModal();
}
function saveIssue() {
  const description = $("#issueDescription").value.trim();
  if (!description) { $("#issueDescription").reportValidity(); return; }
  const photo = $("#issuePhoto").files[0];
  current.states[issueDraft.itemId] = {
    status: "issue",
    issue: { severity: issueDraft.severity, description, photoName: photo?.name || "" },
  };
  $("#issueDialog").close();
  renderChecklist();
}
function reviewChecklist() {
  const pending = CHECKLIST.filter((item) => current.states[item.id]?.status === "pending");
  if (pending.length) return alert(`Faltam ${pending.length} item(ns) para verificar. Marque ✓ ou ! em todos eles.`);
  const issues = getCurrentIssues();
  $("#reviewSummary").innerHTML = `<section class="review-box card">
    <div class="review-row"><span>Motorista</span><b>${esc(current.driver)}</b></div>
    <div class="review-row"><span>Veículo</span><b>Prefixo ${esc(vehicleById(current.vehicleId).prefix || "—")} · ${esc(vehicleById(current.vehicleId).plate)}</b></div>
    <div class="review-row"><span>Quilometragem</span><b>${esc(current.odometer)} km</b></div>
    <div class="review-row"><span>Itens em ordem</span><span class="chip ok">${CHECKLIST.length - issues.length} OK</span></div>
    <div class="review-row"><span>Ocorrências</span>${issues.length ? `<span class="chip ${highestSeverity(issues).toLowerCase()}">${issues.length} encontrada(s)</span>` : `<span class="chip ok">Nenhuma</span>`}</div>
  </section>${issues.length ? `<section class="review-box card">${issues.map((issue) => `<div class="review-row"><span>${esc(issue.item.name)}</span><span class="chip ${issue.severity.toLowerCase()}">${esc(issue.severity)}</span></div>`).join("")}</section>` : ""}`;
  $("#generalNotes").value = current.notes;
  showScreen("review");
}
function getCurrentIssues() {
  return CHECKLIST.filter((item) => current.states[item.id]?.status === "issue").map((item) => ({ item, ...current.states[item.id].issue }));
}
function severityRank(severity) { return ({ Leve: 1, "Média": 2, Grave: 3 }[severity] || 0); }
function highestSeverity(issues) { return issues.reduce((highest, issue) => severityRank(issue.severity) > severityRank(highest) ? issue.severity : highest, "Leve"); }

async function submitChecklist() {
  current.notes = $("#generalNotes").value.trim();
  const vehicle = vehicleById(current.vehicleId);
  const inspection = {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), driver: current.driver, driverPhone: current.driverPhone,
    vehicleId: vehicle.id, vehiclePrefix: vehicle.prefix || "", vehiclePlate: vehicle.plate, vehicleType: vehicle.type, vehicleModel: vehicle.model || "", odometer: current.odometer, notes: current.notes,
    items: CHECKLIST.map((item) => ({ ...item, ...current.states[item.id] })),
  };
  const currentIssues = getCurrentIssues();
  const newIssues = currentIssues.map((issue) => ({
    id: crypto.randomUUID(), inspectionId: inspection.id, status: "aberta", createdAt: inspection.createdAt,
    driver: current.driver, driverPhone: current.driverPhone, vehicleId: vehicle.id, vehiclePrefix: vehicle.prefix || "", vehiclePlate: vehicle.plate, vehicleType: vehicle.type, vehicleModel: vehicle.model || "", odometer: current.odometer,
    ownerName: vehicle.ownerName, ownerPhone: vehicle.ownerPhone, email: vehicle.email,
    itemName: issue.item.name, severity: issue.severity, description: issue.description, photoName: issue.photoName,
    maintenance: { status: "Pendente", scheduledAt: "", provider: "", feedback: "", updatedAt: "" },
  }));
  vehicle.odometer = current.odometer;
  data.inspections.unshift(inspection);
  data.issues.unshift(...newIssues);
  saveData();
  const sendResult = await sendToIntegration({ inspection, vehicle, issues: newIssues });
  showCompletion(vehicle, newIssues, sendResult);
  current = { driver: current.driver, driverPhone: current.driverPhone, vehicleId: vehicle.id, odometer: "", states: {}, notes: "" };
  saveData();
}

async function sendToIntegration(payload) {
  if (!data.settings.webhookUrl) return { sent: false, reason: "sem integração" };
  try {
    const response = await fetch(data.settings.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return { sent: response.ok, reason: response.ok ? "enviado" : "falhou" };
  } catch { return { sent: false, reason: "falhou" }; }
}
function buildWhatsAppMessage(vehicle, issues) {
  const severity = highestSeverity(issues);
  const list = issues.map((issue) => `• ${issue.itemName || issue.item?.name} (${issue.severity}): ${issue.description}`).join("\n");
  const createdAt = issues[0]?.createdAt || new Date();
  return `*OCORRÊNCIA DE FROTA — ${severity.toUpperCase()}*\n\nVeículo: Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate} (${vehicle.model || vehicle.type})\nQuilometragem: ${issues[0]?.odometer ?? vehicle.odometer ?? "Não informada"} km\nMotorista: ${issues[0]?.driver || current.driver || "Não informado"}\nData: ${dateTime(createdAt)}\n\nOcorrência(s):\n${list}\n\nSolicitamos avaliação e manutenção do veículo.`;
}
function whatsappLink(phone, message) { return `https://wa.me/${phoneOnly(phone)}?text=${encodeURIComponent(message)}`; }
function approvalUrl(vehicle, issues) {
  const first = issues[0] || {};
  const problem = issues.map((issue) => `${issue.itemName || issue.item?.name}: ${issue.description}`).join(" | ");
  const params = new URLSearchParams({
    id: `MAN-${String(first.id || Date.now()).replaceAll("-", "").slice(-8)}`,
    prefix: vehicle.prefix || "", type: vehicle.model || vehicle.type, plate: vehicle.plate,
    driver: first.driver || current.driver || "", driverPhone: first.driverPhone || current.driverPhone || "",
    leaderPhone: data.settings.leaderPhone || "", maintenancePhone: data.settings.maintenancePhone || "",
    km: String(first.odometer ?? vehicle.odometer ?? ""), priority: highestSeverity(issues), location: "", problem,
  });
  return `${location.origin}${location.pathname.replace(/[^/]*$/, "aprovacao.html")}?${params.toString()}`;
}
function showCompletion(vehicle, issues, sendResult) {
  const severe = issues.some((issue) => issue.severity === "Grave");
  $("#successTitle").textContent = issues.length ? (severe ? "Veículo com bloqueio de deslocamento." : "Ocorrência registrada.") : "Tudo certo para seguir.";
  $("#successText").textContent = issues.length ? `O formulário foi salvo com ${issues.length} ocorrência(s). ${sendResult.sent ? "A integração de e-mail foi acionada." : "Configure a integração para o envio automático por e-mail."}` : "Checklist concluído e registrado no controle da frota.";
  const actions = $("#dispatchActions");
  if (!issues.length) { actions.innerHTML = ""; showScreen("success"); return; }
  const message = buildWhatsAppMessage(vehicle, issues);
  const buttons = [];
  if (data.settings.maintenancePhone) buttons.push(`<a href="${whatsappLink(data.settings.maintenancePhone, message)}" target="_blank" rel="noopener">Enviar aviso para a base no WhatsApp</a>`);
  if (data.settings.leaderPhone) {
    const approvalMessage = `*APROVAÇÃO DE MANUTENÇÃO NECESSÁRIA*\n\n${message.replace(/\*/g, "")}\n\nAbra para aprovar ou recusar:\n${approvalUrl(vehicle, issues)}`;
    buttons.push(`<a class="secondary-link" href="${whatsappLink(data.settings.leaderPhone, approvalMessage)}" target="_blank" rel="noopener">Enviar para aprovação do líder</a>`);
  }
  if (data.settings.fleetManagerPhone) buttons.push(`<a class="secondary-link" href="${whatsappLink(data.settings.fleetManagerPhone, `*CIÊNCIA — GESTÃO DE FROTA*\n\n${message.replace(/\*/g, "")}`)}" target="_blank" rel="noopener">Enviar ciência ao gestor de frota</a>`);
  if (vehicle.ownerPhone) buttons.push(`<a class="secondary-link" href="${whatsappLink(vehicle.ownerPhone, message)}" target="_blank" rel="noopener">Abrir WhatsApp do responsável</a>`);
  if (vehicle.email) buttons.push(`<a class="secondary-link" href="mailto:${encodeURIComponent(vehicle.email)}?subject=${encodeURIComponent(`Ocorrência ${vehicle.plate} — ${highestSeverity(issues)}`)}&body=${encodeURIComponent(message.replace(/\*/g, ""))}">Enviar e-mail ao responsável</a>`);
  actions.innerHTML = buttons.join("");
  showScreen("success");
}

function renderControl() {
  const open = data.issues.filter((issue) => issue.status === "aberta");
  $("#fleetCount").textContent = data.vehicles.length;
  $("#seriousCount").textContent = open.filter((issue) => issue.severity === "Grave").length;
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  $("#weekChecks").textContent = data.inspections.filter((inspection) => new Date(inspection.createdAt).getTime() >= since).length;
  renderIssues(); renderReports(); renderHistory(); renderVehicles();
}
function empty() { return $("#emptyStateTemplate").content.cloneNode(true); }
function maintenanceOf(issue) { return { status: "Pendente", scheduledAt: "", provider: "", feedback: "", ...issue.maintenance }; }
function renderIssues() {
  const panel = $("#issuesPanel"); panel.innerHTML = "";
  const issues = data.issues.filter((issue) => issue.status === "aberta").sort((a,b) => severityRank(b.severity) - severityRank(a.severity) || new Date(b.createdAt)-new Date(a.createdAt));
  if (!issues.length) { panel.append(empty()); return; }
  panel.innerHTML = issues.map((issue) => {
    const maintenance = maintenanceOf(issue);
    const schedule = maintenance.scheduledAt ? ` · ${dateTime(maintenance.scheduledAt)}` : "";
    return `<article class="issue-card ${issue.severity.toLowerCase()}">
      <div class="card-heading"><div><h3>${esc(issue.itemName)}</h3><p class="vehicle-label">Prefixo ${esc(issue.vehiclePrefix || "—")} · ${esc(issue.vehiclePlate)} · ${esc(issue.vehicleModel || issue.vehicleType)} · ${esc(issue.odometer ?? "—")} km</p></div><span class="chip ${issue.severity.toLowerCase()}">${esc(issue.severity)}</span></div>
      <p class="issue-desc">${esc(issue.description)}</p>
      <p class="meta">${esc(issue.driver)} · ${dateTime(issue.createdAt)}${issue.photoName ? ` · 📷 ${esc(issue.photoName)}` : ""}</p>
      <p class="maintenance-meta"><b>Manutenção:</b> ${esc(maintenance.status)}${schedule}${maintenance.provider ? ` · ${esc(maintenance.provider)}` : ""}</p>
      <div class="issue-actions"><button class="small-button" data-maintenance-issue="${issue.id}">Agendar / retorno</button><button class="small-button whatsapp" data-maintenance-whatsapp="${issue.id}">Avisar base</button><button class="small-button" data-close-issue="${issue.id}">Marcar resolvida</button></div>
    </article>`;
  }).join("");
}
function renderReports() {
  const panel = $("#reportsPanel");
  const issues = [...data.issues].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const open = issues.filter((issue) => issue.status === "aberta").length;
  const scheduled = issues.filter((issue) => maintenanceOf(issue).status === "Agendada").length;
  const completed = issues.filter((issue) => issue.status === "resolvida" || maintenanceOf(issue).status === "Concluída").length;
  panel.innerHTML = `<section class="report-summary"><article><span>${issues.length}</span><small>solicitações</small></article><article><span>${open}</span><small>em aberto</small></article><article><span>${scheduled}</span><small>agendadas</small></article><article><span>${completed}</span><small>concluídas</small></article></section><button class="report-download" id="downloadReport">↓ Baixar relatório de solicitações (Excel)</button><div class="report-list">${issues.length ? issues.map((issue) => { const maintenance = maintenanceOf(issue); return `<article class="report-item"><div><b>Prefixo ${esc(issue.vehiclePrefix || "—")} · ${esc(issue.vehiclePlate)} · ${esc(issue.itemName)}</b><p>${esc(issue.description)}</p><small>${dateTime(issue.createdAt)} · ${esc(maintenance.status)}${maintenance.scheduledAt ? ` · ${dateTime(maintenance.scheduledAt)}` : ""}</small></div><span class="chip ${issue.severity.toLowerCase()}">${esc(issue.severity)}</span></article>`; }).join("") : `<div class="empty-state"><span>⌁</span><p>Nenhuma solicitação registrada.</p></div>`}</div>`;
}
function downloadReport() {
  if (!window.XLSX) return alert("Não foi possível carregar o recurso de Excel. Verifique sua conexão e tente novamente.");
  const rows = data.issues.map((issue) => { const maintenance = maintenanceOf(issue); return { "Data": dateTime(issue.createdAt), "Prefixo": issue.vehiclePrefix || "", "Placa": issue.vehiclePlate, "Tipo / modelo": issue.vehicleModel || issue.vehicleType, "Quilometragem (km)": issue.odometer ?? "", "Ocorrência": issue.itemName, "Gravidade": issue.severity, "Descrição": issue.description, "Motorista": issue.driver, "Situação": maintenance.status, "Agendamento": maintenance.scheduledAt ? dateTime(maintenance.scheduledAt) : "", "Oficina / responsável": maintenance.provider, "Retorno": maintenance.feedback }; });
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "Data": "Nenhuma solicitação registrada" }]);
  sheet["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 13 }, { wch: 28 }, { wch: 19 }, { wch: 25 }, { wch: 12 }, { wch: 45 }, { wch: 24 }, { wch: 16 }, { wch: 20 }, { wch: 28 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, sheet, "Solicitações");
  XLSX.writeFile(workbook, `relatorio-solicitacoes-${today()}.xlsx`, { compression: true });
}
function renderHistory() {
  const panel = $("#historyPanel"); panel.innerHTML = "";
  if (!data.inspections.length) { panel.append(empty()); return; }
  panel.innerHTML = data.inspections.slice(0, 30).map((inspection) => {
    const issueCount = inspection.items.filter((item) => item.status === "issue").length;
    return `<article class="history-card"><div><b>Prefixo ${esc(inspection.vehiclePrefix || "—")} · ${esc(inspection.vehiclePlate)} · ${esc(inspection.driver)}</b><p class="meta">${esc(inspection.odometer ?? "—")} km · ${dateTime(inspection.createdAt)}${inspection.notes ? ` · ${esc(inspection.notes)}` : ""}</p></div>${issueCount ? `<span class="chip grave">${issueCount} ocorrência(s)</span>` : `<span class="chip ok">OK</span>`}</article>`;
  }).join("");
}
function renderVehicles() {
  const panel = $("#vehiclesPanel");
  panel.innerHTML = `<div class="section-action"><h3>Veículos cadastrados</h3><button class="add-button" id="newVehicle">+ Cadastrar</button></div>${data.vehicles.length ? data.vehicles.map((vehicle) => `<article class="vehicle-card"><div><h3>Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} <span class="vehicle-label">· ${esc(vehicle.model || vehicle.type)}</span></h3><p>${esc(vehicle.ownerName)}${vehicle.contract ? ` · Contrato: ${esc(vehicle.contract)}` : ""}${vehicle.odometer !== "" ? ` · ${esc(vehicle.odometer)} km` : ""}</p></div><button class="small-button" data-edit-vehicle="${vehicle.id}">Editar</button></article>`).join("") : ""}`;
}
function openVehicleDialog(id = "") {
  const vehicle = vehicleById(id);
  $("#vehicleDialogTitle").textContent = vehicle ? "Editar veículo" : "Novo veículo";
  $("#editVehicleId").value = vehicle?.id || "";
  $("#vehiclePrefix").value = vehicle?.prefix || ""; $("#vehiclePlate").value = vehicle?.plate || ""; $("#vehicleType").value = vehicle?.type || "Caminhão"; $("#vehicleModel").value = vehicle?.model || ""; $("#vehicleContract").value = vehicle?.contract || ""; $("#vehicleUrbamContract").value = vehicle?.urbamContract || ""; $("#vehicleOdometer").value = vehicle?.odometer ?? "";
  $("#vehicleOwnerName").value = vehicle?.ownerName || ""; $("#vehicleOwnerPhone").value = vehicle?.ownerPhone || ""; $("#vehicleEmail").value = vehicle?.email || "";
  $("#vehicleDialog").showModal();
}
function saveVehicle() {
  const id = $("#editVehicleId").value;
  const detail = { prefix: $("#vehiclePrefix").value.trim(), plate: $("#vehiclePlate").value.trim().toUpperCase(), type: $("#vehicleType").value, model: $("#vehicleModel").value.trim(), contract: $("#vehicleContract").value.trim(), urbamContract: $("#vehicleUrbamContract").value.trim(), odometer: $("#vehicleOdometer").value === "" ? "" : Number($("#vehicleOdometer").value), ownerName: $("#vehicleOwnerName").value.trim(), ownerPhone: phoneOnly($("#vehicleOwnerPhone").value), email: $("#vehicleEmail").value.trim() };
  if (!detail.prefix || !detail.plate || !detail.ownerName) { $("#vehicleForm").reportValidity(); return; }
  if (id) Object.assign(vehicleById(id), detail); else data.vehicles.push({ id: crypto.randomUUID(), ...detail });
  saveData(); $("#vehicleDialog").close(); renderControl(); renderStart();
}
function sendIssueWhatsApp(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  const vehicle = vehicleById(issue.vehicleId) || { plate: issue.vehiclePlate, type: issue.vehicleType };
  const message = buildWhatsAppMessage(vehicle, [issue]);
  const target = issue.ownerPhone || data.settings.maintenancePhone;
  if (!target) return alert("Cadastre o número de WhatsApp do responsável ou da base nas configurações.");
  window.open(whatsappLink(target, message), "_blank", "noopener");
}
function maintenanceFormValues() { return { status: $("#maintenanceStatus").value, scheduledAt: $("#maintenanceScheduledAt").value, provider: $("#maintenanceProvider").value.trim(), feedback: $("#maintenanceFeedback").value.trim(), updatedAt: new Date().toISOString() }; }
function buildMaintenanceMessage(issue) {
  const maintenance = maintenanceOf(issue);
  return `*RETORNO DE MANUTENÇÃO — ${maintenance.status.toUpperCase()}*\n\nVeículo: Prefixo ${issue.vehiclePrefix || "—"} · ${issue.vehiclePlate} (${issue.vehicleModel || issue.vehicleType})\nQuilometragem: ${issue.odometer ?? "Não informada"} km\nOcorrência: ${issue.itemName}\nGravidade: ${issue.severity}\nMotorista: ${issue.driver}\n${maintenance.scheduledAt ? `Agendamento: ${dateTime(maintenance.scheduledAt)}\n` : ""}${maintenance.provider ? `Oficina / responsável: ${maintenance.provider}\n` : ""}${maintenance.feedback ? `Retorno: ${maintenance.feedback}\n` : ""}\nSolicitação original: ${issue.description}`;
}
function buildMaintenanceGroupMessage() {
  const issues = data.issues.filter((issue) => issue.status === "aberta" || maintenanceOf(issue).status !== "Concluída")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!issues.length) return "*STATUS DA MANUTENÇÃO*\n\nNão há ocorrências em aberto.";
  const list = issues.map((issue, index) => {
    const maintenance = maintenanceOf(issue);
    const schedule = maintenance.scheduledAt ? `\nAgendamento: ${dateTime(maintenance.scheduledAt)}` : "";
    const provider = maintenance.provider ? `\nOficina: ${maintenance.provider}` : "";
    return `${index + 1}. Prefixo ${issue.vehiclePrefix || "—"} · ${issue.vehiclePlate}\nOcorrência: ${issue.itemName}\nSituação: ${maintenance.status}${schedule}${provider}${maintenance.feedback ? `\nRetorno: ${maintenance.feedback}` : ""}`;
  }).join("\n\n");
  return `*STATUS DAS OCORRÊNCIAS — MANUTENÇÃO*\nAtualizado em ${dateTime(new Date())}\n\n${list}`;
}
function openMaintenanceIssue(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  const maintenance = maintenanceOf(issue);
  $("#maintenanceIssueId").value = issue.id;
  $("#maintenanceDialogTitle").textContent = `${issue.vehiclePlate} · ${issue.itemName}`;
  $("#maintenanceIssueSummary").textContent = `${issue.severity} · ${issue.description}`;
  $("#maintenanceStatus").value = maintenance.status;
  $("#maintenanceScheduledAt").value = maintenance.scheduledAt ? maintenance.scheduledAt.slice(0, 16) : "";
  $("#maintenanceProvider").value = maintenance.provider;
  $("#maintenanceFeedback").value = maintenance.feedback;
  $("#maintenanceDialog").showModal();
}
function sendMaintenanceWhatsApp() {
  const target = data.settings.maintenanceGroupPhone || data.settings.maintenancePhone;
  if (!target) return alert("Cadastre o WhatsApp do grupo de manutenção em Configurações da base.");
  window.open(whatsappLink(target, buildMaintenanceGroupMessage()), "_blank", "noopener");
}
function saveMaintenance() {
  const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (!issue) return;
  issue.maintenance = maintenanceFormValues();
  if (issue.maintenance.status === "Concluída") { issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); }
  else if (issue.status === "resolvida") { issue.status = "aberta"; delete issue.resolvedAt; }
  saveData();
  if (data.settings.webhookUrl) void sendToIntegration({ type: "maintenance-update", issue, maintenance: issue.maintenance });
  $("#maintenanceDialog").close(); renderControl();
  if (issue.maintenance.status === "Agendada") sendMaintenanceWhatsApp();
}
function closeIssue(issueId) { const issue = data.issues.find((entry) => entry.id === issueId); if (issue) { issue.maintenance = { ...maintenanceOf(issue), status: "Concluída", updatedAt: new Date().toISOString() }; issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); saveData(); if (data.settings.webhookUrl) void sendToIntegration({ type: "maintenance-update", issue, maintenance: issue.maintenance }); renderControl(); } }
function saveSettings() { data.settings.webhookUrl = $("#webhookUrl").value.trim(); data.settings.maintenancePhone = phoneOnly($("#maintenancePhone").value); data.settings.maintenanceGroupPhone = phoneOnly($("#maintenanceGroupPhone").value); data.settings.leaderPhone = phoneOnly($("#leaderPhone").value); data.settings.fleetManagerPhone = phoneOnly($("#fleetManagerPhone").value); saveData(); $("#settingsDialog").close(); }
function dismissInstallBanner() { sessionStorage.setItem("checkfrota-install-dismissed", "1"); $("#installBanner").hidden = true; }

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIos() { return /iphone|ipad|ipod/i.test(window.navigator.userAgent); }
function showInstallBanner() {
  if (!isInstalled() && sessionStorage.getItem("checkfrota-install-dismissed") !== "1") $("#installBanner").hidden = false;
}
function installInstructions() {
  const ios = isIos();
  $("#installDialogContent").innerHTML = ios
    ? `<p class="dialog-copy">No iPhone ou iPad, a instalação é feita pelo menu do Safari.</p><ol class="install-steps"><li>Toque no ícone <b>Compartilhar</b> (quadrado com seta para cima).</li><li>Role o menu e toque em <b>Adicionar à Tela de Início</b>.</li><li>Confirme em <b>Adicionar</b>.</li></ol><p class="install-note">Depois disso, o CheckFrota aparece com o próprio ícone na tela inicial e abre sem a barra do navegador.</p>`
    : `<p class="dialog-copy">No Android, use o botão abaixo. Se ele não aparecer, abra o menu ⋮ do navegador e escolha <b>Instalar aplicativo</b> ou <b>Adicionar à tela inicial</b>.</p><p class="install-note">A instalação não ocupa muito espaço e permite abrir o checklist como um aplicativo normal.</p><button class="primary-button" id="installFromDialog">Instalar CheckFrota</button>`;
  $("#installDialog").showModal();
}
async function requestInstall() {
  if (isInstalled()) return;
  if (!deferredInstallPrompt) { installInstructions(); return; }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  if (choice.outcome === "accepted") {
    $("#installBanner").hidden = true;
  } else {
    installInstructions();
  }
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, [data-go]"); if (!target) return;
  if (target.dataset.go) showScreen(target.dataset.go);
  if (target.id === "startChecklist") beginChecklist();
  if (target.dataset.state === "ok") { current.states[target.dataset.item] = { status: "ok" }; renderChecklist(); }
  if (target.dataset.state === "issue") openIssue(target.dataset.item);
  if (target.id === "reviewChecklist") reviewChecklist();
  if (target.id === "submitChecklist") submitChecklist();
  if (target.dataset.severity) { issueDraft.severity = target.dataset.severity; $$(".severity").forEach((button) => button.classList.toggle("active", button === target)); }
  if (target.id === "saveIssue") { event.preventDefault(); saveIssue(); }
  if (target.id === "openSettings") { $("#webhookUrl").value = data.settings.webhookUrl; $("#maintenancePhone").value = data.settings.maintenancePhone; $("#maintenanceGroupPhone").value = data.settings.maintenanceGroupPhone || ""; $("#leaderPhone").value = data.settings.leaderPhone || ""; $("#fleetManagerPhone").value = data.settings.fleetManagerPhone || ""; $("#settingsDialog").showModal(); }
  if (target.id === "installApp" || target.id === "installBannerButton" || target.id === "installFromDialog" || target.dataset.install === "app") requestInstall();
  if (target.id === "dismissInstallBanner") dismissInstallBanner();
  if (target.id === "closeInstallDialog") $("#installDialog").close();
  if (target.id === "newVehicle") openVehicleDialog();
  if (target.dataset.editVehicle) openVehicleDialog(target.dataset.editVehicle);
  if (target.dataset.whatsappIssue) sendIssueWhatsApp(target.dataset.whatsappIssue);
  if (target.dataset.maintenanceIssue) openMaintenanceIssue(target.dataset.maintenanceIssue);
  if (target.dataset.maintenanceWhatsapp) sendMaintenanceWhatsApp(target.dataset.maintenanceWhatsapp);
  if (target.dataset.closeIssue) closeIssue(target.dataset.closeIssue);
  if (target.id === "sendMaintenanceUpdate") { const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (issue) { issue.maintenance = maintenanceFormValues(); sendMaintenanceWhatsApp(); } }
  if (target.id === "downloadReport") downloadReport();
});
$("#vehicleSelect").addEventListener("change", renderVehicleOwner);
$("#dismissInstallBanner").addEventListener("click", dismissInstallBanner);
$("#issueForm").addEventListener("submit", (event) => { event.preventDefault(); saveIssue(); });
$("#vehicleForm").addEventListener("submit", (event) => { event.preventDefault(); saveVehicle(); });
$("#settingsForm").addEventListener("submit", (event) => { event.preventDefault(); saveSettings(); });
$("#maintenanceForm").addEventListener("submit", (event) => { event.preventDefault(); saveMaintenance(); });
$$(".tab").forEach((tab) => tab.addEventListener("click", () => { $$(".tab").forEach((button) => button.classList.toggle("active", button === tab)); $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${tab.dataset.tab}Panel`)); }));

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt = event; showInstallBanner(); });
window.addEventListener("appinstalled", () => { document.body.classList.add("app-installed"); $("#installBanner").hidden = true; });
if (isInstalled()) document.body.classList.add("app-installed"); else window.addEventListener("load", showInstallBanner);
renderStart();

