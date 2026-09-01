/* URBAM Frota - MVP local-first. Dados ficam neste navegador até uma integração ser configurada. */
const STORAGE_KEY = "checkfrota-v1";
const OUTBOX_KEY = "checkfrota-cloud-outbox-v1";
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
const LEADER_BASE_LABELS = { Vertical: "Base Vertical / Segurança / Elétrica", Horizontal: "Base Horizontal", Abrigo: "Base Abrigo / Manutenção / Linha Verde / Lavagem" };
const DRIVER_NOTIFICATION_PHONE = "";
const EMAIL_AUTOMATION_URL = "https://script.google.com/macros/s/AKfycbyfdwx76UkQcv2fz1HXLERZrcVMfW1iaNvFALmFET1kIBBeXAQVvkH89iviTDxBCQOA/exec";
const EMAIL_COPY_RECIPIENT = "urbamfrota@gmail.com";
const MASTER_ADMIN_EMAIL = "luciano.silva@urbam.com.br";
const MAINTENANCE_GROUP_PHONE = "5512996181645";
const DAILY_CHECKLIST_ALERT_PHONE = "5512981111336";
let dailyChecklistNotificationTimer = null;
let returnedIssues = [];
let returnedIssuesTimer = null;

const initialData = {
  settings: { maintenancePhone: "5512988400316", maintenanceGroupPhone: MAINTENANCE_GROUP_PHONE, leaderPhone: "", fleetManagerPhone: "", webhookUrl: EMAIL_AUTOMATION_URL },
  vehicles: [
    { id: "v1446", prefix: "1446", plate: "SHR7161", type: "Carro", model: "Onix", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "50/23", urbamContract: "620/24", odometer: "" },
    { id: "v1447", prefix: "1447", plate: "SHL7J59", type: "Carro", model: "Onix", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "50/23", urbamContract: "482/22", odometer: "" },
    { id: "v1456", prefix: "1456", plate: "SHR7I28", type: "Utilitário", model: "Furgão Peugeot", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "58/23", urbamContract: "44/23", odometer: "" },
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
    { id: "v1082", prefix: "1082", plate: "GAS6B76", type: "Caminhão", model: "Caminhão guindauto cesto", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "096/25", urbamContract: "482/22", odometer: "" },
    { id: "v1084", prefix: "1084", plate: "FVY2G68", type: "Caminhão", model: "Caminhão guindauto cesto", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "096/25", urbamContract: "620/24", odometer: "" },
    { id: "v1577", prefix: "1577", plate: "FVQ8C09", type: "Caminhão", model: "Caminhão 3/4 com cabine suplementar", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "095/25", urbamContract: "620/24", odometer: "" },
    { id: "v1967", prefix: "1967", plate: "UET6G08", type: "Carro", model: "Strada", base: "Base Abrigo", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "059/26", urbamContract: "620/24", odometer: "" },
    { id: "v1968", prefix: "1968", plate: "UED5G69", type: "Carro", model: "Strada", manager: "Julio — Gestor de Contratos", ownerName: "Responsável a cadastrar", ownerPhone: "", email: "", contract: "059/26", urbamContract: "620/24", odometer: "" },
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
const normalizeOwnerName = (name = "") => /authana/i.test(String(name)) ? "Locadora de Veículos Authana Ltda" : String(name);
const BASE_BY_PREFIX = {
  "1484": "Base Vertical", "1969": "Base Vertical", "1919": "Base Vertical", "1084": "Base Vertical", "1446": "Base Vertical", "1456": "Base Vertical",
  "1447": "Base Horizontal", "1466": "Base Horizontal", "1485": "Base Horizontal", "1577": "Base Horizontal", "157": "Base Horizontal",
  "1486": "Base Abrigo", "1799": "Base Abrigo", "1126": "Base Abrigo", "1082": "Base Abrigo", "1922": "Base Abrigo",
  "1967": "Base Abrigo",
  "1894": "SASC / Gestão",
  "1968": "Gestão de Contratos",
};
const MANAGER_BY_PREFIX = { "1968": "Julio — Gestor de Contratos" };
const DIRECT_MANAGEMENT_PREFIXES = new Set(["1446", "1447", "1894", "1968"]);
const CORRECTED_PLATE_BY_PREFIX = { "1456": "SHR7I28", "1082": "GAS6B76" };
function withFleetResponsible(vehicle) { return { ...vehicle, plate: CORRECTED_PLATE_BY_PREFIX[vehicle.prefix] || vehicle.plate, base: BASE_BY_PREFIX[vehicle.prefix] || vehicle.base || "", manager: MANAGER_BY_PREFIX[vehicle.prefix] || vehicle.manager || "", ownerName: normalizeOwnerName(RESPONSIBLES_BY_PREFIX[vehicle.prefix] || vehicle.ownerName), ownerPhone: OWNER_PHONE_BY_PREFIX[vehicle.prefix] || vehicle.ownerPhone }; }
const DRIVER_REGISTRY = [
  ["18593", "JULIO CESAR VIEIRA DA SILVA"], ["17672", "SILVIA CRISTINA TELES DE TOLEDO"], ["18920", "LUIS CARLOS ROMERO"], ["17208", "CRISTINA NASTI TAVARES"], ["23761", "BRUNA CRISTINA DE ABREU MACHADO"], ["23764", "FLAVIA MACHADO RIGOTTI"], ["25310", "LUIS ROBERTO COSTA"], ["18919", "ALEX MACHADO DA SILVA"], ["24846", "EDMILSON EVANGELISTA DA CRUZ"],
  ["18365", "EDSON DO AMARAL DE CARVALHO"], ["22748", "RENATO TARTAGLIONE FONSECA"], ["23141", "VIDAL FELIX DE SOUZA RIBEIRO"], ["18123", "ALEXANDRE FERREIRA DA SILVA ARAUJO"], ["14246", "RICARDO BATISTA DE ALMEIDA"], ["25082", "ANDRE LUIZ DE ABREU"], ["14443", "MOACIR PISARRO"], ["17096", "MARCO ALEXANDRE DE OLIVEIRA"], ["17148", "TIAGO PEREIRA DE MELO"], ["24567", "CLAUDINEI LUIS CARDOSO"], ["22300", "FRANCISCO RODRIGUES DA SILVA"], ["12928", "LUIZ SERGIO NOGUEIRA"], ["18918", "WESLEY POLICARPO GABRIEL DE MORAES"], ["23480", "ITALO JORGE LEMES CARDOSO"],
  ["14361", "ALEIXO DE OLIVEIRA CEZAR"], ["13534", "ANTONIO CARLOS VIEIRA BORGO"], ["13111", "MARCOS AURELIO FERREIRA DE LIMA"], ["24117", "HELIO PEREIRA MAIA"], ["14381", "JOSE RODOLFO TELES"], ["22445", "ARIVALDO DOS SANTOS"], ["14119", "ANDRE PEREIRA DO CARMO"], ["23806", "BENEDITO PEDRO CARLOS DO COUTO FARIA"], ["24134", "DANIEL MARTINS DA SILVA"],
  ["15239", "ISAIAS RAFAEL DO NASCIMENTO"], ["20869", "EDMILSON SILVA SANTOS"], ["17213", "PEDRO PAULO CORREIA"], ["17879", "TIAGO APARECIDO DE MORAES"], ["17793", "JOAO PAULO DA ROCHA"], ["14840", "FERNANDO APARECIDO DOS SANTOS"], ["18407", "EDSON RODRIGUES DA SILVA APOLINARIO"], ["24040", "EMERSON ALEXANDRE CHINA"], ["13948", "CARLOS ALBERTO DE ABREU"], ["22911", "BRUNO GLAUCO FELICIO"], ["18849", "REINALDO ALESSANDRO GONCALVES"], ["17695", "LINDEMBERG UBIRAJARA DOS SANTOS"], ["22773", "FELIPE MATIAS DO CARMO"], ["18938", "LUIZ DE MELO MARCAL"], ["16847", "MARCELO MELO"], ["16299", "JOSELINE APARECIDA DOS SANTOS"],
  ["23957", "RAFAEL ESTEVÃO TAVARES ALVES"], ["16428", "CARLOS ROBERTO DE MORAIS FILHO"], ["18095", "ARNON DA SILVA CUNHA"], ["18739", "LINDOMAR CASTILHO PEREIRA ALVES"], ["15077", "SILVERIO RODRIGUES FILHO"], ["13902", "VANDERLEY VELOSO DE MIRANDA"], ["17255", "DANIEL DOS SANTOS DE SA"], ["23135", "LUCIANO ALVES DA SILVA"], ["24321", "JOSE CELSO DE LIMA JUNIOR"], ["13997", "ADENILSON SILVA PEREIRA"], ["18873", "CARLA CRISTINA COUTO FARIA SANTOS"], ["18891", "JOAO PAULO GUEDES"], ["22244", "JOAO SILVERIO DA SILVA"], ["24154", "SILVIO LUIZ DOS SANTOS"], ["16746", "ELIZEU DO NASCIMENTO FALCAO"], ["15516", "ANDRE DE JESUS COUTINHO"], ["18539", "ROMEU CLEMENTE DE OLIVEIRA"],
  ["12894", "RODOLFO DONIZETTI DA ROSA"], ["16590", "FRANCISCO VILAMAR FERNANDES DA SILVA"], ["18380", "ROGERIO EDUARDO DE OLIVEIRA"], ["18876", "RODOLFO CARLOS DA SILVA"], ["18930", "RAFAEL GERARDO DE OLIVEIRA JUNIOR"], ["25940", "EDSON JOSIAS RODRIGUES"], ["22940", "EDSON JOSIAS RODRIGUES"], ["15552", "MARCELO CESAR MEDEIROS"], ["18848", "ROBSON ALEXANDRE DA SILVA"], ["22666", "SAULO DE CARVALHO SILVA"], ["14087", "PAULO DE FREITAS CARDOSO"],
  ["15723", "CARLOS ALEXANDRE APARECIDO RAMOS"], ["23584", "CLAUDINEI FERNANDES TEIXEIRA"], ["15809", "LUIS ANTONIO VICHI"], ["18472", "RODOLFO APARECIDO DA SILVA"], ["25363", "VALNEI APARECIDO LIMA"]
].map(([registration, name]) => ({ registration, name }));
const EMPLOYEE_ROLE_BY_REGISTRATION = {
  "18593": "Engenheiro civil", "17672": "Analista administrativo", "18920": "Almoxarife", "17208": "Coordenadora", "23761": "Escriturário", "23764": "Escriturário", "25310": "Escriturário", "18919": "Líder operacional", "24846": "Pintor predial",
  "18365": "Motorista", "22748": "Motorista", "23141": "Pintor predial", "18123": "Pintor predial", "14246": "Pintor predial", "25082": "Pintor predial", "14443": "Pintor predial", "17096": "Motorista", "17148": "Operador de máquinas leves", "24567": "Pintor predial", "22300": "Pintor predial", "12928": "Pintor predial", "18918": "Pintor predial", "23480": "Pintor predial",
  "14361": "Motorista", "13534": "Operador de máquinas leves", "13111": "Líder operacional", "24117": "Pintor predial", "14381": "Motorista", "22445": "Líder operacional", "14119": "Motorista", "23806": "Pintor predial", "24134": "Pintor predial",
  "15239": "Líder operacional I", "20869": "Monitor de serviços gerais", "17213": "Pedreiro I", "17879": "Motorista", "17793": "Motorista", "14840": "Monitor de serviços gerais", "18407": "Pintor predial", "24040": "Pintor predial", "13948": "Líder operacional II", "22911": "Monitor de serviços gerais", "18849": "Pedreiro I", "17695": "Monitor de serviços gerais", "22773": "Pintor predial", "18938": "Pintor predial", "16847": "Líder operacional", "16299": "Monitor de serviços gerais",
  "23957": "Monitor de serviços gerais", "16428": "Motorista", "18095": "Monitor de serviços gerais", "18739": "Pedreiro I", "15077": "Pedreiro I", "13902": "Eletricista de manutenção", "17255": "Motorista", "23135": "Escriturário", "24321": "Serralheiro", "13997": "Líder operacional", "18873": "Monitor de serviços gerais", "18891": "Monitor de serviços gerais", "22244": "Motorista", "24154": "Monitor de serviços gerais", "16746": "Pedreiro I", "15516": "Motorista", "18539": "Motorista",
  "12894": "Eletricista de manutenção", "16590": "Motorista", "18380": "Escriturário", "18876": "Serralheiro", "18930": "Serralheiro", "25940": "Líder de obras", "22940": "Líder de obras", "15552": "Pedreiro I", "18848": "Pedreiro I", "22666": "Motorista", "14087": "Eletricista de manutenção",
  "15723": "Motorista", "23584": "Motorista", "15809": "Motorista", "18472": "Motorista", "25363": "Motorista"
};
const DRIVER_LIST_SOURCE = ["ADENILSON SILVA PEREIRA", "ALEIXO DE OLIVEIRA CEZAR", "ANDRE DE JESUS COUTINHO", "ANDRE PEREIRA DO CARMO", "CARLOS ALEXANDRE APARECIDO RAMOS", "CARLOS ROBERTO DE MORAIS FILHO", "CLAUDINEI FERNANDES TEIXEIRA", "DANIEL DOS SANTOS DE SA", "EDSON DO AMARAL DE CARVALHO", "FRANCISCO VILAMAR FERNANDES DA SILVA", "JOAO PAULO DA ROCHA", "JOAO SILVERIO DA SILVA", "JOSE RODOLFO TELES", "LUIS ANTONIO VICHI", "MARCO ALEXANDRE DE OLIVEIRA", "RENATO TARTAGLIONE FONSECA", "RODOLFO APARECIDO DA SILVA", "ROMEU CLEMENTE DE OLIVEIRA", "SAULO DE CARVALHO SILVA", "TIAGO APARECIDO DE MORAES", "VALNEI APARECIDO LIMA"];
const driverNameKey = (name = "") => String(name).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
let employeeDatabase = [];
let editingEmployeeRegistration = "";
const driverByRegistration = (registration = "") => {
  const normalized = String(registration).replace(/\D/g, "");
  const cloudEmployee = employeeDatabase.find((entry) => String(entry.registration).replace(/\D/g, "") === normalized);
  if (cloudEmployee) return { ...cloudEmployee, registration: String(cloudEmployee.registration), name: cloudEmployee.name, role: cloudEmployee.role || "Funcionário" };
  const driver = DRIVER_REGISTRY.find((entry) => entry.registration === normalized);
  return driver ? { ...driver, role: EMPLOYEE_ROLE_BY_REGISTRATION[driver.registration] || "Funcionário" } : null;
};
const driversMissingRegistration = () => DRIVER_LIST_SOURCE.filter((name) => !DRIVER_REGISTRY.some((driver) => driverNameKey(driver.name) === driverNameKey(name)));

let data = loadData();
let current = { driver: "", driverRegistration: "", driverRole: "", driverEmail: EMAIL_COPY_RECIPIENT, driverPhone: DRIVER_NOTIFICATION_PHONE, baseName: "", basePhone: "", vehicleId: "", odometer: "", states: {}, notes: "" };
let issueDraft = { itemId: null, severity: "Leve" };
let deferredInstallPrompt = null;
let managerIssueFilters = { base: "", vehicle: "", date: "", owner: "", type: "" };
let managerCommandFilter = "";
let selectedVehicleHistoryId = "";
let masterAdmin = false;
const ACCESS_LEVEL_LABELS = { colaborador: "Colaborador", lider: "Líder", coordenador: "Coordenador", gestor: "Gestor" };
const employeeAccessLevel = (employee = {}) => employee.access_level || (employee.leader ? "lider" : "colaborador");
function employeeRoster() {
  const combined = new Map(DRIVER_REGISTRY.map((employee) => [String(employee.registration), { ...employee, role: EMPLOYEE_ROLE_BY_REGISTRATION[employee.registration] || "Funcionário", active: true, access_level: "colaborador" }]));
  employeeDatabase.filter((employee) => employee?.active !== false).forEach((employee) => {
    const registration = String(employee.registration || "");
    if (registration) combined.set(registration, { ...(combined.get(registration) || {}), ...employee, registration });
  });
  return [...combined.values()];
}

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
function requireMasterAccess() { if (masterAdmin) return true; alert("Esta ação é exclusiva do Administrador Master."); return false; }
async function loadMasterAccess() {
  masterAdmin = false;
  if (!CLOUD?.url || !cloudToken()) return renderControl();
  try {
    const response = await fetch(`${CLOUD.url}/auth/v1/user`, { headers: cloudHeaders(false) });
    if (!response.ok) throw new Error();
    const profile = await response.json();
    masterAdmin = String(profile.email || "").trim().toLowerCase() === MASTER_ADMIN_EMAIL;
  } catch (error) { console.warn("Não foi possível validar o perfil de Gestão", error); }
  renderControl();
}
async function cloudSave(table, row) {
  if (!CLOUD?.url) throw new Error("A conexão com o banco de dados não está configurada.");
  const response = await fetch(`${CLOUD.url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...cloudHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Banco de dados: ${response.status}${detail ? ` — ${detail}` : ""}`);
  }
  return true;
}
function readCloudOutbox() { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]"); } catch { return []; } }
function queueCloudWrite(table, row) {
  const key = `${table}:${row.id || crypto.randomUUID()}`;
  const queue = readCloudOutbox().filter((entry) => entry.key !== key);
  queue.push({ key, table, row, queuedAt: new Date().toISOString() });
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue.slice(-100)));
}
async function syncCloudOutbox() {
  const queue = readCloudOutbox();
  if (!queue.length || !CLOUD?.url || !navigator.onLine) return 0;
  const remaining = [];
  for (const entry of queue) {
    try { await cloudSave(entry.table, entry.row); }
    catch { remaining.push(entry); }
  }
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(remaining));
  return queue.length - remaining.length;
}
async function saveSubmissionWithOutbox(table, row) {
  try { await cloudSave(table, row); return true; }
  catch (error) { queueCloudWrite(table, row); console.warn("Envio guardado para sincronização", error); return false; }
}
async function recordAuditEvent(issue, action, detail = "") {
  if (!cloudToken() || !issue?.id) return;
  try {
    await cloudRequest("/rest/v1/fleet_audit_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ issue_id: issue.id, vehicle_id: issue.vehicleId || null, action, detail, snapshot: issue }) });
  } catch (error) { console.warn("Evento de auditoria será registrado após aplicar a migração", error); }
}
async function loadEmployeeDatabase() {
  if (!CLOUD?.url || employeeDatabase.length) return;
  try {
    // Sem login, a consulta usa a visão pública sem campos de autenticação.
    // A Gestão autenticada lê a tabela completa para poder administrar cadastros.
    const source = cloudToken() ? "fleet_employees" : "fleet_employee_directory";
    const rows = await cloudRequest(`/rest/v1/${source}?select=*&active=is.true&order=name.asc`);
    if (!Array.isArray(rows) || !rows.length) return;
    employeeDatabase = rows;
    lookupDriverRegistration();
    console.info(`Base de colaboradores sincronizada: ${rows.length} registro(s).`);
  } catch (error) {
    // A lista incorporada mantém a busca por matrícula funcionando até a tabela ser criada ou ficar disponível.
    console.warn("Base de colaboradores indisponível; usando lista local.", error);
  }
}
async function cloudUpdateIssue(issue) {
  if (!CLOUD?.url || !issue?.id) return;
  const response = await fetch(`${CLOUD.url}/rest/v1/fleet_issues?id=eq.${encodeURIComponent(issue.id)}`, { method: "PATCH", headers: { ...cloudHeaders(), Prefer: "return=minimal" }, body: JSON.stringify({ status: issue.status || "aberta", data: issue }) });
  if (!response.ok) throw new Error(`Banco de dados: ${response.status}`);
}
async function compressPhoto(file) {
  if (!file?.type?.startsWith("image/")) return file;
  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const encode = async (maxSide, quality) => {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  };
  // Foto de ocorrência: qualidade suficiente para inspeção, sem armazenar a imagem original do celular.
  let blob = await encode(1280, 0.65);
  if (blob?.size > 450 * 1024) blob = await encode(1024, 0.60);
  if (blob?.size > 350 * 1024) blob = await encode(820, 0.55);
  image.close?.();
  return blob ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
}
async function uploadIssuePhoto(issue, file) { if (!file || !CLOUD?.url) return ""; const path = `${issue.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`; try { const response = await fetch(`${CLOUD.url}/storage/v1/object/issue-photos/${path}`, { method: "POST", headers: { ...cloudHeaders(false), "Content-Type": file.type || "image/jpeg", "x-upsert": "false" }, body: file }); if (!response.ok) throw new Error(`Foto: ${response.status}`); return path; } catch (error) { console.warn("Não foi possível enviar a foto", error); return ""; } }
function publicIssuePhotoUrl(issue) { if (!issue?.photoPath || !CLOUD?.url) return ""; const safePath = issue.photoPath.split("/").map(encodeURIComponent).join("/"); return `${CLOUD.url}/storage/v1/object/public/issue-photos/${safePath}`; }
async function issuePhotoLink(issue) { return publicIssuePhotoUrl(issue); }
async function openIssuePhoto(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId);
  if (!issue?.photoPath) return alert("Esta ocorrência não possui foto armazenada no banco de dados.");
  // Abrir a guia antes da chamada assíncrona evita bloqueio de pop-up. Não use
  // `noopener` aqui: nesse modo o navegador devolve uma janela nula e a foto
  // nunca recebe a URL assinada.
  const photoUrl = publicIssuePhotoUrl(issue);
  const preview = window.open(photoUrl, "_blank", "noopener");
  if (!preview) alert("O navegador bloqueou a nova guia da foto. Permita pop-ups para este aplicativo e tente novamente.");
}
async function cloudSyncSubmission(inspection, issues) {
  // A inspeção completa precisa acompanhar a ocorrência no banco. Assim, caso
  // a liderança peça retificação, o colaborador recebe novamente todos os
  // itens que havia preenchido, mesmo abrindo o aplicativo em outro aparelho.
  const savedInspection = await saveSubmissionWithOutbox("fleet_inspections", { id: inspection.id, data: inspection });
  const savedIssues = await Promise.all(issues.map((issue) => saveSubmissionWithOutbox("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId || null, status: issue.status, data: issue })));
  return savedInspection && savedIssues.every(Boolean);
}
async function finishCorrectionRequest(issueId, inspection, hasNewIssues) {
  if (!issueId) return;
  const original = data.issues.find((issue) => issue.id === issueId);
  if (!original) return;
  const resolvedWithoutIssues = !hasNewIssues;
  original.status = resolvedWithoutIssues ? "resolvida" : "reenviada";
  original.resolvedAt = resolvedWithoutIssues ? new Date().toISOString() : "";
  original.correctedBy = inspection.id;
  original.leaderApproval = {
    ...(original.leaderApproval || {}),
    status: resolvedWithoutIssues ? "Concluído sem observação" : "Retificação reenviada",
    correctedAt: new Date().toISOString(),
    correctionInspectionId: inspection.id,
  };
  returnedIssues = returnedIssues.filter((issue) => issue.id !== issueId);
  renderReturnedIssues(); saveData();
  try { await cloudUpdateIssue(original); }
  catch (error) { console.warn("Não foi possível encerrar a solicitação de retificação no banco", error); }
}
async function syncLocalBacklog() {
  if (!CLOUD?.url || !data.issues?.length) return;
  try {
    await Promise.all(data.issues.map((issue) => cloudSave("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: null, status: issue.status || "aberta", data: issue })));
  } catch (error) { console.warn("Não foi possível migrar os chamados deste aparelho", error); }
}
function returnNotificationPermission() { return "Notification" in window ? Notification.permission : "unsupported"; }
async function enableReturnNotifications() {
  if (!("Notification" in window)) return alert("Este navegador não oferece notificações do sistema.");
  const permission = await Notification.requestPermission();
  if (permission === "granted") { alert("Avisos ativados neste celular enquanto o URBAM Frotas estiver aberto."); await loadReturnedIssuesForCollaborator(); }
  else if (permission === "denied") alert("As notificações foram bloqueadas. Libere-as nas configurações do site para receber os avisos.");
}
function notifyReturnedIssue(issue) {
  const key = `checkfrota-return-notification-${issue.id}-${issue.leaderApproval?.approvedAt || ""}`;
  if (returnNotificationPermission() !== "granted" || localStorage.getItem(key)) return;
  const approval = issue.leaderApproval || {};
  const title = approval.status === "Recusada" ? "URBAM Frotas: chamado rejeitado" : "URBAM Frotas: retificação solicitada";
  const notification = new Notification(title, { body: `Prefixo ${issue.vehiclePrefix || "—"}: ${approval.note || "Abra o aplicativo para verificar."}`, tag: `checkfrota-return-${issue.id}`, renotify: true });
  notification.onclick = () => { window.focus(); notification.close(); };
  localStorage.setItem(key, new Date().toISOString());
}
function renderReturnedIssues() {
  const panel = $("#returnNotifications"); if (!panel) return;
  if (!returnedIssues.length) { panel.hidden = true; panel.innerHTML = ""; return; }
  panel.hidden = false;
  panel.innerHTML = returnedIssues.map((issue) => { const approval = issue.leaderApproval || {}; const review = approval.status === "Retificação solicitada"; return `<article class="return-notice ${review ? "review" : ""}"><h2>${review ? "↩ Retificação solicitada" : "✕ Chamado rejeitado"}</h2><p><b>Prefixo ${esc(issue.vehiclePrefix || "—")} · ${esc(issue.vehiclePlate || "—")}</b></p><p>${esc(approval.note || "A liderança devolveu este chamado. Verifique os dados.")}</p><p><small>Decisão em ${dateTime(approval.approvedAt || issue.createdAt)}</small></p><button type="button" class="small-button" data-reopen-return="${esc(issue.id)}">${review ? "Corrigir e refazer checklist" : "Abrir dados do chamado"}</button></article>`; }).join("");
}
async function loadReturnedIssuesForCollaborator() {
  const registration = $("#driverRegistration")?.value.replace(/\D/g, "") || localStorage.getItem("checkfrota-driver-registration") || "";
  if (!CLOUD?.url || !registration) return;
  try {
    // A matrícula é obrigatória e identifica o colaborador. Não use o
    // telefone como bloqueio: ele pode ter sido digitado com outro formato ou
    // atualizado após o chamado, o que escondia a retificação indevidamente.
    const rows = await cloudRequest(`/rest/v1/fleet_issues?select=data,status&data->>driverRegistration=eq.${encodeURIComponent(registration)}&order=created_at.desc`);
    returnedIssues = (rows || []).map((row) => row.data).filter((issue) => issue && ["Retificação solicitada", "Recusada"].includes(issue.leaderApproval?.status));
    returnedIssues.forEach(notifyReturnedIssue); renderReturnedIssues();
  } catch (error) { console.warn("Não foi possível buscar devoluções do colaborador", error); }
}
function startReturnedIssuesPolling() {
  if (returnedIssuesTimer) return;
  returnedIssuesTimer = window.setInterval(() => void loadReturnedIssuesForCollaborator(), 60 * 1000);
}
function openReturnedChecklist(issue, inspection = null) {
  const vehicle = vehicleById(inspection?.vehicleId || issue.vehicleId) || data.vehicles.find((entry) => entry.prefix === (inspection?.vehiclePrefix || issue.vehiclePrefix) || entry.plate === (inspection?.vehiclePlate || issue.vehiclePlate));
  const savedItems = Array.isArray(inspection?.items) ? inspection.items : [];
  const states = Object.fromEntries(CHECKLIST.map((item) => {
    const saved = savedItems.find((entry) => entry.id === item.id);
    if (saved?.status) return [item.id, { status: saved.status, ...(saved.issue ? { issue: { ...saved.issue, photoFile: null } } : {}) }];
    const isReturnedItem = item.name === issue.itemName;
    return [item.id, isReturnedItem ? { status: "issue", issue: { severity: issue.severity || "Leve", description: issue.description || "", photoName: issue.photoName || "", photoFile: null } } : { status: "pending" }];
  }));
  current = {
    driver: inspection?.driver || issue.driver || "", driverRegistration: inspection?.driverRegistration || issue.driverRegistration || "", driverRole: inspection?.driverRole || issue.driverRole || "", driverEmail: inspection?.driverEmail || issue.driverEmail || EMAIL_COPY_RECIPIENT,
    driverPhone: inspection?.driverPhone || issue.driverPhone || "", baseName: inspection?.baseName || issue.baseName || "", basePhone: inspection?.basePhone || issue.basePhone || BASES[inspection?.baseName || issue.baseName] || "",
    vehicleId: vehicle?.id || inspection?.vehicleId || issue.vehicleId || "", odometer: inspection?.odometer ?? issue.odometer ?? "", states, notes: inspection?.notes || "", washRequested: Boolean(inspection?.washRequested), washDetails: inspection?.washDetails || "", correctionOf: issue.id,
  };
  $("#driverRegistration").value = current.driverRegistration; $("#driverPhone").value = formatPhone(current.driverPhone); $("#baseSelect").value = current.baseName; renderVehicleOptions(); $("#vehicleSelect").value = current.vehicleId; $("#odometer").value = current.odometer;
  lookupDriverRegistration(); renderBasePhone(); renderVehicleOwner();
  if (!vehicle) return false;
  $("#checklistVehicle").textContent = `Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate} · ${vehicle.model || vehicle.type}`;
  renderChecklist(); showScreen("checklist");
  return true;
}
async function reopenReturnedIssue(issueId) {
  const issue = returnedIssues.find((entry) => entry.id === issueId); if (!issue) return;
  let inspection = data.inspections.find((entry) => entry.id === issue.inspectionId) || null;
  // Nunca espere a rede para abrir a correção. A ocorrência fica disponível
  // imediatamente; o formulário completo é aplicado assim que chegar.
  if (!openReturnedChecklist(issue, inspection)) return alert("Não foi possível localizar o veículo deste chamado. Selecione-o na tela inicial e tente novamente.");
  if (inspection) return alert("Checklist original restaurado. Corrija o que for necessário e envie a nova versão.");
  if (!CLOUD?.url || !issue.inspectionId) return alert("A ocorrência devolvida foi restaurada. Complete os demais itens do checklist e envie a nova versão.");
  try {
    const rows = await cloudRequest(`/rest/v1/fleet_inspections?select=data&id=eq.${encodeURIComponent(issue.inspectionId)}&limit=1`);
    inspection = rows?.[0]?.data || null;
    if (!inspection) return alert("A ocorrência devolvida foi restaurada. Complete os demais itens do checklist e envie a nova versão.");
    if (!data.inspections.some((entry) => entry.id === inspection.id)) { data.inspections.unshift(inspection); saveData(); }
    openReturnedChecklist(issue, inspection);
    alert("Checklist original restaurado. Corrija o que for necessário e envie a nova versão.");
  } catch (error) {
    console.warn("Não foi possível recuperar a inspeção original", error);
    alert("A ocorrência devolvida foi restaurada. Complete os demais itens do checklist e envie a nova versão.");
  }
}
function mergeFleetVehicles(cloudVehicles = []) {
  // O banco pode conter somente veículos criados manualmente. Ele nunca deve
  // substituir a frota de referência e fazer caminhões sumirem do aplicativo.
  const localVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
  const allVehicles = [...cloudVehicles, ...localVehicles];
  const findMatch = (vehicle) => allVehicles.find((entry) => entry && (entry.id === vehicle.id || entry.prefix === vehicle.prefix || entry.plate === vehicle.plate));
  const standard = initialData.vehicles
    .filter((seed) => !(data.removedVehicleIds || []).includes(seed.id))
    .map((seed) => withFleetResponsible({ ...seed, ...(findMatch(seed) || {}) }));
  const extras = allVehicles.filter((vehicle, index) => vehicle && !initialData.vehicles.some((seed) => seed.id === vehicle.id || seed.prefix === vehicle.prefix || seed.plate === vehicle.plate) && allVehicles.findIndex((entry) => entry && (entry.id === vehicle.id || entry.prefix === vehicle.prefix || entry.plate === vehicle.plate)) === index);
  return [...standard, ...extras];
}
async function loadCloudManager() { if (!cloudToken()) return; try { const [issues, inspections, vehicles] = await Promise.all([cloudRequest("/rest/v1/fleet_issues?select=data&order=created_at.desc"), cloudRequest("/rest/v1/fleet_inspections?select=data&order=created_at.desc"), cloudRequest("/rest/v1/fleet_vehicles?select=data")]); if (issues) data.issues = issues.map((row) => row.data); if (inspections) data.inspections = inspections.map((row) => row.data); data.vehicles = mergeFleetVehicles((vehicles || []).map((row) => row.data).filter(Boolean)); saveData(); renderControl(); } catch (error) { console.warn("Não foi possível carregar a nuvem", error); } }

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
      merged.ownerName = normalizeOwnerName(RESPONSIBLES_BY_PREFIX[seed.prefix] || merged.ownerName);
      if (!storedVehicle?.ownerPhone) merged.ownerPhone = OWNER_PHONE_BY_PREFIX[seed.prefix] || merged.ownerPhone;
      return merged;
    });
    const customVehicles = storedVehicles.filter((vehicle) =>
      !["v1", "v2", "v3"].includes(vehicle.id) &&
      !initialData.vehicles.some((seed) => seed.prefix === vehicle.prefix || seed.plate === vehicle.plate)
    );
    return { ...initialData, ...stored, removedVehicleIds, vehicles: [...seededVehicles, ...customVehicles], settings: { ...initialData.settings, ...stored.settings, webhookUrl: stored.settings?.webhookUrl || EMAIL_AUTOMATION_URL } };
  } catch { return structuredClone(initialData); }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function vehicleById(id) { return data.vehicles.find((vehicle) => vehicle.id === id); }
function checkById(id) { return CHECKLIST.find((item) => item.id === id); }

function showScreen(name) {
  $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "controle") { renderControl(); void loadCloudManager(); void loadMasterAccess(); }
  if (name === "inicio") renderStart();
}

function renderStart() {
  void loadEmployeeDatabase();
  const rememberedDriverRegistration = localStorage.getItem("checkfrota-driver-registration") || "";
  const rememberedDriverPhone = localStorage.getItem("checkfrota-driver-phone") || "";
  const rememberedBase = localStorage.getItem("checkfrota-base") || "";
  if (!$("#driverRegistration").value) $("#driverRegistration").value = rememberedDriverRegistration;
  if (!$("#driverPhone").value) $("#driverPhone").value = formatPhone(rememberedDriverPhone);
  const correctionRegistration = new URLSearchParams(location.search).get("matricula");
  if (correctionRegistration) $("#driverRegistration").value = correctionRegistration;
  lookupDriverRegistration();
  if (!$("#baseSelect").value) $("#baseSelect").value = rememberedBase;
  renderVehicleOptions();
  renderVehicleOwner();
  renderBasePhone();
  void loadReturnedIssuesForCollaborator();
  startReturnedIssuesPolling();
  const correctionId = new URLSearchParams(location.search).get("retificar");
  if (correctionId && !sessionStorage.getItem(`checkfrota-retificacao-${correctionId}`)) {
    sessionStorage.setItem(`checkfrota-retificacao-${correctionId}`, "1");
    setTimeout(() => alert("A liderança solicitou uma retificação. Revise os dados e preencha um novo checklist para enviar a correção."), 120);
  }
  const todaysInspections = data.inspections.filter((inspection) => inspection.createdAt.slice(0, 10) === today());
  $("#dailyDone").textContent = todaysInspections.length;
  $("#openIssues").textContent = data.issues.filter((issue) => issue.status === "aberta").length;
}
function lookupDriverRegistration() {
  const registrationInput = $("#driverRegistration");
  const nameInput = $("#driverName");
  const roleInput = $("#driverRole");
  const hint = $("#driverLookupHint");
  if (!registrationInput || !nameInput || !hint) return null;
  const registration = registrationInput.value.replace(/\D/g, "");
  if (!registration) {
    nameInput.value = "";
    if (roleInput) roleInput.value = "";
    hint.textContent = "Digite a matrícula para localizar o nome do colaborador.";
    hint.className = "helper";
    return null;
  }
  const driver = driverByRegistration(registration);
  if (!driver) {
    nameInput.value = "";
    if (roleInput) roleInput.value = "";
    hint.textContent = "Matrícula não cadastrada. Procure a Gestão.";
    hint.className = "helper warning";
    return null;
  }
  registrationInput.value = driver.registration;
  nameInput.value = driver.name;
  if (roleInput) roleInput.value = driver.role;
  hint.textContent = `Colaborador localizado: ${driver.name}.`;
  hint.className = "helper ok";
  return driver;
}
function baseKey(value) { const text = String(value || "").toLowerCase(); if (text.includes("vertical")) return "Vertical"; if (text.includes("horizontal")) return "Horizontal"; if (text.includes("abrigo")) return "Abrigo"; if (text.includes("sasc")) return "SASC"; if (text.includes("gestão") || text.includes("gestao")) return "Gestão"; return ""; }
function vehicleBaseKey(vehicle) { return baseKey(BASE_BY_PREFIX[vehicle?.prefix] || vehicle?.base); }
function isDirectManagementVehicle(vehicle) { return DIRECT_MANAGEMENT_PREFIXES.has(String(vehicle?.prefix || "")); }
function renderVehicleOptions() {
  const select = $("#vehicleSelect"); const selectedBase = $("#baseSelect").value; const oldValue = select.value || current.vehicleId;
  const vehicles = selectedBase ? data.vehicles.filter((vehicle) => vehicleBaseKey(vehicle) === selectedBase) : [];
  select.innerHTML = `<option value="">${selectedBase ? "Selecione o veículo" : "Selecione primeiro a base"}</option>${vehicles.map((vehicle) => `<option value="${vehicle.id}">Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} · ${esc(vehicle.model || vehicle.type)}</option>`).join("")}`;
  if (vehicles.some((vehicle) => vehicle.id === oldValue)) select.value = oldValue; else current.vehicleId = "";
  renderVehicleOwner();
}
function renderBasePhone() { const base = $("#baseSelect").value; const phone = BASES[base] || ""; const formatted = phone.replace(/^55(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3"); $("#basePhone").textContent = phone ? `Telefone da Base ${base}: ${formatted}` : base ? "Este destino segue diretamente para Gestão e Manutenção." : "Selecione a base para assumir o telefone de envio."; }
function renderVehicleOwner() {
  const vehicle = vehicleById($("#vehicleSelect").value);
  $("#vehicleOwner").textContent = vehicle ? `Responsável: ${vehicle.ownerName}${vehicle.email ? ` · ${vehicle.email}` : ""}` : "";
}

function beginChecklist() {
  const registeredDriver = lookupDriverRegistration();
  const driver = registeredDriver?.name || "";
  const driverRegistration = registeredDriver?.registration || "";
  const driverRole = registeredDriver?.role || "";
  const driverEmail = EMAIL_COPY_RECIPIENT;
  const phoneDigits = phoneOnly($("#driverPhone").value);
  const driverPhone = phoneDigits.length === 10 || phoneDigits.length === 11 ? `55${phoneDigits}` : phoneDigits;
  const baseName = $("#baseSelect").value;
  const vehicleId = $("#vehicleSelect").value;
  const odometer = Number($("#odometer").value);
  const vehicle = vehicleById(vehicleId);
  const directToManagement = isDirectManagementVehicle(vehicle);
  const basePhone = directToManagement ? "" : (BASES[baseName] || "");
  if (!driverRegistration) return alert("Digite uma matrícula cadastrada antes de iniciar.");
  if (!/^55\d{10,11}$/.test(driverPhone)) return alert("Informe um WhatsApp válido do colaborador, com DDD.");
  if (!vehicleId) return alert("Selecione o veículo que será utilizado.");
  if (!baseName) return alert("Selecione a base responsável.");
  if (!basePhone && !directToManagement) return alert("Selecione a base responsável pela aprovação.");
  if (!Number.isFinite(odometer) || odometer < 0) return alert("Informe a quilometragem atual do veículo.");
  if (odometer > 999999) return alert("A quilometragem informada é muito alta. Confira o número antes de continuar.");
  if (Number(vehicle?.odometer) && odometer < Number(vehicle.odometer)) return alert(`A quilometragem não pode ser menor que o último registro (${vehicle.odometer} km).`);
  current = { driver, driverRegistration, driverRole, driverEmail, driverPhone, baseName, basePhone, vehicleId, odometer, directToManagement, states: Object.fromEntries(CHECKLIST.map((item) => [item.id, { status: "pending" }])), notes: "", washRequested: false, washDetails: "" };
  void window.URBAMOneSignal?.setContext({ role: "colaborador", base: baseName, area: "checklist" });
  localStorage.setItem("checkfrota-driver", driver);
  localStorage.setItem("checkfrota-driver-registration", driverRegistration);
  localStorage.setItem("checkfrota-driver-phone", driverPhone);
  localStorage.setItem("checkfrota-base", baseName);
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
  if (photo && !["image/jpeg", "image/png", "image/webp", "image/heic"].includes(photo.type)) return alert("Envie apenas uma foto JPEG, PNG, WEBP ou HEIC. Vídeos e outros arquivos não são aceitos.");
  if (photo && photo.size > 20 * 1024 * 1024) return alert("A foto escolhida tem mais de 20 MB. Tire outra foto com menor tamanho antes de enviar.");
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
    <div class="review-row"><span>Colaborador</span><b>${esc(current.driver)}</b></div>
    ${current.driverRegistration ? `<div class="review-row"><span>Matrícula</span><b>${esc(current.driverRegistration)}</b></div>` : ""}
    ${current.driverRole ? `<div class="review-row"><span>Função</span><b>${esc(current.driverRole)}</b></div>` : ""}
    ${current.driverEmail ? `<div class="review-row"><span>Cópia do formulário</span><b>${esc(current.driverEmail)}</b></div>` : ""}
    <div class="review-row"><span>Veículo</span><b>Prefixo ${esc(vehicleById(current.vehicleId).prefix || "—")} · ${esc(vehicleById(current.vehicleId).plate)}</b></div>
    <div class="review-row"><span>Quilometragem</span><b>${esc(current.odometer)} km</b></div>
    <div class="review-row"><span>Itens em ordem</span><span class="chip ok">${CHECKLIST.length - issues.length} OK</span></div>
    <div class="review-row"><span>Ocorrências</span>${issues.length ? `<span class="chip ${highestSeverity(issues).toLowerCase()}">${issues.length} encontrada(s)</span>` : `<span class="chip ok">Nenhuma</span>`}</div>
  </section>${issues.length ? `<section class="review-box card">${issues.map((issue) => `<div class="review-row"><span>${esc(issue.item.name)}</span><span class="chip ${issue.severity.toLowerCase()}">${esc(issue.severity)}</span></div>`).join("")}</section>` : ""}`;
  $("#generalNotes").value = current.notes;
  $("#requestWash").checked = Boolean(current.washRequested);
  $("#washDetails").value = current.washDetails || "";
  showScreen("review");
}
function getCurrentIssues() {
  return CHECKLIST.filter((item) => current.states[item.id]?.status === "issue").map((item) => ({ item, ...current.states[item.id].issue }));
}
function severityRank(severity) { return ({ Leve: 1, "Média": 2, Grave: 3 }[severity] || 0); }
function highestSeverity(issues) { return issues.reduce((highest, issue) => severityRank(issue.severity) > severityRank(highest) ? issue.severity : highest, "Leve"); }

async function submitChecklist() {
  current.notes = $("#generalNotes").value.trim();
  current.washRequested = $("#requestWash").checked;
  current.washDetails = $("#washDetails").value.trim();
  const vehicle = vehicleById(current.vehicleId);
  const inspection = {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), driver: current.driver, driverRegistration: current.driverRegistration, driverRole: current.driverRole, driverEmail: current.driverEmail, driverPhone: current.driverPhone, baseName: current.baseName, basePhone: current.basePhone, approvalRoute: current.directToManagement ? "gestao" : "lideranca",
    vehicleId: vehicle.id, vehiclePrefix: vehicle.prefix || "", vehiclePlate: vehicle.plate, vehicleType: vehicle.type, vehicleModel: vehicle.model || "", vehicleBase: vehicle.base || "", odometer: current.odometer, notes: current.notes, washRequested: current.washRequested, washDetails: current.washDetails, correctionOf: current.correctionOf || "",
    items: CHECKLIST.map((item) => ({ ...item, ...current.states[item.id] })),
  };
  const currentIssues = [...getCurrentIssues(), ...(current.washRequested ? [{ item: { name: "Solicitação de lavagem", category: "Lavagem" }, severity: "Leve", description: current.washDetails || "Solicitação de lavagem do veículo." }] : [])];
  inspection.status = currentIssues.length ? "Com ocorrência" : "Concluído sem observação";
  inspection.completedAt = currentIssues.length ? "" : new Date().toISOString();
  const newIssues = currentIssues.map((issue) => ({
    id: crypto.randomUUID(), inspectionId: inspection.id, status: "aberta", createdAt: inspection.createdAt,
    driver: current.driver, driverRegistration: current.driverRegistration, driverRole: current.driverRole, driverEmail: current.driverEmail, driverPhone: current.driverPhone, baseName: current.baseName, basePhone: current.basePhone, approvalRoute: current.directToManagement ? "gestao" : "lideranca", vehicleId: vehicle.id, vehiclePrefix: vehicle.prefix || "", vehiclePlate: vehicle.plate, vehicleType: vehicle.type, vehicleModel: vehicle.model || "", vehicleBase: BASE_BY_PREFIX[vehicle.prefix] || vehicle.base || "", odometer: current.odometer,
    ownerName: vehicle.ownerName, ownerPhone: vehicle.ownerPhone, email: vehicle.email,
    itemName: issue.item.name, severity: issue.severity, description: issue.description, photoName: issue.photoName, _photoFile: issue.photoFile || null,
    correctionOf: current.correctionOf || "", maintenance: { status: issue.item.name === "Solicitação de lavagem" ? "Solicitada" : "Pendente", scheduledAt: "", provider: "", feedback: "", updatedAt: "" },
  }));
  try { await Promise.all(newIssues.map(async (issue) => { const compressedPhoto = await compressPhoto(issue._photoFile); issue.photoSize = compressedPhoto?.size || 0; issue.photoPath = await uploadIssuePhoto(issue, compressedPhoto); delete issue._photoFile; })); }
  catch (error) { alert("Não foi possível preparar a foto. Tente outra imagem em formato JPEG, PNG, WEBP ou HEIC."); return; }
  vehicle.odometer = current.odometer;
  data.inspections.unshift(inspection);
  data.issues.unshift(...newIssues);
  saveData();
  let cloudSaved = true;
  try { cloudSaved = await cloudSyncSubmission(inspection, newIssues); }
  catch (error) { cloudSaved = false; console.warn("Não foi possível gravar o chamado no banco", error); }
  if (!cloudSaved) alert("O checklist ficou salvo com segurança neste aparelho e será enviado automaticamente assim que a conexão voltar.");
  await finishCorrectionRequest(current.correctionOf, inspection, newIssues.length > 0);
  const sendResult = await sendToIntegration({ inspection, vehicle, issues: newIssues });
  await showCompletion(inspection, vehicle, newIssues, sendResult);
  current = { driver: current.driver, driverRegistration: current.driverRegistration, driverRole: current.driverRole, driverEmail: current.driverEmail, driverPhone: current.driverPhone, baseName: current.baseName, basePhone: current.basePhone, vehicleId: vehicle.id, odometer: "", states: {}, notes: "" };
  saveData();
}

async function sendToIntegration(payload) {
  if (!data.settings.webhookUrl) return { sent: false, reason: "sem integração" };
  try {
    const isGoogleAppsScript = data.settings.webhookUrl.includes("script.google.com/macros/s/");
    const response = await fetch(data.settings.webhookUrl, isGoogleAppsScript
      ? { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }
      : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (isGoogleAppsScript) return { sent: true, reason: "enviado ao Apps Script" };
    return { sent: response.ok, reason: response.ok ? "enviado" : "falhou" };
  } catch { return { sent: false, reason: "falhou" }; }
}
function buildWhatsAppMessage(vehicle, issues, inspection) {
  const createdAt = inspection?.createdAt || issues[0]?.createdAt || new Date();
  const checklist = (inspection?.items || CHECKLIST.map((item) => ({ ...item, ...current.states[item.id] }))).map((item) => {
    if (item.status === "issue") {
      const issue = item.issue || {};
      return `- ${item.name}: OCORRÊNCIA${issue.description ? ` — ${issue.description}` : ""}`;
    }
    return `- ${item.name}: EM ORDEM`;
  }).join("\n");
  const wash = issues.find(isWashIssue);
  return `*URBAM FROTAS — FORMULÁRIO DE INSPEÇÃO*\nSolicitação para avaliação da liderança\n\n*Identificação do veículo*\nVeículo: Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate} (${vehicle.model || vehicle.type})\nQuilometragem: ${inspection?.odometer ?? issues[0]?.odometer ?? vehicle.odometer ?? "Não informada"} km\nBase: ${inspection?.baseName || issues[0]?.baseName || current.baseName || "Não informada"}\nData: ${dateTime(createdAt)}\n\n*Checklist completo*\n${checklist}${wash ? `\n\n*Solicitação adicional*\nLavagem do veículo${wash.description && wash.description !== "Solicitação de lavagem do veículo." ? ` — ${wash.description}` : ""}` : ""}\n\nSolicitamos avaliação e providências para o veículo.`;
}
function whatsappLink(phone, message) { return `https://wa.me/${phoneOnly(phone)}?text=${encodeURIComponent(message)}`; }
function leadershipPanelUrl(baseName) {
  const base = baseName || current.baseName || "Vertical";
  return `${location.origin}${location.pathname.replace(/[^/]*$/, "lider.html")}?v=150&base=${encodeURIComponent(base)}`;
}
async function approvalUrl(vehicle, issues) {
  const first = issues[0] || {};
  const problem = issues.map((issue) => `${issue.itemName || issue.item?.name}: ${issue.description}`).join(" | ");
  const params = new URLSearchParams({
    id: `MAN-${String(first.id || Date.now()).replaceAll("-", "").slice(-8)}`, issueId: first.id || "",
    prefix: vehicle.prefix || "", type: vehicle.model || vehicle.type, plate: vehicle.plate,
    driver: first.driver || current.driver || "", driverRegistration: first.driverRegistration || current.driverRegistration || "", driverPhone: first.driverPhone || current.driverPhone || "",
    leaderPhone: first.basePhone || current.basePhone || data.settings.leaderPhone || "", maintenancePhone: data.settings.maintenancePhone || "", ownerPhone: first.ownerPhone || vehicle.ownerPhone || "", ownerName: first.ownerName || vehicle.ownerName || "",
    km: String(first.odometer ?? vehicle.odometer ?? ""), baseName: first.baseName || current.baseName || "Não informada", priority: highestSeverity(issues), location: "", problem,
  });
  const photoUrl = await issuePhotoLink(first);
  if (photoUrl) params.set("photoUrl", photoUrl);
  if (first.photoName) params.set("photoName", first.photoName);
  return `${location.origin}${location.pathname.replace(/[^/]*$/, "aprovacao.html")}?v=98&${params.toString()}`;
}
async function showCompletion(inspection, vehicle, issues, sendResult) {
  const severe = issues.some((issue) => issue.severity === "Grave");
  $("#successTitle").textContent = issues.length ? (severe ? "Veículo com bloqueio de deslocamento." : "Ocorrência registrada.") : "Tudo certo para seguir.";
  $("#successText").textContent = issues.length ? `O formulário foi salvo com ${issues.length} ocorrência(s). Confira o chamado abaixo; após enviar para a liderança, você pode voltar ao início. ${sendResult.sent ? "A integração de e-mail foi acionada." : "Configure a integração para o envio automático por e-mail."}` : "Checklist concluído sem observações. Não é necessária aprovação da liderança.";
  const form = $("#submittedForm");
  const protocol = `MAN-${String(inspection.id || Date.now()).replaceAll("-", "").slice(-8).toUpperCase()}`;
  const occurrenceRows = issues.length ? issues.map((issue) => `<article class="submitted-issue ${esc(issue.severity.toLowerCase())}"><div><b>${esc(issue.itemName)}</b><span class="chip ${esc(issue.severity.toLowerCase())}">${esc(issue.severity)}</span></div><p>${esc(issue.description)}</p>${issue.photoPath ? `<img src="${esc(publicIssuePhotoUrl(issue))}" alt="Foto da ocorrência ${esc(issue.itemName)}" loading="lazy">` : ""}</article>`).join("") : `<p class="form-empty">Nenhuma ocorrência informada.</p>`;
  form.innerHTML = `<div class="form-top"><span class="form-mark">✓</span><div><small>URBAM FROTAS · RESPOSTA ENVIADA</small><h2>Formulário de inspeção</h2></div></div><div class="form-protocol"><span>Protocolo</span><b>${esc(protocol)}</b></div><div class="form-fields"><div><span>Colaborador</span><b>${esc(inspection.driver)}</b></div>${inspection.driverRegistration ? `<div><span>Matrícula</span><b>${esc(inspection.driverRegistration)}</b></div>` : ""}${inspection.driverRole ? `<div><span>Função</span><b>${esc(inspection.driverRole)}</b></div>` : ""}<div><span>Base</span><b>${esc(inspection.baseName)}</b></div>${inspection.driverEmail ? `<div><span>Cópia para e-mail</span><b>${esc(inspection.driverEmail)}</b></div>` : ""}<div><span>Veículo</span><b>Prefixo ${esc(vehicle.prefix)} · ${esc(vehicle.plate)}</b></div><div><span>Modelo</span><b>${esc(vehicle.model || vehicle.type)}</b></div><div><span>Quilometragem</span><b>${esc(inspection.odometer)} km</b></div><div><span>Data e hora</span><b>${esc(dateTime(inspection.createdAt))}</b></div></div><div class="form-occurrences"><h3>Ocorrências relatadas</h3>${occurrenceRows}</div>${inspection.notes ? `<div class="form-notes"><span>Observação geral</span><p>${esc(inspection.notes)}</p></div>` : ""}`;
  const actions = $("#dispatchActions");
  if (!issues.length) { actions.innerHTML = ""; showScreen("success"); return; }
  const buttons = [];
  const directToManagement = issues.some((issue) => issue.approvalRoute === "gestao");
  const approvalTarget = issues[0]?.basePhone || current.basePhone || data.settings.leaderPhone;
  if (directToManagement) {
    const managementLink = `${location.origin}${location.pathname.replace(/[^/]*$/, "gestao.html")}?v=149`;
    buttons.push(`<a href="${managementLink}" target="_blank" rel="noopener">Enviar</a>`);
  } else if (approvalTarget) {
    buttons.push(`<button type="button" class="primary-button" data-go="inicio">Enviar</button>`);
  }
  actions.innerHTML = buttons.join("");
  showScreen("success");
}

function renderManagementCommandCenter() {
  const panel = $("#managementCommandCenter"); if (!panel) return;
  const open = data.issues.filter((issue) => issue.status !== "resolvida");
  const todayValue = today();
  const count = (predicate) => open.filter(predicate).length;
  const cards = [
    ["Aguardando líder", count((issue) => !issue.leaderApproval && issue.approvalRoute !== "gestao"), "approval"],
    ["Agendados hoje", count((issue) => maintenanceOf(issue).scheduledAt?.slice(0, 10) === todayValue), "scheduled"],
    ["Em manutenção", count((issue) => ["Em execução", "Em manutenção", "Aguardando peça"].includes(maintenanceOf(issue).status)), "in-maintenance"],
    ["Prontos para retirada", count((issue) => maintenanceOf(issue).status === "Veículo pronto para retirada"), "ready"],
    ["Atrasados", count((issue) => maintenanceOf(issue).returnAt && maintenanceOf(issue).returnAt.slice(0, 10) < todayValue && !["Concluída", "Veículo pronto para retirada"].includes(maintenanceOf(issue).status)), "late"],
  ];
  panel.innerHTML = `<div class="section-action"><div><p class="eyebrow">PRIORIDADES DO DIA</p><h3>Central de pendências</h3><p>Toque em uma opção para abrir os chamados correspondentes.</p></div><span class="chip grave">${open.length} em aberto</span></div><div class="command-center-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${cards.map(([label, value, type]) => `<button type="button" class="command-card ${type} ${managerCommandFilter === type ? "active" : ""}" data-command-filter="${type}" aria-pressed="${managerCommandFilter === type}" style="min-width:0;${type === "late" ? "grid-column:span 2;" : ""}"><b>${value}</b><span>${label}</span><small>Ver chamados</small></button>`).join("")}</div>`;
}
function renderVehicleTimelines() {
  const cards = $$("#vehiclesPanel .vehicle-card");
  cards.forEach((card, index) => {
    const vehicle = data.vehicles[index]; if (!vehicle) return;
    const events = data.issues.filter((issue) => issue.vehicleId === vehicle.id || String(issue.vehiclePrefix) === String(vehicle.prefix)).flatMap((issue) => {
      const maintenance = maintenanceOf(issue), entries = [{ at: issue.createdAt, label: `Chamado aberto: ${issue.itemName || "manutenção"}` }];
      if (issue.leaderApproval?.approvedAt) entries.push({ at: issue.leaderApproval.approvedAt, label: `Liderança: ${issue.leaderApproval.status}` });
      if (maintenance.scheduledAt) entries.push({ at: maintenance.scheduledAt, label: `Agendado${maintenance.provider ? ` — ${maintenance.provider}` : ""}` });
      if (maintenance.readyAt) entries.push({ at: maintenance.readyAt, label: "Veículo pronto para retirada" });
      if (issue.resolvedAt) entries.push({ at: issue.resolvedAt, label: "Chamado concluído" });
      return entries;
    }).filter((event) => event.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
    if (!events.length) return;
    card.insertAdjacentHTML("beforeend", `<section class="vehicle-timeline"><b>Linha do tempo recente</b>${events.map((event) => `<p><span>●</span> ${esc(dateTime(event.at))} · ${esc(event.label)}</p>`).join("")}</section>`);
  });
}
function renderControl() {
  const open = data.issues.filter((issue) => issue.status === "aberta");
  $("#fleetCount").textContent = data.vehicles.length;
  $("#seriousCount").textContent = open.filter((issue) => issue.severity === "Grave").length;
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  $("#weekChecks").textContent = data.inspections.filter((inspection) => new Date(inspection.createdAt).getTime() >= since).length;
  renderManagementCommandCenter(); renderIssues(); renderReports(); renderHistory(); renderVehicles(); renderVehicleTimelines(); renderDrivers(); renderAuditLog();
  renderLeaderInstallTarget();
  renderDailyChecklistAlert();
  renderStorageIndicator();
  renderNotificationSettings();
  $$("[data-master-only]").forEach((element) => { element.hidden = !masterAdmin; });
  startDailyChecklistNotifications();
}
function formatBytes(bytes = 0) { if (!bytes) return "0 MB"; const mb = bytes / (1024 * 1024); return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`; }
function renderStorageIndicator() {
  const panel = $("#storageIndicator"); if (!panel) return;
  const photos = data.issues.filter((issue) => issue.photoPath || issue.photoUrl);
  const bytes = photos.reduce((total, issue) => total + Number(issue.photoSize || 0), 0);
  const ratio = Math.min(100, (bytes / (1024 * 1024 * 1024)) * 100);
  panel.className = `storage-indicator ${ratio >= 80 ? "warning" : ""}`;
  panel.innerHTML = `<div><b>Armazenamento de fotos</b><p>${photos.length} foto(s) registrada(s) · uso estimado: ${formatBytes(bytes)} de 1 GB.</p></div><div class="storage-progress" aria-label="Uso estimado de armazenamento"><i style="width:${ratio}%"></i></div><small>${ratio >= 80 ? "Atenção: faça backup e remova fotos antigas após confirmar o relatório." : "Este cálculo considera as fotos enviadas pelo URBAM Frotas."}</small>`;
}
function todayStart() { const value = new Date(); value.setHours(0, 0, 0, 0); return value.getTime(); }
function vehiclesWithoutChecklistToday() {
  const start = todayStart();
  const completed = new Set(data.inspections.filter((inspection) => new Date(inspection.createdAt).getTime() >= start).map((inspection) => inspection.vehicleId));
  return data.vehicles.filter((vehicle) => vehicle?.id && !completed.has(vehicle.id));
}
function renderDailyChecklistAlert() {
  const panel = $("#dailyChecklistAlert"); if (!panel) return;
  const hour = new Date().getHours();
  if (hour < 8) { panel.hidden = true; return; }
  const missing = vehiclesWithoutChecklistToday();
  panel.hidden = false;
  if (!missing.length) { panel.className = "daily-checklist-alert clear"; panel.innerHTML = `<b>✓ Checklist diário em dia</b><p>Todos os veículos cadastrados possuem checklist registrado hoje.</p>`; return; }
  panel.className = "daily-checklist-alert";
  panel.innerHTML = `<div><p class="eyebrow">ALERTA DIÁRIO · APÓS 08H</p><h2>${missing.length} veículo(s) sem checklist hoje</h2><p>Verifique os carros e caminhões abaixo antes da liberação.</p></div><ul>${missing.map((vehicle) => `<li>Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate || "sem placa")} · ${esc(vehicle.model || vehicle.type || "Veículo")}</li>`).join("")}</ul><button type="button" class="small-button whatsapp" id="sendDailyChecklistAlert">Enviar alerta à gestora</button>`;
}
function notificationPermission() { return "Notification" in window ? Notification.permission : "unsupported"; }
function renderNotificationSettings() {
  const status = $("#notificationStatus"); const button = $("#enableDailyNotifications"); if (!status || !button) return;
  const permission = notificationPermission();
  if (permission === "granted") { status.textContent = "Ativa: o computador será avisado após as 08h caso existam veículos sem checklist."; button.textContent = "✓ Notificações ativas"; button.disabled = true; return; }
  if (permission === "denied") { status.textContent = "As notificações foram bloqueadas neste navegador. Libere-as nas configurações do site para receber o alerta."; button.textContent = "Notificações bloqueadas"; button.disabled = true; return; }
  if (permission === "unsupported") { status.textContent = "Este navegador não oferece notificações do sistema."; button.hidden = true; return; }
  status.textContent = "Ative para receber o aviso de veículos sem checklist após as 08h."; button.textContent = "🔔 Ativar notificações"; button.disabled = false;
}
async function enableDailyNotifications() {
  if (!("Notification" in window)) return alert("Este navegador não oferece notificações do sistema.");
  const permission = await Notification.requestPermission();
  renderNotificationSettings();
  if (permission === "granted") { alert("Notificações ativadas neste computador."); notifyDailyChecklistIfNeeded(); }
}
function notifyDailyChecklistIfNeeded() {
  if (notificationPermission() !== "granted" || new Date().getHours() < 8) return;
  const missing = vehiclesWithoutChecklistToday(); if (!missing.length) return;
  const dayKey = new Date().toISOString().slice(0, 10); const notificationKey = `checkfrota-daily-checklist-notification-${dayKey}`;
  if (localStorage.getItem(notificationKey)) return;
  const notification = new Notification("URBAM Frotas: checklist pendente", { body: `${missing.length} veículo(s) sem checklist hoje. Abra o painel de Gestão para verificar.`, tag: "checkfrota-checklist-diario", renotify: true });
  notification.onclick = () => { window.focus(); notification.close(); };
  localStorage.setItem(notificationKey, new Date().toISOString());
}
function startDailyChecklistNotifications() {
  notifyDailyChecklistIfNeeded();
  if (dailyChecklistNotificationTimer) return;
  dailyChecklistNotificationTimer = window.setInterval(() => { renderDailyChecklistAlert(); notifyDailyChecklistIfNeeded(); }, 60 * 1000);
}
function sendDailyChecklistAlert() {
  const missing = vehiclesWithoutChecklistToday();
  if (!missing.length) return alert("Todos os veículos cadastrados possuem checklist hoje.");
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date());
  const list = missing.map((vehicle, index) => `${index + 1}. Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate || "sem placa"} · ${vehicle.model || vehicle.type || "Veículo"}`).join("\n");
  const message = `*URBAM FROTAS — ALERTA DIÁRIO DE CHECKLIST*\n\nData: ${date}\nHorário da conferência: ${new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date())}\n\nHá ${missing.length} carro(s) ou caminhão(ões) sem checklist registrado hoje:\n\n${list}\n\nSolicitamos verificar a situação e providenciar o preenchimento antes da operação.`;
  window.open(whatsappLink(DAILY_CHECKLIST_ALERT_PHONE, message), "_blank", "noopener");
}
function renderLeaderInstallTarget() {
  const select = $("#leaderInstallBase"); const hint = $("#leaderInstallHint");
  if (!select || !hint) return;
  const base = select.value; const phone = BASES[base];
  hint.textContent = phone ? `O link será enviado para ${LEADER_BASE_LABELS[base] || `Base ${base}`}: ${formatPhone(phone)}.` : "Escolha a base para conferir o número que receberá o link.";
}
function sendLeaderInstall() {
  const base = $("#leaderInstallBase")?.value; const phone = BASES[base];
  if (!phone) return alert("Selecione Base Vertical, Base Horizontal ou Base Abrigo.");
  const label = LEADER_BASE_LABELS[base] || `Base ${base}`;
  const link = `https://4lves-dev.github.io/checkfrota/instalar-lider.html?v=150&base=${encodeURIComponent(base)}`;
  const message = `*URBAM FROTAS — APLICATIVO DA LIDERANÇA*\n\nOlá, ${label}.\n\nEste é o link de instalação do painel da liderança desta base:\n${link}\n\nApós instalar, utilize o aplicativo para consultar as ocorrências e registrar a aprovação ou recusa.`;
  window.open(whatsappLink(phone, message), "_blank", "noopener");
}
function localDateValue(value) { const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); }
function isWashIssue(issue) { return issue?.itemName === "Solicitação de lavagem"; }
function issueType(issue) { if (isWashIssue(issue)) return "Lavagem"; if (/pneus|estepe/i.test(issue?.itemName || "")) return "Pneus"; if (/documentos/i.test(issue?.itemName || "")) return "Documentação"; return "Manutenção mecânica"; }
function issueMatchesManagerFilters(issue) {
  const filter = managerIssueFilters;
  const maintenance = maintenanceOf(issue), todayValue = today();
  const commandMatch = !managerCommandFilter || (managerCommandFilter === "approval" && !issue.leaderApproval && issue.approvalRoute !== "gestao") || (managerCommandFilter === "scheduled" && maintenance.scheduledAt?.slice(0, 10) === todayValue) || (managerCommandFilter === "in-maintenance" && ["Em execução", "Em manutenção", "Aguardando peça"].includes(maintenance.status)) || (managerCommandFilter === "ready" && maintenance.status === "Veículo pronto para retirada") || (managerCommandFilter === "late" && maintenance.returnAt && maintenance.returnAt.slice(0, 10) < todayValue && !["Concluída", "Veículo pronto para retirada"].includes(maintenance.status));
  return commandMatch && (!filter.base || issue.baseName === filter.base) && (!filter.vehicle || issue.vehicleId === filter.vehicle) && (!filter.date || localDateValue(issue.createdAt) === filter.date) && (!filter.owner || normalizeOwnerName(issue.ownerName) === filter.owner) && (!filter.type || issueType(issue) === filter.type);
}
function renderIssueFilters(issues) {
  const bases = [...new Set(issues.map((issue) => issue.baseName).filter(Boolean))].sort();
  const vehicles = data.vehicles.filter((vehicle) => issues.some((issue) => issue.vehicleId === vehicle.id));
  const owners = [...new Set(issues.map((issue) => normalizeOwnerName(issue.ownerName)).filter(Boolean))].sort();
  const types = ["Manutenção mecânica", "Lavagem", "Documentação", "Pneus"].filter((type) => issues.some((issue) => issueType(issue) === type));
  const commandLabel = { approval: "Aguardando líder", scheduled: "Agendados hoje", "in-maintenance": "Em manutenção", ready: "Prontos para retirada", late: "Atrasados" }[managerCommandFilter];
  return `<section class="manager-filters"><div><b>Pendências da frota${commandLabel ? ` · ${commandLabel}` : ""}</b><small>Filtre por base, veículo, categoria, data ou responsável.</small></div><label>Base<select id="issueFilterBase"><option value="">Todas</option>${bases.map((value) => `<option value="${esc(value)}" ${managerIssueFilters.base === value ? "selected" : ""}>${esc(value)}</option>`).join("")}</select></label><label>Veículo<select id="issueFilterVehicle"><option value="">Todos</option>${vehicles.map((vehicle) => `<option value="${esc(vehicle.id)}" ${managerIssueFilters.vehicle === vehicle.id ? "selected" : ""}>${esc(vehicle.prefix)} · ${esc(vehicle.plate)}</option>`).join("")}</select></label><label>Categoria<select id="issueFilterType"><option value="">Todas</option>${types.map((value) => `<option value="${esc(value)}" ${managerIssueFilters.type === value ? "selected" : ""}>${esc(value)}</option>`).join("")}</select></label><label>Data<input id="issueFilterDate" type="date" value="${esc(managerIssueFilters.date)}"></label><label>Responsável<select id="issueFilterOwner"><option value="">Todos</option>${owners.map((value) => `<option value="${esc(value)}" ${managerIssueFilters.owner === value ? "selected" : ""}>${esc(value)}</option>`).join("")}</select></label><button type="button" class="small-button" id="clearIssueFilters">Limpar filtros</button></section>`;
}
function bindIssueFilters() {
  [["#issueFilterBase", "base"], ["#issueFilterVehicle", "vehicle"], ["#issueFilterType", "type"], ["#issueFilterDate", "date"], ["#issueFilterOwner", "owner"]].forEach(([selector, key]) => $(selector)?.addEventListener("change", (event) => { managerIssueFilters[key] = event.target.value; renderIssues(); }));
}
function empty() { return $("#emptyStateTemplate").content.cloneNode(true); }
function maintenanceOf(issue) { return { status: isWashIssue(issue) ? "Solicitada" : "Pendente", scheduledAt: "", returnAt: "", provider: "", address: "", service: "", cost: "", feedback: "", readyAt: "", ...issue.maintenance }; }
function renderIssues() {
  const panel = $("#issuesPanel");
  const allIssues = data.issues.filter((issue) => issue.status !== "resolvida" && maintenanceOf(issue).status !== "Concluída").sort((a,b) => severityRank(b.severity) - severityRank(a.severity) || new Date(b.createdAt)-new Date(a.createdAt));
  const issues = allIssues.filter(issueMatchesManagerFilters);
  panel.innerHTML = renderIssueFilters(allIssues);
  if (!issues.length) { panel.append(empty()); bindIssueFilters(); return; }
  panel.innerHTML += issues.map((issue, index) => {
    const maintenance = maintenanceOf(issue);
    const schedule = maintenance.scheduledAt ? ` · ${dateTime(maintenance.scheduledAt)}` : "";
    const isFirstFromCall = issues.findIndex((entry) => entry.inspectionId === issue.inspectionId) === index;
    const callPhotos = isFirstFromCall ? issues.filter((entry) => entry.inspectionId === issue.inspectionId && entry.photoPath) : [];
    const gallery = callPhotos.length ? `<div class="issue-photo-gallery"><b>Fotos do chamado (${callPhotos.length})</b><div>${callPhotos.map((photo) => `<button type="button" class="photo-thumb" data-view-photo="${photo.id}" title="Abrir foto de ${esc(photo.itemName)}"><img src="${esc(publicIssuePhotoUrl(photo))}" alt="Foto: ${esc(photo.itemName)}"><span>${esc(photo.itemName)}</span></button>`).join("")}</div></div>` : "";
    const leaderApproval = issue.leaderApproval;
    const approvalBox = leaderApproval?.status === "Aprovada" ? `<section class="manager-approval"><b>✓ Aprovado pela liderança</b><span>${esc(leaderApproval.approvedBy || `Base ${issue.baseName || ""}`)} · ${dateTime(leaderApproval.approvedAt)}</span><p>${esc(leaderApproval.note || "Sem observação da liderança.")}</p><label class="helper"><b>Mensagem para o proprietário do veículo</b></label><textarea readonly aria-label="Mensagem para o proprietário">${esc(buildApprovedOwnerMessage(issue))}</textarea><div class="issue-actions"><button class="small-button" data-copy-owner-message="${issue.id}">Copiar mensagem ao proprietário</button><button class="small-button whatsapp" data-approved-owner="${issue.id}">Enviar ao proprietário</button><button class="small-button whatsapp" data-manager-dispatch="${issue.id}">${leaderApproval.dispatchStatus === "Enviado" ? "✓ Enviado ao grupo" : "Enviar ao grupo"}</button></div></section>` : "";
    return `<article class="issue-card ${issue.severity.toLowerCase()}">
      <div class="card-heading"><div><h3>${esc(issue.itemName)}</h3><p class="vehicle-label">Prefixo ${esc(issue.vehiclePrefix || "—")} · ${esc(issue.vehiclePlate)} · ${esc(issue.vehicleModel || issue.vehicleType)}${issue.vehicleBase ? ` · ${esc(issue.vehicleBase)}` : ""} · ${esc(issue.odometer ?? "—")} km</p></div><span class="chip ${issue.severity.toLowerCase()}">${esc(issueType(issue))}</span></div>
      <p class="issue-desc">${esc(issue.description)}</p>
      <p class="meta">${esc(issue.driver)} · ${dateTime(issue.createdAt)}${issue.photoName ? ` · 📷 ${esc(issue.photoName)}` : ""}</p>
      ${gallery}
      ${approvalBox}
      <p class="maintenance-meta"><b>Manutenção:</b> ${esc(maintenance.status)}${schedule}${maintenance.returnAt ? ` · retorno: ${dateTime(maintenance.returnAt)}` : ""}${maintenance.provider ? ` · ${esc(maintenance.provider)}` : ""}${maintenance.service ? ` · ${esc(maintenance.service)}` : ""}${maintenance.cost !== "" ? ` · R$ ${Number(maintenance.cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}</p>
      <div class="issue-actions">${issue.photoPath ? `<button class="small-button photo-button" data-view-photo="${issue.id}">📷 Ver foto</button>` : ""}<button class="small-button" data-maintenance-issue="${issue.id}">${isWashIssue(issue) ? "Agendar lavagem / retorno" : "Agendar / retorno"}</button><button class="small-button whatsapp" data-whatsapp-issue="${issue.id}">Enviar ao proprietário</button><button class="small-button" data-close-issue="${issue.id}">Marcar resolvida</button></div>
    </article>`;
  }).join("");
  bindIssueFilters();
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
  const rows = data.issues.map((issue) => { const maintenance = maintenanceOf(issue); return { "Data": dateTime(issue.createdAt), "Prefixo": issue.vehiclePrefix || "", "Placa": issue.vehiclePlate, "Tipo / modelo": issue.vehicleModel || issue.vehicleType, "Quilometragem (km)": issue.odometer ?? "", "Ocorrência": issue.itemName, "Gravidade": issue.severity, "Descrição": issue.description, "Colaborador": issue.driver, "Matrícula": issue.driverRegistration || "", "Situação": maintenance.status, "Agendamento": maintenance.scheduledAt ? dateTime(maintenance.scheduledAt) : "", "Previsão de retorno": maintenance.returnAt ? dateTime(maintenance.returnAt) : "", "Oficina / responsável": maintenance.provider, "Serviço": maintenance.service, "Custo (R$)": maintenance.cost === "" ? "" : maintenance.cost, "Retorno": maintenance.feedback }; });
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "Data": "Nenhuma solicitação registrada" }]);
  sheet["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 13 }, { wch: 28 }, { wch: 19 }, { wch: 25 }, { wch: 12 }, { wch: 45 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 28 }, { wch: 32 }, { wch: 15 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, sheet, "Solicitações");
  XLSX.writeFile(workbook, `relatorio-solicitacoes-${today()}.xlsx`, { compression: true });
}
function renderHistory() {
  const panel = $("#historyPanel"); panel.innerHTML = "";
  const resolvedIssues = data.issues.filter((issue) => issue.status === "resolvida" || maintenanceOf(issue).status === "Concluída").sort((a, b) => new Date(b.resolvedAt || b.createdAt) - new Date(a.resolvedAt || a.createdAt));
  const inspectionsMarkup = data.inspections.slice(0, 30).map((inspection) => {
    const issueCount = inspection.items.filter((item) => item.status === "issue").length;
    return `<article class="history-card"><div><b>Prefixo ${esc(inspection.vehiclePrefix || "—")} · ${esc(inspection.vehiclePlate)} · ${esc(inspection.driver)}</b><p class="meta">${esc(inspection.odometer ?? "—")} km · ${dateTime(inspection.createdAt)}${inspection.notes ? ` · ${esc(inspection.notes)}` : ""}</p></div>${issueCount ? `<span class="chip grave">${issueCount} ocorrência(s)</span>` : `<span class="chip ok">OK</span>`}</article>`;
  }).join("");
  const resolvedMarkup = resolvedIssues.map((issue) => `<article class="history-card"><div><b>✓ Resolvido · Prefixo ${esc(issue.vehiclePrefix || "—")} · ${esc(issue.vehiclePlate)} · ${esc(issue.itemName)}</b><p class="meta">${esc(issue.description || "Sem observação")} · concluído em ${dateTime(issue.resolvedAt || issue.maintenance?.updatedAt || issue.createdAt)}</p></div><span class="chip ok">Resolvido</span></article>`).join("");
  if (!inspectionsMarkup && !resolvedMarkup) { panel.append(empty()); return; }
  panel.innerHTML = `${resolvedMarkup ? `<section class="history-resolved"><div class="section-action"><h3>Chamados resolvidos</h3><span class="chip ok">${resolvedIssues.length}</span></div>${resolvedMarkup}</section>` : ""}${inspectionsMarkup ? `<section class="history-inspections"><div class="section-action"><h3>Checklists realizados</h3></div>${inspectionsMarkup}</section>` : ""}`;
}
function renderVehicles() {
  const panel = $("#vehiclesPanel");
  panel.innerHTML = `<div class="section-action"><h3>Veículos cadastrados</h3><button class="add-button" id="newVehicle">+ Cadastrar</button></div>${data.vehicles.length ? data.vehicles.map((vehicle) => `<article class="vehicle-card"><div><h3>Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} <span class="vehicle-label">· ${esc(vehicle.model || vehicle.type)}</span></h3><p>${esc(vehicle.ownerName)}${vehicle.contract ? ` · Contrato: ${esc(vehicle.contract)}` : ""}${vehicle.odometer !== "" ? ` · ${esc(vehicle.odometer)} km` : ""}</p></div><div class="issue-actions"><button class="small-button" data-edit-vehicle="${vehicle.id}">Editar</button><button class="small-button danger-button" data-delete-vehicle="${vehicle.id}">Excluir</button></div></article>`).join("") : ""}`;
}
function vehicleHistoryMarkup(vehicle) {
  const inspections = data.inspections.filter((inspection) => inspection.vehicleId === vehicle.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const issues = data.issues.filter((issue) => issue.vehicleId === vehicle.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalCost = issues.reduce((total, issue) => total + Number(maintenanceOf(issue).cost || 0), 0);
  const photos = issues.filter((issue) => issue.photoPath || issue.photoUrl);
  return `<section class="vehicle-history"><div class="vehicle-history-summary"><b>Ficha do veículo</b><span>${inspections.length} checklist(s) · ${issues.length} ocorrência(s) · custo: R$ ${totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div><div class="vehicle-history-list">${inspections.length ? inspections.slice(0, 12).map((inspection) => { const count = (inspection.items || []).filter((item) => item.status === "issue").length; return `<p><b>${dateTime(inspection.createdAt)}</b> · ${esc(inspection.driver)}${inspection.driverRegistration ? ` · matrícula ${esc(inspection.driverRegistration)}` : ""} · ${esc(inspection.odometer)} km · ${count ? `${count} ocorrência(s)` : "Checklist OK"}</p>`; }).join("") : "<p>Nenhum checklist registrado para este veículo.</p>"}</div>${issues.length ? `<div class="vehicle-history-list">${issues.map((issue) => { const maintenance = maintenanceOf(issue); return `<p><b>${esc(issue.itemName)}</b> · ${esc(maintenance.status)}${maintenance.provider ? ` · ${esc(maintenance.provider)}` : ""}${maintenance.cost !== "" ? ` · R$ ${Number(maintenance.cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}</p>`; }).join("")}</div>` : ""}${photos.length ? `<div class="issue-photo-gallery"><b>Fotos vinculadas ao veículo (${photos.length})</b><div>${photos.map((issue) => `<button type="button" class="photo-thumb" data-view-photo="${issue.id}"><img src="${esc(publicIssuePhotoUrl(issue))}" alt="Foto: ${esc(issue.itemName)}"><span>${esc(issue.itemName)}</span></button>`).join("")}</div></div>` : ""}</section>`;
}
function renderVehicles() {
  const panel = $("#vehiclesPanel");
  const cards = data.vehicles.map((vehicle) => `<article class="vehicle-card"><div><h3>Prefixo ${esc(vehicle.prefix || "—")} · ${esc(vehicle.plate)} <span class="vehicle-label">· ${esc(vehicle.model || vehicle.type)}</span></h3><p>${esc(vehicle.ownerName)}${vehicle.manager ? ` · Gestor: ${esc(vehicle.manager)}` : ""}${vehicle.base ? ` · Base: ${esc(vehicle.base)}` : ""}${vehicle.ownerPhone ? ` · Tel.: ${esc(formatPhone(vehicle.ownerPhone))}` : ""}${vehicle.contract ? ` · Contrato: ${esc(vehicle.contract)}` : ""}${vehicle.odometer !== "" ? ` · ${esc(vehicle.odometer)} km` : ""}</p></div><div class="issue-actions"><button class="small-button" data-vehicle-history="${vehicle.id}">${selectedVehicleHistoryId === vehicle.id ? "Fechar ficha" : "Ver ficha"}</button><button class="small-button" data-edit-vehicle="${vehicle.id}">Editar</button><button class="small-button danger-button" data-delete-vehicle="${vehicle.id}">Excluir</button></div>${selectedVehicleHistoryId === vehicle.id ? vehicleHistoryMarkup(vehicle) : ""}</article>`).join("");
  const actions = masterAdmin ? `<div class="vehicle-actions"><button class="restore-button" id="restoreFleet">↺ Restaurar frota</button><button class="add-button" id="newVehicle">+ Cadastrar veículo/caminhão</button></div>` : "";
  panel.innerHTML = `<div class="section-action"><h3>Veículos e caminhões cadastrados</h3>${actions}</div>${cards}`;
}
function renderDrivers() {
  const panel = $("#driversPanel");
  if (!panel) return;
  const registered = employeeRoster().sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const missing = driversMissingRegistration().sort((a, b) => a.localeCompare(b, "pt-BR"));
  const employeeAction = masterAdmin ? `<button class="add-button" id="newEmployee">+ Cadastrar colaborador</button>` : "";
  const card = (driver) => {
    const accessLevel = employeeAccessLevel(driver); const base = driver.leader_base || "";
    const manage = masterAdmin ? `<div class="issue-actions"><button class="small-button" data-edit-employee="${esc(driver.registration)}">Editar</button><button class="small-button danger-button" data-delete-employee="${esc(driver.registration)}">Excluir</button></div>` : "";
    return `<article class="driver-row"><div><b>${esc(driver.name)}</b><span>Matrícula ${esc(driver.registration)}${driver.role ? ` · ${esc(driver.role)}` : ""}${accessLevel !== "colaborador" ? ` · <strong>${esc(ACCESS_LEVEL_LABELS[accessLevel] || accessLevel)}${accessLevel === "lider" && base ? ` — ${esc(base)}` : ""}</strong>` : ""}</span></div>${manage}</article>`;
  };
  panel.innerHTML = `<section class="driver-registry"><div class="section-action"><div><h3>Banco de colaboradores</h3><p>Defina o perfil: Líder aprova a base; Coordenador aprova as bases; Gestor acompanha toda a frota. O acesso inicial usa matrícula como usuário e senha.</p></div><div class="vehicle-actions"><span class="chip ok">${registered.length} cadastrados</span>${employeeAction}</div></div><div class="driver-grid">${registered.map(card).join("")}</div></section><section class="missing-drivers"><div class="section-action"><div><h3>Colaboradores sem matrícula</h3><p>Relação identificada na primeira tabela e ainda sem vínculo na segunda.</p></div><span class="chip grave">${missing.length} pendentes</span></div>${missing.length ? `<ul>${missing.map((name) => `<li>${esc(name)}</li>`).join("")}</ul>` : "<p>Todos os colaboradores possuem matrícula cadastrada.</p>"}</section>`;
}
function renderAuditLog() {
  const panel = $("#auditPanel");
  if (!panel) return;
  const logs = data.issues.filter((issue) => issue.leaderApproval).sort((a, b) => new Date(b.leaderApproval?.approvedAt || b.createdAt) - new Date(a.leaderApproval?.approvedAt || a.createdAt));
  panel.innerHTML = `<section class="audit-log"><div class="section-action"><div><h3>Log de solicitações</h3><p>Registro para auditoria das decisões tomadas pela liderança.</p></div><span class="chip ok">${logs.length} registro(s)</span></div>${logs.length ? logs.map((issue) => { const approval = issue.leaderApproval || {}; const status = approval.status || "Sem decisão"; const statusClass = status === "Aprovada" ? "ok" : status === "Recusada" ? "grave" : "media"; return `<article class="audit-entry"><div class="card-heading"><div><h3>${esc(status)}</h3><p class="vehicle-label">Prefixo ${esc(issue.vehiclePrefix || "—")} · ${esc(issue.vehiclePlate || "—")} · ${esc(issue.itemName || "Ocorrência")}</p></div><span class="chip ${statusClass}">${esc(status)}</span></div><p><b>Colaborador:</b> ${esc(issue.driver || "—")}${issue.driverRegistration ? ` · matrícula ${esc(issue.driverRegistration)}` : ""}</p><p><b>Decisão:</b> ${esc(approval.approvedBy || "Liderança")} · ${dateTime(approval.approvedAt || issue.createdAt)}</p>${approval.note ? `<p><b>Observação:</b> ${esc(approval.note)}</p>` : ""}<p class="audit-status"><b>Fluxo:</b> ${esc(approval.dispatchStatus || "Registrado")}</p></article>`; }).join("") : `<div class="empty-state"><span>⌁</span><p>Nenhuma decisão da liderança registrada ainda.</p></div>`}</section>`;
}
function openVehicleDialog(id = "") {
  if (!requireMasterAccess()) return;
  const vehicle = vehicleById(id);
  $("#vehicleDialogTitle").textContent = vehicle ? "Editar veículo" : "Novo veículo";
  $("#editVehicleId").value = vehicle?.id || "";
  $("#vehiclePrefix").value = vehicle?.prefix || ""; $("#vehiclePlate").value = vehicle?.plate || ""; $("#vehicleType").value = vehicle?.type || "Caminhão"; $("#vehicleModel").value = vehicle?.model || ""; $("#vehicleContract").value = vehicle?.contract || ""; $("#vehicleUrbamContract").value = vehicle?.urbamContract || ""; $("#vehicleOdometer").value = vehicle?.odometer ?? "";
  $("#vehicleOwnerName").value = vehicle?.ownerName || ""; $("#vehicleOwnerPhone").value = vehicle?.ownerPhone || ""; $("#vehicleEmail").value = vehicle?.email || "";
  $("#vehicleDialog").showModal();
}
function toggleEmployeeLeaderFields() {
  const enabled = $("#employeeAccessLevel")?.value === "lider";
  $("#employeeLeaderBaseField").hidden = !enabled;
  $("#employeeLeaderBase").hidden = !enabled;
  $("#employeeLeaderBase").required = enabled;
}
function openEmployeeDialog(employee = null) {
  if (!requireMasterAccess()) return;
  editingEmployeeRegistration = employee?.registration || "";
  $("#employeeDialogTitle").textContent = employee ? "Configurar colaborador" : "Novo colaborador";
  $("#employeeRegistration").value = employee?.registration || ""; $("#employeeRegistration").readOnly = Boolean(employee);
  $("#employeeName").value = employee?.name || ""; $("#employeeRole").value = employee?.role || "";
  $("#employeeAccessLevel").value = employeeAccessLevel(employee); $("#employeeLeaderBase").value = employee?.leader_base || ""; toggleEmployeeLeaderFields();
  $("#employeeDialog").showModal();
}
async function saveEmployee() {
  if (!requireMasterAccess()) return;
  const registration = $("#employeeRegistration").value.replace(/\D/g, "");
  const name = $("#employeeName").value.trim().toUpperCase();
  const role = $("#employeeRole").value.trim();
  const access_level = $("#employeeAccessLevel").value;
  const leader = access_level === "lider";
  const leader_base = leader ? $("#employeeLeaderBase").value : null;
  if (!registration || !name || !role) { $("#employeeForm").reportValidity(); return; }
  if (leader && !leader_base) { $("#employeeForm").reportValidity(); return; }
  try {
    const rows = await cloudRequest("/rest/v1/fleet_employees?on_conflict=registration", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ registration, name, role, active: true, leader, leader_base, access_level }) });
    const saved = rows?.[0] || { registration, name, role, active: true, leader, leader_base, access_level };
    employeeDatabase = [...employeeDatabase.filter((entry) => String(entry.registration) !== registration), saved];
    $("#employeeDialog").close(); renderDrivers(); alert(access_level === "colaborador" ? "Colaborador salvo no banco de dados." : `${ACCESS_LEVEL_LABELS[access_level]} salvo. No primeiro acesso, a senha é a matrícula e deverá ser trocada por uma senha numérica.`);
  } catch (error) { alert("Não foi possível salvar o colaborador no banco. Verifique se a tabela e as permissões do Supabase foram configuradas."); console.warn(error); }
}
async function deactivateEmployee(registration) {
  if (!requireMasterAccess()) return;
  const employee = employeeDatabase.find((entry) => String(entry.registration) === String(registration));
  if (!employee || !confirm(`Excluir ${employee.name} do cadastro ativo? O histórico de chamados será preservado.`)) return;
  try {
    await cloudRequest(`/rest/v1/fleet_employees?registration=eq.${encodeURIComponent(registration)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ active: false }) });
    employeeDatabase = employeeDatabase.filter((entry) => String(entry.registration) !== String(registration)); renderDrivers();
  } catch (error) { alert("Não foi possível excluir o colaborador do cadastro ativo."); console.warn(error); }
}
function saveVehicle() {
  if (!requireMasterAccess()) return;
  const id = $("#editVehicleId").value;
  const detail = { prefix: $("#vehiclePrefix").value.trim(), plate: $("#vehiclePlate").value.trim().toUpperCase(), type: $("#vehicleType").value, model: $("#vehicleModel").value.trim(), contract: $("#vehicleContract").value.trim(), urbamContract: $("#vehicleUrbamContract").value.trim(), odometer: $("#vehicleOdometer").value === "" ? "" : Number($("#vehicleOdometer").value), ownerName: $("#vehicleOwnerName").value.trim(), ownerPhone: phoneOnly($("#vehicleOwnerPhone").value), email: $("#vehicleEmail").value.trim() };
  if (!detail.prefix || !detail.plate || !detail.ownerName) { $("#vehicleForm").reportValidity(); return; }
  if (id) Object.assign(vehicleById(id), detail); else data.vehicles.push({ id: crypto.randomUUID(), ...detail });
  const savedVehicle = vehicleById(id || data.vehicles[data.vehicles.length - 1].id);
  saveData(); void cloudSave("fleet_vehicles", { id: savedVehicle?.id || id, prefix: detail.prefix, plate: detail.plate, data: savedVehicle }); void recordAuditEvent({ id: `vehicle:${savedVehicle?.id || id}`, vehicleId: savedVehicle?.id || id }, id ? "veiculo_editado" : "veiculo_cadastrado", `Prefixo ${detail.prefix} · ${detail.plate}`); $("#vehicleDialog").close(); renderControl(); renderStart();
}
function deleteVehicle(id) {
  if (!requireMasterAccess()) return;
  const vehicle = vehicleById(id); if (!vehicle) return;
  if (!confirm(`Excluir o veículo Prefixo ${vehicle.prefix || "—"} · ${vehicle.plate} da lista de uso? O histórico de chamados será preservado.`)) return;
  data.vehicles = data.vehicles.filter((entry) => entry.id !== id);
  if (initialData.vehicles.some((entry) => entry.id === id)) data.removedVehicleIds = [...new Set([...(data.removedVehicleIds || []), id])];
  saveData(); renderControl(); renderStart();
}
async function restoreFleet() {
  if (!requireMasterAccess()) return;
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
  const message = `*URBAM FROTAS — SOLICITAÇÃO DE MANUTENÇÃO*\n\nPrezado(a) responsável,\n\nSolicitamos avaliação e agendamento de manutenção para o veículo abaixo.\n\n*Veículo:* Prefixo ${issue.vehiclePrefix || "—"} · ${issue.vehicleModel || issue.vehicleType || "—"} · Placa ${issue.vehiclePlate || "—"}\n*Quilometragem:* ${issue.odometer ?? "—"} km\n*Base responsável:* ${issue.baseName || "—"}\n\n*Ocorrência relatada:*\n${issue.itemName || "Ocorrência"}: ${issue.description || "—"}\n\nPedimos, por gentileza, informar disponibilidade para atendimento e previsão de agendamento.\n\nAtenciosamente,\nURBAM Frotas — Gestão de Manutenção`;
  const target = issue.ownerPhone || data.settings.maintenancePhone;
  if (!target) return alert("Cadastre o número de WhatsApp do responsável ou da base nas configurações.");
  window.open(whatsappLink(target, message), "_blank", "noopener");
}
function buildApprovedOwnerMessage(issue) {
  return `*URBAM FROTAS — SOLICITAÇÃO DE MANUTENÇÃO*\n\nPrezado(a) responsável,\n\nSolicitamos, por gentileza, a avaliação e o agendamento de manutenção para o veículo abaixo.\n\n*Veículo:* Prefixo ${issue.vehiclePrefix || "—"} · Placa ${issue.vehiclePlate || "—"}\n*Ocorrência:* ${issue.itemName || "—"}\n*Problema relatado:* ${issue.description || "—"}\n\nPedimos o retorno com data, horário e local para atendimento.\n\nAtenciosamente,\nURBAM Frotas — Gestão`;
}
function sendApprovedOwnerWhatsApp(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  const message = buildApprovedOwnerMessage(issue);
  const target = issue.ownerPhone; if (!target) return alert("Este veículo não possui WhatsApp de responsável cadastrado.");
  window.open(whatsappLink(target, message), "_blank", "noopener");
}
async function copyOwnerMessage(issueId) { const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return; try { await navigator.clipboard.writeText(buildApprovedOwnerMessage(issue)); alert("Mensagem para o proprietário copiada."); } catch { alert("Não foi possível copiar automaticamente. Selecione a mensagem e copie."); } }
function buildSchedulingReturn(issue, maintenance = maintenanceOf(issue)) {
  const schedule = maintenance.scheduledAt ? dateTime(maintenance.scheduledAt) : "A confirmar";
  return `*RETORNO DE AGENDAMENTO — MANUTENÇÃO*\n\n*Veículo:* Prefixo ${issue.vehiclePrefix || "—"} · ${issue.vehiclePlate || "—"}\n*Ocorrência:* ${issue.itemName || "—"}\n*Situação:* ${maintenance.status || "Pendente"}\n*Agendamento:* ${schedule}\n${maintenance.provider ? `*Oficina / responsável:* ${maintenance.provider}\n` : ""}${maintenance.feedback ? `*Retorno:* ${maintenance.feedback}\n` : ""}\nEsta atualização foi registrada pela Gestão de Frota para ciência da equipe de manutenção.`;
}
function sendSchedulingReturn(issue, maintenance = maintenanceOf(issue)) {
  const target = data.settings.maintenanceGroupPhone || MAINTENANCE_GROUP_PHONE;
  if (!target) return alert("Cadastre o WhatsApp do grupo de manutenção em Configurações da base.");
  window.open(whatsappLink(target, buildSchedulingReturn(issue, maintenance)), "_blank", "noopener");
}
async function dispatchManagerMaintenance(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId);
  const approval = issue?.leaderApproval;
  if (!issue || !approval?.maintenanceMessage) return alert("A mensagem aprovada ainda não está disponível.");
  const phone = data.settings.maintenanceGroupPhone || MAINTENANCE_GROUP_PHONE;
  window.open(whatsappLink(phone, approval.maintenanceMessage), "_blank", "noopener");
  issue.leaderApproval = { ...approval, dispatchStatus: "Enviado", dispatchedAt: new Date().toISOString() };
  saveData(); renderControl();
  try { await cloudUpdateIssue(issue); } catch (error) { console.warn("Não foi possível registrar o envio", error); }
}
async function copyManagerMaintenanceMessage(issueId) {
  const message = data.issues.find((entry) => entry.id === issueId)?.leaderApproval?.maintenanceMessage;
  if (!message) return;
  try { await navigator.clipboard.writeText(message); alert("Mensagem copiada."); }
  catch { alert("Não foi possível copiar automaticamente. Selecione o texto da mensagem e copie."); }
}
function maintenanceFormValues() { const status = $("#maintenanceStatus").value; return { status, scheduledAt: $("#maintenanceScheduledAt").value, returnAt: $("#maintenanceReturnAt").value, provider: $("#maintenanceProvider").value.trim(), address: $("#maintenanceAddress").value.trim(), service: $("#maintenanceService").value.trim(), cost: $("#maintenanceCost").value === "" ? "" : Number($("#maintenanceCost").value), feedback: $("#maintenanceFeedback").value.trim(), readyAt: status === "Veículo pronto para retirada" ? new Date().toISOString() : "", updatedAt: new Date().toISOString() }; }
function buildMaintenanceMessage(issue) {
  const maintenance = maintenanceOf(issue);
  return `*RETORNO DE SERVIÇO — ${maintenance.status.toUpperCase()}*\n\nVeículo: Prefixo ${issue.vehiclePrefix || "—"} · ${issue.vehiclePlate} (${issue.vehicleModel || issue.vehicleType})\nQuilometragem: ${issue.odometer ?? "Não informada"} km\nSolicitação: ${issue.itemName}\n${maintenance.scheduledAt ? `Agendamento: ${dateTime(maintenance.scheduledAt)}\n` : ""}${maintenance.returnAt ? `Previsão de retorno: ${dateTime(maintenance.returnAt)}\n` : ""}${maintenance.provider ? `Oficina / responsável: ${maintenance.provider}\n` : ""}${maintenance.service ? `Serviço: ${maintenance.service}\n` : ""}${maintenance.cost !== "" ? `Custo: R$ ${Number(maintenance.cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n` : ""}${maintenance.feedback ? `Retorno: ${maintenance.feedback}\n` : ""}\nSolicitação original: ${issue.description}`;
}
function buildMaintenanceGroupMessage() {
  const issues = data.issues.filter((issue) => issue.status === "aberta" || maintenanceOf(issue).status !== "Concluída")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!issues.length) return "*STATUS DA MANUTENÇÃO*\n\nNão há ocorrências em aberto.";
  const list = issues.map((issue, index) => {
    const maintenance = maintenanceOf(issue);
    const schedule = maintenance.scheduledAt ? `\nAgendamento: ${dateTime(maintenance.scheduledAt)}` : "";
    const provider = maintenance.provider ? `\nOficina: ${maintenance.provider}` : "";
    return `${index + 1}. Prefixo ${issue.vehiclePrefix || "—"} · ${issue.vehiclePlate}\nSolicitação: ${issue.itemName}\nSituação: ${maintenance.status}${schedule}${provider}${maintenance.feedback ? `\nRetorno: ${maintenance.feedback}` : ""}`;
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
  $("#maintenanceAddress").value = maintenance.address || "";
  $("#maintenanceService").value = maintenance.service || "";
  $("#maintenanceCost").value = maintenance.cost ?? "";
  $("#maintenanceReturnAt").value = maintenance.returnAt ? maintenance.returnAt.slice(0, 16) : "";
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
async function saveMaintenance() {
  const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (!issue) return;
  issue.maintenance = maintenanceFormValues();
  if (issue.maintenance.status === "Veículo pronto para retirada" && (!issue.maintenance.provider || !issue.maintenance.service)) { alert("Informe a oficina/local e o serviço executado antes de liberar o veículo."); return; }
  if (issue.maintenance.status === "Concluída") { issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); }
  else if (issue.status === "resolvida") { issue.status = "aberta"; delete issue.resolvedAt; }
  saveData();
  try { await cloudSave("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue }); }
  catch (error) { queueCloudWrite("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue }); alert("A atualização foi guardada neste aparelho e será sincronizada quando a internet voltar."); }
  await recordAuditEvent(issue, "manutencao_atualizada", `Situação: ${issue.maintenance.status}`);
  if (data.settings.webhookUrl) void sendToIntegration({ type: "maintenance-update", issue, maintenance: issue.maintenance });
  $("#maintenanceDialog").close(); renderControl();
  if (issue.maintenance.status === "Agendada") { sendDriverMaintenanceWhatsApp(issue); sendSchedulingReturn(issue, issue.maintenance); }
  if (issue.maintenance.status === "Veículo pronto para retirada") { const leader = issue.basePhone || data.settings.leaderPhone; if (leader) window.open(whatsappLink(leader, `*VEÍCULO PRONTO PARA RETIRADA*\n\nPrefixo ${issue.vehiclePrefix || "—"} · ${issue.vehiclePlate || "—"}\nLocal: ${issue.maintenance.provider}\nServiço executado: ${issue.maintenance.service}\nLiberado em: ${dateTime(issue.maintenance.readyAt)}\n\nO aviso também está disponível no painel da Liderança.`), "_blank", "noopener"); }
}
function openMaintenanceMap() { const query = [$("#maintenanceProvider").value.trim(), $("#maintenanceAddress").value.trim()].filter(Boolean).join(", "); if (!query) return alert("Informe o nome ou o endereço da oficina para buscar no mapa."); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank", "noopener"); }
async function closeIssue(issueId) { const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return; issue.maintenance = { ...maintenanceOf(issue), status: "Concluída", updatedAt: new Date().toISOString() }; issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); saveData(); try { await cloudSave("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue }); } catch (error) { queueCloudWrite("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue }); alert("O chamado foi resolvido e será sincronizado quando a internet voltar."); } await recordAuditEvent(issue, "chamado_resolvido", "Manutenção concluída pela Gestão"); if (data.settings.webhookUrl) void sendToIntegration({ type: "maintenance-update", issue, maintenance: issue.maintenance }); renderControl(); }
function saveSettings() { if (!requireMasterAccess()) return; data.settings.webhookUrl = $("#webhookUrl").value.trim(); data.settings.maintenancePhone = phoneOnly($("#maintenancePhone").value); data.settings.maintenanceGroupPhone = phoneOnly($("#maintenanceGroupPhone").value); data.settings.leaderPhone = phoneOnly($("#leaderPhone").value); data.settings.fleetManagerPhone = phoneOnly($("#fleetManagerPhone").value); saveData(); $("#settingsDialog").close(); }
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
    ? `<p class="dialog-copy">No iPhone ou iPad, a instalação é feita pelo menu do Safari.</p><ol class="install-steps"><li>Toque no ícone <b>Compartilhar</b> (quadrado com seta para cima).</li><li>Role o menu e toque em <b>Adicionar à Tela de Início</b>.</li><li>Confirme em <b>Adicionar</b>.</li></ol><p class="install-note">Depois disso, o URBAM Frotas aparece com o próprio ícone na tela inicial e abre sem a barra do navegador.</p>`
    : `<p class="dialog-copy">No Android, use o botão abaixo. Se ele não aparecer, abra o menu ⋮ do navegador e escolha <b>Instalar aplicativo</b> ou <b>Adicionar à tela inicial</b>.</p><p class="install-note">A instalação não ocupa muito espaço e permite abrir o checklist como um aplicativo normal.</p><button class="primary-button" id="installFromDialog">Instalar URBAM Frotas</button>`;
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
  if (target.id === "openSettings") { if (!requireMasterAccess()) return; $("#webhookUrl").value = data.settings.webhookUrl; $("#maintenancePhone").value = data.settings.maintenancePhone; $("#maintenanceGroupPhone").value = data.settings.maintenanceGroupPhone || ""; $("#leaderPhone").value = data.settings.leaderPhone || ""; $("#fleetManagerPhone").value = data.settings.fleetManagerPhone || ""; $("#settingsDialog").showModal(); }
  if (target.id === "installApp" || target.id === "installBannerButton" || target.id === "installFromDialog" || target.dataset.install === "app") requestInstall();
  if (target.id === "dismissInstallBanner") dismissInstallBanner();
  if (target.id === "closeInstallDialog") $("#installDialog").close();
  if (target.id === "newVehicle" || target.id === "quickNewVehicle") openVehicleDialog();
  if (target.id === "newEmployee") openEmployeeDialog();
  if (target.id === "quickNewEmployee") openEmployeeDialog();
  if (target.dataset.editEmployee) openEmployeeDialog(employeeDatabase.find((employee) => String(employee.registration) === String(target.dataset.editEmployee)) || DRIVER_REGISTRY.find((employee) => String(employee.registration) === String(target.dataset.editEmployee)));
  if (target.dataset.deleteEmployee) void deactivateEmployee(target.dataset.deleteEmployee);
  if (target.dataset.vehicleHistory) { selectedVehicleHistoryId = selectedVehicleHistoryId === target.dataset.vehicleHistory ? "" : target.dataset.vehicleHistory; renderVehicles(); }
  if (target.dataset.editVehicle) openVehicleDialog(target.dataset.editVehicle);
  if (target.dataset.deleteVehicle) deleteVehicle(target.dataset.deleteVehicle);
  if (target.id === "restoreFleet") void restoreFleet();
  if (target.id === "sendLeaderInstall") sendLeaderInstall();
  if (target.id === "sendDailyChecklistAlert") sendDailyChecklistAlert();
  if (target.id === "enableDailyNotifications") void enableDailyNotifications();
  if (target.id === "enablePushNotifications") void window.URBAMOneSignal?.requestPermission({ role: new URLSearchParams(location.search).get("gestao") === "1" ? "gestao" : "colaborador", base: current.baseName, area: "frota" }).then((result) => { if (result?.enabled) alert("Avisos ativados neste dispositivo."); else if (result?.reason === "denied") alert("Os avisos foram bloqueados pelo navegador. Você pode liberá-los nas configurações do site."); });
  if (target.id === "enableReturnNotifications") void enableReturnNotifications();
  if (target.dataset.commandFilter) {
    managerCommandFilter = target.dataset.commandFilter;
    renderManagementCommandCenter();
    renderIssues();
    $$(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === "issues"));
    $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === "issuesPanel"));
    $("#issuesPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (target.dataset.reopenReturn) reopenReturnedIssue(target.dataset.reopenReturn);
  if (target.id === "clearIssueFilters") { managerIssueFilters = { base: "", vehicle: "", date: "", owner: "", type: "" }; managerCommandFilter = ""; renderManagementCommandCenter(); renderIssues(); }
  if (target.dataset.viewPhoto) void openIssuePhoto(target.dataset.viewPhoto);
  if (target.dataset.managerDispatch) void dispatchManagerMaintenance(target.dataset.managerDispatch);
  if (target.dataset.approvedOwner) sendApprovedOwnerWhatsApp(target.dataset.approvedOwner);
  if (target.dataset.copyOwnerMessage) void copyOwnerMessage(target.dataset.copyOwnerMessage);
  if (target.dataset.copyManagerMessage) void copyManagerMaintenanceMessage(target.dataset.copyManagerMessage);
  if (target.dataset.whatsappIssue) sendIssueWhatsApp(target.dataset.whatsappIssue);
  if (target.dataset.maintenanceIssue) openMaintenanceIssue(target.dataset.maintenanceIssue);
  if (target.dataset.maintenanceWhatsapp) sendMaintenanceWhatsApp(target.dataset.maintenanceWhatsapp);
  if (target.dataset.closeIssue) void closeIssue(target.dataset.closeIssue);
  if (target.id === "sendMaintenanceUpdate") { const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (issue) { const maintenance = maintenanceFormValues(); issue.maintenance = maintenance; sendSchedulingReturn(issue, maintenance); } }
  if (target.id === "openMaintenanceMap") openMaintenanceMap();
  if (target.id === "downloadReport") downloadReport();
});
$("#vehicleSelect").addEventListener("change", renderVehicleOwner);
$("#baseSelect").addEventListener("change", () => { renderBasePhone(); renderVehicleOptions(); });
$("#driverRegistration")?.addEventListener("input", lookupDriverRegistration);
$("#employeeAccessLevel")?.addEventListener("change", toggleEmployeeLeaderFields);
$("#leaderInstallBase")?.addEventListener("change", renderLeaderInstallTarget);
$("#dismissInstallBanner").addEventListener("click", dismissInstallBanner);
$("#issueForm").addEventListener("submit", (event) => { event.preventDefault(); saveIssue(); });
$("#vehicleForm").addEventListener("submit", (event) => { event.preventDefault(); saveVehicle(); });
$("#employeeForm").addEventListener("submit", (event) => { event.preventDefault(); void saveEmployee(); });
$("#settingsForm").addEventListener("submit", (event) => { event.preventDefault(); saveSettings(); });
$("#maintenanceForm").addEventListener("submit", (event) => { event.preventDefault(); void saveMaintenance(); });
$$(".tab").forEach((tab) => tab.addEventListener("click", () => { $$(".tab").forEach((button) => button.classList.toggle("active", button === tab)); $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${tab.dataset.tab}Panel`)); }));

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js?v=153").catch(() => {}));
window.addEventListener("load", () => { void window.URBAMOneSignal?.initialize(); });
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt = event; showInstallBanner(); });
window.addEventListener("appinstalled", () => { document.body.classList.add("app-installed"); $("#installBanner").hidden = true; });
if (isInstalled()) document.body.classList.add("app-installed"); else window.addEventListener("load", showInstallBanner);
window.addEventListener("online", () => { void syncCloudOutbox().then((count) => { if (count) console.info(`${count} envio(s) pendente(s) sincronizado(s).`); }); });
if (new URLSearchParams(location.search).get("gestao") === "1") {
  if (cloudToken()) showScreen("controle");
  else location.replace("gestao.html?v=149");
} else { renderStart(); void syncLocalBacklog(); }
void syncCloudOutbox();

