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
const BASES = { Vertical: "5512981567218", Abrigo: "5512997884887", Horizontal: "5512988400697" };
const DRIVER_NOTIFICATION_PHONE = "5512988400316";

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
  removedVehicleIds: [],
};

// Responsáveis recuperados da relação original de frota.
const RESPONSIBLES_BY_PREFIX = {
  "1446": "Locadora de Veículos Authana Ltda EPP", "1447": "Locadora de Veículos Authana Ltda EPP",
  "1456": "Locadora de Veículos Authana Ltda EPP", "1466": "Locadora de Veículos Authana Ltda EPP",
  "1894": "SGMK", "1922": "SGMK", "1484": "Locadora de Veículos Authana Ltda",
  "1485": "Locadora de Veículos Authana Ltda", "1486": "Locadora de Veículos Authana Ltda",
  "1799": "SGMK", "1969": "ADR Transportes e Locações", "1126": "Job Locações",
  "1919": "JVN Comércio e Transportes Ltda", "1082": "Máximo Serviços e Locações Ltda",
  "1084": "Máximo Serviços e Locações Ltda", "1577": "Franco Castilho & Castilho",
  "1967": "SGMK", "1968": "SGMK", "157": "URBAM",
};
const OWNER_PHONE_BY_PREFIX = {
  "1446": "5512987003695", "1447": "5512987003695", "1456": "5512987003695", "1466": "5512987003695", "1484": "5512987003695", "1485": "5512987003695", "1486": "5512987003695",
  "1894": "5512988201150", "1922": "5512988201150", "1799": "5512988201150", "1967": "5512988201150", "1968": "5512988201150",
  "1969": "5512988604088", "1126": "5512996510614", "1919": "553597804552", "1082": "5512974059535", "1084": "5512974059535", "1577": "5512974034611",
};
function withFleetResponsible(vehicle) { return { ...vehicle, ownerName: RESPONSIBLES_BY_PREFIX[vehicle.prefix] || vehicle.ownerName, ownerPhone: OWNER_PHONE_BY_PREFIX[vehicle.prefix] || vehicle.ownerPhone }; }

let data = loadData();
let current = { driver: "", driverPhone: DRIVER_NOTIFICATION_PHONE, baseName: "", basePhone: "", vehicleId: "", odometer: "", states: {}, notes: "" };
let issueDraft = { itemId: null, severity: "Leve" };
let deferredInstallPrompt = null;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const esc = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const today = () => new Date().toISOString().slice(0, 10);
function formatPhone(phone = "") { const digits = phoneOnly(phone); return digits.length === 13 && digits.startsWith("55") ? `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}` : (digits ? `+${digits}` : ""); }
const dateTime = (value) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const phoneOnly = (phone = "") => phone.replace(/\D/g, "");

const CLOUD = window.CHECKFROTA_SUPABASE;
function cloudToken() { return sessionStorage.getItem("checkfrota-supabase-token") || ""; }
function cloudHeaders(json = true) { const token = cloudToken(); return { apikey: CLOUD?.publishableKey || "", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(json ? { "Content-Type": "application/json" } : {}) }; }
async function cloudRequest(path, options = {}) { if (!CLOUD?.url) return null; const response = await fetch(`${CLOUD.url}${path}`, { ...options, headers: { ...cloudHeaders(options.json !== false), ...(options.headers || {}) } }); if (!response.ok) throw new Error(`Supabase: ${response.status}`); return response.status === 204 ? null : response.json(); }
async function cloudSave(table, row) {
  if (!CLOUD?.url) throw new Error("A conexão com o banco de dados não está configurada.");
  const response = await fetch(`${CLOUD.url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...cloudHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Banco de dados: ${response.status}${detail ? ` — ${detail}` : ""}`);
  }
  return true;
}
async function compressPhoto(file) {
  if (!file?.type?.startsWith("image/")) return file;
  const image = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  return blob ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
}
async function uploadIssuePhoto(issue, file) { if (!file || !CLOUD?.url) return ""; const path = `${issue.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`; try { const response = await fetch(`${CLOUD.url}/storage/v1/object/issue-photos/${path}`, { method: "POST", headers: { ...cloudHeaders(false), "Content-Type": file.type || "image/jpeg", "x-upsert": "false" }, body: file }); if (!response.ok) throw new Error(`Foto: ${response.status}`); return path; } catch (error) { console.warn("Não foi possível enviar a foto", error); return ""; } }
async function issuePhotoLink(issue) { if (!issue?.photoPath || !CLOUD?.url) return ""; try { const response = await fetch(`${CLOUD.url}/storage/v1/object/sign/issue-photos/${issue.photoPath}`, { method: "POST", headers: cloudHeaders(), body: JSON.stringify({ expiresIn: 86400 }) }); const result = await response.json(); return response.ok && result.signedURL ? `${CLOUD.url}/storage/v1${result.signedURL}` : ""; } catch { return ""; } }
async function openIssuePhoto(issueId) { const issue = data.issues.find((entry) => entry.id === issueId); if (!issue?.photoPath) return alert("Esta ocorrência não possui foto armazenada no banco de dados."); const preview = window.open("", "_blank", "noopener"); try { const response = await fetch(`${CLOUD.url}/storage/v1/object/sign/issue-photos/${issue.photoPath}`, { method: "POST", headers: cloudHeaders(), body: JSON.stringify({ expiresIn: 3600 }) }); const result = await response.json(); if (!response.ok || !result.signedURL) throw new Error("Não foi possível liberar a foto."); preview.location.replace(`${CLOUD.url}/storage/v1${result.signedURL}`); } catch (error) { preview.close(); alert(error.message || "Não foi possível abrir a foto."); } }
async function cloudSyncSubmission(inspection, issues) { await cloudSave("fleet_inspections", { id: inspection.id, vehicle_id: null, data: inspection }); await Promise.all(issues.map((issue) => cloudSave("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: null, status: issue.status, data: issue }))); }
async function syncLocalBacklog() {
  if (!CLOUD?.url || !data.issues?.length) return;
  try {
    await Promise.all((data.inspections || []).map((inspection) => cloudSave("fleet_inspections", { id: inspection.id, vehicle_id: null, data: inspection })));
    await Promise.all(data.issues.map((issue) => cloudSave("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: null, status: issue.status || "aberta", data: issue })));
  } catch (error) { console.warn("Não foi possível migrar os chamados deste aparelho", error); }
}
async function loadCloudManager() { if (!cloudToken()) return; try { const [issues, inspections, vehicles] = await Promise.all([cloudRequest("/rest/v1/fleet_issues?select=data&order=created_at.desc"), cloudRequest("/rest/v1/fleet_inspections?select=data&order=created_at.desc"), cloudRequest("/rest/v1/fleet_vehicles?select=data")]); if (issues) data.issues = issues.map((row) => row.data); if (inspections) data.inspections = inspections.map((row) => row.data); if (vehicles?.length) data.vehicles = vehicles.map((row) => row.data); saveData(); renderControl(); } catch (error) { console.warn("Não foi possível carregar a nuvem", error); } }

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) { const initial = structuredClone(initialData); initial.vehicles = initial.vehicles.map(withFleetResponsible); return initial; }
    // Atualiza aparelhos que ainda guardam os três veículos de demonstração,
    // preservando veículos reais já cadastrados manualmente pela base.
    const storedVehicles = Array.isArray(stored.vehicles) ? stored.vehicles : [];
    const removedVehicleIds = Array.isArray(stored.removedVehicleIds) ? stored.removedVehicleIds : [];
    const seededVehicles = initialData.vehicles.filter((seed) => !removedVehicleIds.includes(seed.id)).map((seed) => {
      const storedVehicle = storedVehicles.find((vehicle) => vehicle.prefix === seed.prefix || vehicle.plate === seed.plate);
      const merged = { ...withFleetResponsible(seed), ...(storedVehicle || {}) };
      if (!storedVehicle?.ownerName || storedVehicle.ownerName === "Responsável a cadastrar") merged.ownerName = RESPONSIBLES_BY_PREFIX[seed.prefix] || merged.ownerName;
      if (!storedVehicle?.ownerPhone) merged.ownerPhone = OWNER_PHONE_BY_PREFIX[seed.prefix] || merged.ownerPhone;
      return merged;
    });
    const customVehicles = storedVehicles.filter((vehicle) =>
      !["v1", "v2", "v3"].includes(vehicle.id) &&
      !initialData.vehicles.some((seed) => seed.prefix === vehicle.prefix || seed.plate === vehicle.plate)
    );
    return { ...initialData, ...stored, removedVehicleIds, vehicles: [...seededVehicles, ...customVehicles], settings: { ...initialData.settings, ...stored.settings } };
  } catch { return structuredClone(initialData); }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function vehicleById(id) { return data.vehicles.find((vehicle) => vehicle.id === id); }
function checkById(id) { return CHECKLIST.find((item) => item.id === id); }

function showScreen(name) {
  $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "controle") { renderControl(); void loadCloudManager(); }
  if (name === "inicio") renderStart();
}

function renderStart() {
  const select = $("#vehicleSelect");
  const rememberedDriver = localStorage.getItem("checkfrota-driver") || "";
  const rememberedBase = localStorage.getItem("checkfrota-base") || "";
  if (!$("#driverName").value) $("#driverName").value = rememberedDriver;
  if (!$("#baseSelect").value) $("#baseSelect").value = rememberedBase;
  select.innerHTML = `<option value="">Selecione o veículo</option>${data.vehicles.map((vehicle) => `<option value="${vehicle.id}">Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} · ${esc(vehicle.model || vehicle.type)}</option>`).join("")}`;
  if (current.vehicleId && vehicleById(current.vehicleId)) select.value = current.vehicleId;
  renderVehicleOwner();
  renderBasePhone();
  const todaysInspections = data.inspections.filter((inspection) => inspection.createdAt.slice(0, 10) === today());
  $("#dailyDone").textContent = todaysInspections.length;
  $("#openIssues").textContent = data.issues.filter((issue) => issue.status === "aberta").length;
}
function renderBasePhone() { const base = $("#baseSelect").value; const phone = BASES[base] || ""; const formatted = phone.replace(/^55(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3"); $("#basePhone").textContent = base ? `Telefone da Base ${base}: ${formatted}` : "Selecione a base para assumir o telefone de envio."; }
function renderVehicleOwner() {
  const vehicle = vehicleById($("#vehicleSelect").value);
  $("#vehicleOwner").textContent = vehicle ? `Responsável: ${vehicle.ownerName}${vehicle.email ? ` · ${vehicle.email}` : ""}` : "";
}

function beginChecklist() {
  const driver = $("#driverName").value.trim();
  const driverPhone = DRIVER_NOTIFICATION_PHONE;
  const baseName = $("#baseSelect").value;
  const basePhone = BASES[baseName] || "";
  const vehicleId = $("#vehicleSelect").value;
  const odometer = Number($("#odometer").value);
  if (!driver) return alert("Informe seu nome antes de iniciar.");
  if (!vehicleId) return alert("Selecione o veículo que será utilizado.");
  if (!basePhone) return alert("Selecione a base responsável pela aprovação.");
  if (!Number.isFinite(odometer) || odometer < 0) return alert("Informe a quilometragem atual do veículo.");
  current = { driver, driverPhone, baseName, basePhone, vehicleId, odometer, states: Object.fromEntries(CHECKLIST.map((item) => [item.id, { status: "pending" }])), notes: "" };
  localStorage.setItem("checkfrota-driver", driver);
  localStorage.setItem("checkfrota-base", baseName);
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
    issue: { severity: issueDraft.severity, description, photoName: photo?.name || "", photoFile: photo || null },
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
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), driver: current.driver, driverPhone: current.driverPhone, baseName: current.baseName, basePhone: current.basePhone,
    vehicleId: vehicle.id, vehiclePrefix: vehicle.prefix || "", vehiclePlate: vehicle.plate, vehicleType: vehicle.type, vehicleModel: vehicle.model || "", odometer: current.odometer, notes: current.notes,
    items: CHECKLIST.map((item) => ({ ...item, ...current.states[item.id] })),
  };
  const currentIssues = getCurrentIssues();
  const newIssues = currentIssues.map((issue) => ({
    id: crypto.randomUUID(), inspectionId: inspection.id, status: "aberta", createdAt: inspection.createdAt,
    driver: current.driver, driverPhone: current.driverPhone, baseName: current.baseName, basePhone: current.basePhone, vehicleId: vehicle.id, vehiclePrefix: vehicle.prefix || "", vehiclePlate: vehicle.plate, vehicleType: vehicle.type, vehicleModel: vehicle.model || "", odometer: current.odometer,
    ownerName: vehicle.ownerName, ownerPhone: vehicle.ownerPhone, email: vehicle.email,
    itemName: issue.item.name, severity: issue.severity, description: issue.description, photoName: issue.photoName, _photoFile: issue.photoFile || null,
    maintenance: { status: "Pendente", scheduledAt: "", provider: "", feedback: "", updatedAt: "" },
  }));
  await Promise.all(newIssues.map(async (issue) => { const compressedPhoto = await compressPhoto(issue._photoFile); issue.photoSize = compressedPhoto?.size || 0; issue.photoPath = await uploadIssuePhoto(issue, compressedPhoto); delete issue._photoFile; }));
  vehicle.odometer = current.odometer;
  data.inspections.unshift(inspection);
  data.issues.unshift(...newIssues);
  saveData();
  try { await cloudSyncSubmission(inspection, newIssues); }
  catch (error) { console.warn("Não foi possível gravar o chamado no banco", error); alert("O chamado foi salvo neste aparelho, mas não foi enviado ao painel da Gestão. Verifique a conexão e envie novamente."); }
  const sendResult = await sendToIntegration({ inspection, vehicle, issues: newIssues });
  await showCompletion(vehicle, newIssues, sendResult);
  current = { driver: current.driver, driverPhone: current.driverPhone, baseName: current.baseName, basePhone: current.basePhone, vehicleId: vehicle.id, odometer: "", states: {}, notes: "" };
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
  return `*OCORRÊNCIA DE FROTA — ${severity.toUpperCase()}*\n\nVeículo: Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate} (${vehicle.model || vehicle.type})\nQuilometragem: ${issues[0]?.odometer ?? vehicle.odometer ?? "Não informada"} km\nMotorista: ${issues[0]?.driver || current.driver || "Não informado"}\nBase: ${issues[0]?.baseName || current.baseName || "Não informada"}\nData: ${dateTime(createdAt)}\n\nOcorrência(s):\n${list}\n\nSolicitamos avaliação e manutenção do veículo.`;
}
function whatsappLink(phone, message) { return `https://wa.me/${phoneOnly(phone)}?text=${encodeURIComponent(message)}`; }
async function approvalUrl(vehicle, issues) {
  const first = issues[0] || {};
  const problem = issues.map((issue) => `${issue.itemName || issue.item?.name}: ${issue.description}`).join(" | ");
  const params = new URLSearchParams({
    id: `MAN-${String(first.id || Date.now()).replaceAll("-", "").slice(-8)}`,
    prefix: vehicle.prefix || "", type: vehicle.model || vehicle.type, plate: vehicle.plate,
    driver: first.driver || current.driver || "", driverPhone: first.driverPhone || current.driverPhone || "",
    leaderPhone: first.basePhone || current.basePhone || data.settings.leaderPhone || "", maintenancePhone: data.settings.maintenancePhone || "",
    km: String(first.odometer ?? vehicle.odometer ?? ""), baseName: first.baseName || current.baseName || "Não informada", priority: highestSeverity(issues), location: "", problem,
  });
  const photoUrl = await issuePhotoLink(first);
  if (photoUrl) params.set("photoUrl", photoUrl);
  if (first.photoName) params.set("photoName", first.photoName);
  return `${location.origin}${location.pathname.replace(/[^/]*$/, "aprovacao.html")}?v=52&${params.toString()}`;
}
async function showCompletion(vehicle, issues, sendResult) {
  const severe = issues.some((issue) => issue.severity === "Grave");
  $("#successTitle").textContent = issues.length ? (severe ? "Veículo com bloqueio de deslocamento." : "Ocorrência registrada.") : "Tudo certo para seguir.";
  $("#successText").textContent = issues.length ? `O formulário foi salvo com ${issues.length} ocorrência(s). ${sendResult.sent ? "A integração de e-mail foi acionada." : "Configure a integração para o envio automático por e-mail."}` : "Checklist concluído e registrado no controle da frota.";
  const actions = $("#dispatchActions");
  if (!issues.length) { actions.innerHTML = ""; showScreen("success"); return; }
  const buttons = [];
  const approvalTarget = issues[0]?.basePhone || current.basePhone || data.settings.leaderPhone;
  if (approvalTarget) {
    const message = buildWhatsAppMessage(vehicle, issues);
    const approvalMessage = `*APROVAÇÃO DE MANUTENÇÃO NECESSÁRIA*\n\n${message.replace(/\*/g, "")}\n\nAbra para verificar a foto, aprovar ou recusar:\n${await approvalUrl(vehicle, issues)}`;
    buttons.push(`<a href="${whatsappLink(approvalTarget, approvalMessage)}" target="_blank" rel="noopener">Enviar para aprovação da liderança</a>`);
  }
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
      <div class="issue-actions">${issue.photoPath ? `<button class="small-button photo-button" data-view-photo="${issue.id}">📷 Ver foto</button>` : ""}<button class="small-button" data-maintenance-issue="${issue.id}">Agendar / retorno</button><button class="small-button whatsapp" data-maintenance-whatsapp="${issue.id}">Avisar base</button><button class="small-button" data-close-issue="${issue.id}">Marcar resolvida</button></div>
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
  panel.innerHTML = `<div class="section-action"><h3>Veículos cadastrados</h3><button class="add-button" id="newVehicle">+ Cadastrar</button></div>${data.vehicles.length ? data.vehicles.map((vehicle) => `<article class="vehicle-card"><div><h3>Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} <span class="vehicle-label">· ${esc(vehicle.model || vehicle.type)}</span></h3><p>${esc(vehicle.ownerName)}${vehicle.contract ? ` · Contrato: ${esc(vehicle.contract)}` : ""}${vehicle.odometer !== "" ? ` · ${esc(vehicle.odometer)} km` : ""}</p></div><div class="issue-actions"><button class="small-button" data-edit-vehicle="${vehicle.id}">Editar</button><button class="small-button danger-button" data-delete-vehicle="${vehicle.id}">Excluir</button></div></article>`).join("") : ""}`;
}
function renderVehicles() {
  const panel = $("#vehiclesPanel");
  const cards = data.vehicles.map((vehicle) => `<article class="vehicle-card"><div><h3>Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} <span class="vehicle-label">· ${esc(vehicle.model || vehicle.type)}</span></h3><p>${esc(vehicle.ownerName)}${vehicle.ownerPhone ? ` · Tel.: ${esc(formatPhone(vehicle.ownerPhone))}` : ""}${vehicle.contract ? ` · Contrato: ${esc(vehicle.contract)}` : ""}${vehicle.odometer !== "" ? ` · ${esc(vehicle.odometer)} km` : ""}</p></div><div class="issue-actions"><button class="small-button" data-edit-vehicle="${vehicle.id}">Editar</button><button class="small-button danger-button" data-delete-vehicle="${vehicle.id}">Excluir</button></div></article>`).join("");
  panel.innerHTML = `<div class="section-action"><h3>Veículos cadastrados</h3><div class="vehicle-actions"><button class="restore-button" id="restoreFleet">↺ Restaurar frota</button><button class="add-button" id="newVehicle">+ Cadastrar</button></div></div>${cards}`;
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
  saveData(); void cloudSave("fleet_vehicles", { id: vehicleById(id || data.vehicles[data.vehicles.length - 1].id)?.id || id, prefix: detail.prefix, plate: detail.plate, data: vehicleById(id || data.vehicles[data.vehicles.length - 1].id) }); $("#vehicleDialog").close(); renderControl(); renderStart();
}
function deleteVehicle(id) {
  const vehicle = vehicleById(id); if (!vehicle) return;
  if (!confirm(`Excluir o veículo Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate} da lista de uso? O histórico de chamados será preservado.`)) return;
  data.vehicles = data.vehicles.filter((entry) => entry.id !== id);
  if (initialData.vehicles.some((entry) => entry.id === id)) data.removedVehicleIds = [...new Set([...(data.removedVehicleIds || []), id])];
  saveData(); renderControl(); renderStart();
}
async function restoreFleet() {
  if (!confirm("Restaurar todos os veículos da frota cadastrada, incluindo caminhões que tenham sido excluídos?")) return;
  const currentVehicles = data.vehicles;
  const standardVehicles = initialData.vehicles.map((seed) => {
    const existing = currentVehicles.find((vehicle) => vehicle.id === seed.id || vehicle.prefix === seed.prefix || vehicle.plate === seed.plate);
    return withFleetResponsible({ ...seed, ...(existing || {}) });
  });
  const customVehicles = currentVehicles.filter((vehicle) => !initialData.vehicles.some((seed) => seed.id === vehicle.id || seed.prefix === vehicle.prefix || seed.plate === vehicle.plate));
  data.vehicles = [...standardVehicles, ...customVehicles];
  data.removedVehicleIds = [];
  saveData();
  try { await Promise.all(standardVehicles.map((vehicle) => cloudSave("fleet_vehicles", { id: vehicle.id, prefix: vehicle.prefix, plate: vehicle.plate, data: vehicle }))); }
  catch (error) { console.warn("Não foi possível salvar a frota restaurada no banco", error); }
  renderControl(); renderStart();
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
function sendDriverMaintenanceWhatsApp(issue) {
  const target = issue.driverPhone;
  if (!target) return;
  window.open(whatsappLink(target, buildMaintenanceMessage(issue)), "_blank", "noopener");
}
function saveMaintenance() {
  const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (!issue) return;
  issue.maintenance = maintenanceFormValues();
  if (issue.maintenance.status === "Concluída") { issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); }
  else if (issue.status === "resolvida") { issue.status = "aberta"; delete issue.resolvedAt; }
  saveData();
  void cloudSave("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue });
  if (data.settings.webhookUrl) void sendToIntegration({ type: "maintenance-update", issue, maintenance: issue.maintenance });
  $("#maintenanceDialog").close(); renderControl();
  if (issue.maintenance.status === "Agendada") { sendDriverMaintenanceWhatsApp(issue); sendMaintenanceWhatsApp(); }
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
  if (target.dataset.deleteVehicle) deleteVehicle(target.dataset.deleteVehicle);
  if (target.id === "restoreFleet") void restoreFleet();
  if (target.dataset.viewPhoto) void openIssuePhoto(target.dataset.viewPhoto);
  if (target.dataset.whatsappIssue) sendIssueWhatsApp(target.dataset.whatsappIssue);
  if (target.dataset.maintenanceIssue) openMaintenanceIssue(target.dataset.maintenanceIssue);
  if (target.dataset.maintenanceWhatsapp) sendMaintenanceWhatsApp(target.dataset.maintenanceWhatsapp);
  if (target.dataset.closeIssue) closeIssue(target.dataset.closeIssue);
  if (target.id === "sendMaintenanceUpdate") { const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (issue) { issue.maintenance = maintenanceFormValues(); sendMaintenanceWhatsApp(); } }
  if (target.id === "downloadReport") downloadReport();
});
$("#vehicleSelect").addEventListener("change", renderVehicleOwner);
$("#baseSelect").addEventListener("change", renderBasePhone);
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
if (new URLSearchParams(location.search).get("gestao") === "1") {
  if (cloudToken()) showScreen("controle");
  else location.replace("gestao.html?v=36");
} else { renderStart(); void syncLocalBacklog(); }

