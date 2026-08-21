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
  settings: { maintenancePhone: "5512988400316", webhookUrl: "" },
  vehicles: [
    { id: "v1", plate: "ABC-1D23", type: "Caminhão", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "" },
    { id: "v2", plate: "DEF-4G56", type: "Caminhão", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "" },
    { id: "v3", plate: "GHI-7J89", type: "Carro", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "" },
  ],
  inspections: [],
  issues: [],
};

let data = loadData();
let current = { driver: "", vehicleId: "", states: {}, notes: "" };
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
    return stored ? { ...initialData, ...stored, settings: { ...initialData.settings, ...stored.settings } } : structuredClone(initialData);
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
  if (!$("#driverName").value) $("#driverName").value = rememberedDriver;
  select.innerHTML = `<option value="">Selecione o veículo</option>${data.vehicles.map((vehicle) => `<option value="${vehicle.id}">${esc(vehicle.plate)} · ${esc(vehicle.type)}</option>`).join("")}`;
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
  const vehicleId = $("#vehicleSelect").value;
  if (!driver) return alert("Informe seu nome antes de iniciar.");
  if (!vehicleId) return alert("Selecione o veículo que será utilizado.");
  current = { driver, vehicleId, states: Object.fromEntries(CHECKLIST.map((item) => [item.id, { status: "pending" }])), notes: "" };
  localStorage.setItem("checkfrota-driver", driver);
  const vehicle = vehicleById(vehicleId);
  $("#checklistVehicle").textContent = `${vehicle.plate} · ${vehicle.type}`;
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
    <div class="review-row"><span>Veículo</span><b>${esc(vehicleById(current.vehicleId).plate)}</b></div>
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
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), driver: current.driver,
    vehicleId: vehicle.id, vehiclePlate: vehicle.plate, vehicleType: vehicle.type, notes: current.notes,
    items: CHECKLIST.map((item) => ({ ...item, ...current.states[item.id] })),
  };
  const currentIssues = getCurrentIssues();
  const newIssues = currentIssues.map((issue) => ({
    id: crypto.randomUUID(), inspectionId: inspection.id, status: "aberta", createdAt: inspection.createdAt,
    driver: current.driver, vehicleId: vehicle.id, vehiclePlate: vehicle.plate, vehicleType: vehicle.type,
    ownerName: vehicle.ownerName, ownerPhone: vehicle.ownerPhone, email: vehicle.email,
    itemName: issue.item.name, severity: issue.severity, description: issue.description, photoName: issue.photoName,
  }));
  data.inspections.unshift(inspection);
  data.issues.unshift(...newIssues);
  saveData();
  const sendResult = await sendToIntegration({ inspection, vehicle, issues: newIssues });
  showCompletion(vehicle, newIssues, sendResult);
  current = { driver: current.driver, vehicleId: vehicle.id, states: {}, notes: "" };
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
  return `*OCORRÊNCIA DE FROTA — ${severity.toUpperCase()}*\n\nVeículo: ${vehicle.plate} (${vehicle.type})\nMotorista: ${issues[0]?.driver || current.driver || "Não informado"}\nData: ${dateTime(createdAt)}\n\nOcorrência(s):\n${list}\n\nSolicitamos avaliação e manutenção do veículo.`;
}
function whatsappLink(phone, message) { return `https://wa.me/${phoneOnly(phone)}?text=${encodeURIComponent(message)}`; }
function showCompletion(vehicle, issues, sendResult) {
  const severe = issues.some((issue) => issue.severity === "Grave");
  $("#successTitle").textContent = issues.length ? (severe ? "Veículo com bloqueio de deslocamento." : "Ocorrência registrada.") : "Tudo certo para seguir.";
  $("#successText").textContent = issues.length ? `O formulário foi salvo com ${issues.length} ocorrência(s). ${sendResult.sent ? "A integração de e-mail foi acionada." : "Configure a integração para o envio automático por e-mail."}` : "Checklist concluído e registrado no controle da frota.";
  const actions = $("#dispatchActions");
  if (!issues.length) { actions.innerHTML = ""; showScreen("success"); return; }
  const message = buildWhatsAppMessage(vehicle, issues);
  const buttons = [];
  if (data.settings.maintenancePhone) buttons.push(`<a href="${whatsappLink(data.settings.maintenancePhone, message)}" target="_blank" rel="noopener">Enviar aviso para a base no WhatsApp</a>`);
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
  renderIssues(); renderHistory(); renderVehicles();
}
function empty() { return $("#emptyStateTemplate").content.cloneNode(true); }
function renderIssues() {
  const panel = $("#issuesPanel"); panel.innerHTML = "";
  const issues = data.issues.filter((issue) => issue.status === "aberta").sort((a,b) => severityRank(b.severity) - severityRank(a.severity) || new Date(b.createdAt)-new Date(a.createdAt));
  if (!issues.length) { panel.append(empty()); return; }
  panel.innerHTML = issues.map((issue) => `<article class="issue-card ${issue.severity.toLowerCase()}">
      <div class="card-heading"><div><h3>${esc(issue.itemName)}</h3><p class="vehicle-label">${esc(issue.vehiclePlate)} · ${esc(issue.vehicleType)}</p></div><span class="chip ${issue.severity.toLowerCase()}">${esc(issue.severity)}</span></div>
      <p class="issue-desc">${esc(issue.description)}</p>
      <p class="meta">${esc(issue.driver)} · ${dateTime(issue.createdAt)}${issue.photoName ? ` · 📷 ${esc(issue.photoName)}` : ""}</p>
      <div class="issue-actions"><button class="small-button whatsapp" data-whatsapp-issue="${issue.id}">WhatsApp</button><button class="small-button" data-close-issue="${issue.id}">Marcar resolvida</button></div>
    </article>`).join("");
}
function renderHistory() {
  const panel = $("#historyPanel"); panel.innerHTML = "";
  if (!data.inspections.length) { panel.append(empty()); return; }
  panel.innerHTML = data.inspections.slice(0, 30).map((inspection) => {
    const issueCount = inspection.items.filter((item) => item.status === "issue").length;
    return `<article class="history-card"><div><b>${esc(inspection.vehiclePlate)} · ${esc(inspection.driver)}</b><p class="meta">${dateTime(inspection.createdAt)}${inspection.notes ? ` · ${esc(inspection.notes)}` : ""}</p></div>${issueCount ? `<span class="chip grave">${issueCount} ocorrência(s)</span>` : `<span class="chip ok">OK</span>`}</article>`;
  }).join("");
}
function renderVehicles() {
  const panel = $("#vehiclesPanel");
  panel.innerHTML = `<div class="section-action"><h3>Veículos cadastrados</h3><button class="add-button" id="newVehicle">+ Cadastrar</button></div>${data.vehicles.length ? data.vehicles.map((vehicle) => `<article class="vehicle-card"><div><h3>${esc(vehicle.plate)} <span class="vehicle-label">· ${esc(vehicle.type)}</span></h3><p>${esc(vehicle.ownerName)}${vehicle.email ? ` · ${esc(vehicle.email)}` : ""}</p></div><button class="small-button" data-edit-vehicle="${vehicle.id}">Editar</button></article>`).join("") : ""}`;
}
function openVehicleDialog(id = "") {
  const vehicle = vehicleById(id);
  $("#vehicleDialogTitle").textContent = vehicle ? "Editar veículo" : "Novo veículo";
  $("#editVehicleId").value = vehicle?.id || "";
  $("#vehiclePlate").value = vehicle?.plate || ""; $("#vehicleType").value = vehicle?.type || "Caminhão";
  $("#vehicleOwnerName").value = vehicle?.ownerName || ""; $("#vehicleOwnerPhone").value = vehicle?.ownerPhone || ""; $("#vehicleEmail").value = vehicle?.email || "";
  $("#vehicleDialog").showModal();
}
function saveVehicle() {
  const id = $("#editVehicleId").value;
  const detail = { plate: $("#vehiclePlate").value.trim().toUpperCase(), type: $("#vehicleType").value, ownerName: $("#vehicleOwnerName").value.trim(), ownerPhone: phoneOnly($("#vehicleOwnerPhone").value), email: $("#vehicleEmail").value.trim() };
  if (!detail.plate || !detail.ownerName) { $("#vehicleForm").reportValidity(); return; }
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
function closeIssue(issueId) { const issue = data.issues.find((entry) => entry.id === issueId); if (issue) { issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); saveData(); renderControl(); } }
function saveSettings() { data.settings.webhookUrl = $("#webhookUrl").value.trim(); data.settings.maintenancePhone = phoneOnly($("#maintenancePhone").value); saveData(); $("#settingsDialog").close(); }
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
  if (target.id === "openSettings") { $("#webhookUrl").value = data.settings.webhookUrl; $("#maintenancePhone").value = data.settings.maintenancePhone; $("#settingsDialog").showModal(); }
  if (target.id === "installApp" || target.id === "installBannerButton" || target.id === "installFromDialog" || target.dataset.install === "app") requestInstall();
  if (target.id === "dismissInstallBanner") dismissInstallBanner();
  if (target.id === "closeInstallDialog") $("#installDialog").close();
  if (target.id === "newVehicle") openVehicleDialog();
  if (target.dataset.editVehicle) openVehicleDialog(target.dataset.editVehicle);
  if (target.dataset.whatsappIssue) sendIssueWhatsApp(target.dataset.whatsappIssue);
  if (target.dataset.closeIssue) closeIssue(target.dataset.closeIssue);
});
$("#vehicleSelect").addEventListener("change", renderVehicleOwner);
$("#dismissInstallBanner").addEventListener("click", dismissInstallBanner);
$("#issueForm").addEventListener("submit", (event) => { event.preventDefault(); saveIssue(); });
$("#vehicleForm").addEventListener("submit", (event) => { event.preventDefault(); saveVehicle(); });
$("#settingsForm").addEventListener("submit", (event) => { event.preventDefault(); saveSettings(); });
$$(".tab").forEach((tab) => tab.addEventListener("click", () => { $$(".tab").forEach((button) => button.classList.toggle("active", button === tab)); $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${tab.dataset.tab}Panel`)); }));

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt = event; showInstallBanner(); });
window.addEventListener("appinstalled", () => { document.body.classList.add("app-installed"); $("#installBanner").hidden = true; });
if (isInstalled()) document.body.classList.add("app-installed"); else window.addEventListener("load", showInstallBanner);
renderStart();
