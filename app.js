Warning: truncated output (original token count: 54682)
Total output lines: 2357

/*
 * URBAM Frotas — software proprietário da LUCHTI ME.
 * Assinatura técnica: LUCHTI-CHECKFROTA-URBAM-20260909-A7F3.
 * Uso, cópia, redistribuição ou exploração comercial dependem de autorização escrita.
 */
const STORAGE_KEY = "checkfrota-v1";
const OUTBOX_KEY = "checkfrota-cloud-outbox-v1";
const APP_VERSION = "230";
const SOFTWARE_SIGNATURE = Object.freeze({ owner: "LUCHTI ME", product: "URBAM Frotas", fingerprint: "LUCHTI-CHECKFROTA-URBAM-20260909-A7F3", notice: "Todos os direitos reservados" });
const LOCAL_DATA_RESET_KEY = "checkfrota-reset-v218";
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
const PREVIOUS_EMAIL_AUTOMATION_URL = "https://script.google.com/macros/s/AKfycbxX-KXsBQ0BZVv4axe42lG9QLfsQ7OC4Ig4Pgscfmur4QhXftk7cit1IGK9RQWzKaIR/exec";
const RETIRED_EMAIL_AUTOMATION_URL = "https://script.google.com/macros/s/AKfycbyn5t8_lb3dhSvrUKzDzritfXOO1O7BAUo_vX_9nAcNgAgzq5176ctJ0TT3B19rAmcV/exec";
const EMAIL_COPY_RECIPIENT = "urbamfrota@gmail.com";
const MASTER_ADMIN_EMAIL = "luciano.silva@urbam.com.br";
const MAINTENANCE_GROUP_PHONE = "5512996181645";
// Enquanto os aplicativos estiverem abertos, as informações operacionais
// precisam aparecer rapidamente nos três painéis. Em segundo plano, as
// notificações do celular continuam sendo responsabilidade do serviço de push.
const FAST_SYNC_INTERVAL_MS = 15 * 1000;
const CLOUD_WRITE_TIMEOUT_MS = 8 * 1000;
const INTEGRATION_TIMEOUT_MS = 8 * 1000;
let dailyChecklistNotificationTimer = null;
let returnedIssues = [];
let returnedIssuesTimer = null;
let scheduledAppointments = [];
let scheduledAppointmentsTimer = null;
let scheduledAppointmentsLoading = false;
let returnedIssuesLoading = false;
let maintenanceMapLocation = null;
let maintenanceWatchTimer = null;
let managementCloudLoading = false;
let managementRole = "";
let submissionInProgress = false;
let submissionCompleted = false;
let completionReturnTimer = null;
let requestedIssueId = new URLSearchParams(location.search).get("issue") || "";

const initialData = {
  settings: { maintenancePhone: "5512988400316", maintenanceGroupPhone: MAINTENANCE_GROUP_PHONE, leaderPhone: "", coordinatorPhone: "5512981111336", fleetManagerPhone: "", webhookUrl: EMAIL_AUTOMATION_URL },
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
const NO_OWNER_PHONE_PREFIXES = new Set(["157"]);
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
function withFleetResponsible(vehicle) { const prefix = String(vehicle?.prefix || ""); return { ...vehicle, plate: CORRECTED_PLATE_BY_PREFIX[prefix] || vehicle.plate, base: BASE_BY_PREFIX[prefix] || vehicle.base || "", manager: MANAGER_BY_PREFIX[prefix] || vehicle.manager || "", ownerName: normalizeOwnerName(RESPONSIBLES_BY_PREFIX[prefix] || vehicle.ownerName), ownerPhone: NO_OWNER_PHONE_PREFIXES.has(prefix) ? "" : (OWNER_PHONE_BY_PREFIX[prefix] || vehicle.ownerPhone) }; }
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
const normalizedEmployeeRole = (role = "") => {
  const value = String(role || "").trim();
  if (/^escitur[aá]rio$/i.test(value)) return "Escriturário";
  return value || "Funcionário";
};
let employeeDatabase = [];
let employeeDatabaseReady = false;
let editingEmployeeRegistration = "";
let employeeLookupTimer = null;
let employeeLookupInFlight = "";
const driverByRegistration = (registration = "") => {
  const normalized = String(registration).replace(/\D/g, "");
  const cloudEmployee = employeeDatabase.find((entry) => String(entry.registration).replace(/\D/g, "") === normalized);
  if (cloudEmployee) return { ...cloudEmployee, registration: String(cloudEmployee.registration), name: cloudEmployee.name, role: normalizedEmployeeRole(cloudEmployee.role) };
  // A relação incorporada é uma contingência somente para a identificação no
  // aplicativo do colaborador. Ela evita que uma resposta pública vazia ou
  // incompleta do banco impeça o início do checklist. A tela de Gestão continua
  // exibindo exclusivamente o cadastro oficial após a sincronização.
  const driver = DRIVER_REGISTRY.find((entry) => entry.registration === normalized);
  return driver ? { ...driver, role: EMPLOYEE_ROLE_BY_REGISTRATION[driver.registration] || "Funcionário" } : null;
};
const driversMissingRegistration = () => DRIVER_LIST_SOURCE.filter((name) => !DRIVER_REGISTRY.some((driver) => driverNameKey(driver.name) === driverNameKey(name)));

let data = loadData();
let current = { driver: "", driverRegistration: "", driverRole: "", driverEmail: EMAIL_COPY_RECIPIENT, driverPhone: DRIVER_NOTIFICATION_PHONE, baseName: "", basePhone: "", vehicleId: "", odometer: "", openingLocation: null, states: {}, notes: "" };
let issueDraft = { itemId: null, severity: "Leve" };
let deferredInstallPrompt = null;
let managerIssueFilters = { base: "", vehicle: "", date: "", owner: "", type: "" };
let managerCommandFilter = "";
let selectedVehicleHistoryId = "";
let masterAdmin = false;
let managementCloudLoaded = false;
const ACCESS_LEVEL_LABELS = { colaborador: "Colaborador", lider: "Líder", coordenador: "Coordenador", gestor: "Gestor" };
const isArchived = (issue = {}) => issue.status === "arquivada" || Boolean(issue.archivedAt);
const MASTER_EMPLOYEE_REGISTRATIONS = new Set(["23135"]);
const employeeAccessLevel = (employee = {}) => employee?.access_level || (employee?.leader ? "lider" : "colaborador");
function employeeRoster() {
  // Após sincronizar, não misture a relação antiga do aplicativo com a base real:
  // assim uma exclusão feita pelo Master desaparece em todos os dispositivos.
  const combined = new Map();
  if (!employeeDatabaseReady) {
    DRIVER_REGISTRY.forEach((employee) => combined.set(String(employee.registration), {
      ...employee, role: EMPLOYEE_ROLE_BY_REGISTRATION[employee.registration] || "Funcionário", active: true, access_level: "colaborador",
    }));
  }
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
async function cloudRequest(path, options = {}) { if (!CLOUD?.url) return null; const response = await fetch(`${CLOUD.url}${path}`, { ...options, signal: options.signal || AbortSignal.timeout(15000), headers: { ...cloudHeaders(options.json !== false), ...(options.headers || {}) } }); if (!response.ok) throw new Error(`Supabase: ${response.status}`); return response.status === 204 ? null : response.json(); }
async function cloudRpc(functionName, payload = {}) {
  return cloudRequest(`/rest/v1/rpc/${functionName}`, { method: "POST", body: JSON.stringify(payload) });
}
function sessionEmail() {
  try {
    const encoded = String(cloudToken() || "").split(".")[1] || "";
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return String(JSON.parse(atob(padded)).email || "").trim().toLowerCase();
  } catch {
    return "";
  }
}
function hasMasterSession() { return sessionEmail() === MASTER_ADMIN_EMAIL; }
function requireMasterAccess() {
  // A interface pode ser clicada antes de a validação remota terminar.
  // O token assinado identifica o Master; o banco continua sendo a validação final.
  if (masterAdmin || hasMasterSession()) {
    masterAdmin = true;
    managementRole = "master";
    return true;
  }
  alert("A sessão atual não é de Administrador Master. Entre novamente com o e-mail Master.");
  return false;
}
async function loadMasterAccess() {
  masterAdmin = hasMasterSession();
  managementRole = masterAdmin ? "master" : "";
  if (!CLOUD?.url || !cloudToken()) return renderControl();
  try {
    const response = await fetch(`${CLOUD.url}/auth/v1/user`, { headers: cloudHeaders(false) });
    if (!response.ok) throw new Error();
    const profile = await response.json();
    const email = String(profile.email || "").trim().toLowerCase();
    const role = await cloudRpc("fleet_current_management_role").catch(() => email === MASTER_ADMIN_EMAIL ? "master" : "");
    managementRole = email === MASTER_ADMIN_EMAIL
      ? "master"
      : (["master", "gestor"].includes(String(role || "")) ? String(role) : "");
    masterAdmin = managementRole === "master";
    if (!managementRole) {
      sessionStorage.removeItem("checkfrota-supabase-token");
      alert("Sua conta não está autorizada para o Painel de Gestão.");
      location.replace(`gestao.html?v=${APP_VERSION}&acesso=negado`);
      return;
    }
  } catch (error) {
    console.warn("Não foi possível validar o perfil de Gestão", error);
    if (hasMasterSession()) {
      masterAdmin = true;
      managementRole = "master";
      renderControl();
      return;
    }
    sessionStorage.removeItem("checkfrota-supabase-token");
    location.replace(`gestao.html?v=${APP_VERSION}&acesso=negado`);
    return;
  }
  renderControl();
}
async function cloudSave(table, row) {
  if (!CLOUD?.url) throw new Error("A conexão com o banco de dados não está configurada.");
  const authenticatedWrite = Boolean(cloudToken());
  const endpoint = authenticatedWrite ? `${CLOUD.url}/rest/v1/${table}?on_conflict=id` : `${CLOUD.url}/rest/v1/${table}`;
  const prefer = authenticatedWrite ? "resolution=merge-duplicates,return=minimal" : "resolution=ignore-duplicates,return=minimal";
  const response = await fetch(endpoint, {
    method: "POST",
    signal: AbortSignal.timeout(CLOUD_WRITE_TIMEOUT_MS),
    headers: { ...cloudHeaders(), Prefer: prefer },
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
function setCloudSyncStatus(message, state = "") {
  const element = $("#cloudSyncStatus");
  if (!element) return;
  element.textContent = message;
  element.dataset.state = state;
}
function syncTimeText() {
  const value = localStorage.getItem("checkfrota-last-sync");
  return value ? new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "ainda não realizada";
}
async function syncCloudOutbox() {
  const queue = readCloudOutbox();
  if (!CLOUD?.url) { setCloudSyncStatus("Banco não configurado", "error"); return 0; }
  if (!navigator.onLine) { setCloudSyncStatus(`⚠ Offline · última sincronização ${syncTimeText()}${queue.length ? ` · ${queue.length} pendente(s)` : ""}`, "error"); return 0; }
  if (!queue.length) { if (!localStorage.getItem("checkfrota-last-sync")) localStorage.setItem("checkfrota-last-sync", new Date().toISOString()); setCloudSyncStatus(`✓ Sincronizado às ${syncTimeText()}`, "ok"); return 0; }
  setCloudSyncStatus(`Sincronizando ${queue.length} envio(s)...`, "pending");
  const remaining = [];
  let lastFailure = "";
  for (const entry of queue) {
    try { await cloudSave(entry.table, entry.row); }
    catch (error) {
      // Um 409 para o mesmo UUID indica que o primeiro envio já chegou ao
      // banco. Não mantenha o celular preso em uma fila que já foi entregue.
      const detail = String(error?.message || "");
      if (/\b409\b|duplicate key|duplicado/i.test(detail)) continue;
      lastFailure = detail.replace(/^Banco de dados:\s*/i, "").slice(0, 72);
      remaining.push(entry);
    }
  }
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(remaining));
  if (remaining.length) setCloudSyncStatus(`${remaining.length} envio(s) aguardando nova tentativa${lastFailure ? ` · ${lastFailure}` : ""}`, "pending");
  else { localStorage.setItem("checkfrota-last-sync", new Date().toISOString()); setCloudSyncStatus(`✓ Sincronizado às ${syncTimeText()}`, "ok"); }
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
  if (!CLOUD?.url || employeeDatabaseReady) return;
  try {
    // Sem login, a consulta usa a visão pública sem campos de autenticação.
    // A Gestão autenticada lê a tabela completa para poder administrar cadastros.
    const source = cloudToken() ? "fleet_employees" : "fleet_employee_directory";
    const rows = await cloudRequest(`/rest/v1/${source}?select=*&active=is.true&order=name.asc`);
    if (!Array.isArray(rows)) return;
    employeeDatabase = rows;
    employeeDatabaseReady = true;
    lookupDriverRegistration();
    renderDrivers();
    console.info(`Base de colaboradores sincronizada: ${rows.length} registro(s).`);
  } catch (error) {
    // A lista incorporada mantém a busca por matrícula funcionando até a tabela ser criada ou ficar disponível.
    console.warn("Base de colaboradores indisponível; usando lista local.", error);
  }
}
async function loadVehicleDirectory() {
  if (!CLOUD?.url) return;
  try {
    const rows = await cloudRequest("/rest/v1/fleet_vehicles?select=data&order=prefix.asc");
    if (!Array.isArray(rows)) return;
    data.vehicles = mergeFleetVehicles(rows.map((row) => row.data).filter(Boolean));
    saveData();
    renderVehicleOptions();
    lookupVehiclePrefix();
  } catch (error) {
    console.warn("Cadastro de veículos indisponível; usando relação local.", error);
  }
}
async function cloudUpdateIssue(issue) {
  if (!CLOUD?.url || !issue?.id) return;
  if (Number.isInteger(issue.__revision)) {
    const rows = await cloudRpc("fleet_update_issue_if_current", { p_issue_id: issue.id, p_expected_revision: issue.__revision, p_status: issue.status || "aberta", p_data: issue });
    const nextRevision = Array.isArray(rows) ? rows[0]?.revision : rows?.revision;
    if (!Number.isInteger(nextRevision)) throw new Error("Este chamado foi atualizado por outra pessoa. Atualize o painel antes de salvar novamente.");
    issue.__revision = nextRevision;
    return;
  }
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
  try {
    const registration = inspection.driverRegistration || $("#driverRegistration")?.value.replace(/\D/g, "") || "";
    const phone = phoneOnly(inspection.driverPhone || $("#driverPhone")?.value || current.driverPhone || "");
    if (!registration || !phone) throw new Error("Identificação do colaborador incompleta.");
    await cloudRpc("fleet_mark_driver_correction", { p_registration: registration, p_phone: phone, p_issue_id: issueId, p_inspection_id: inspection.id, p_has_new_issues: Boolean(hasNewIssues) });
  } catch (error) { console.warn("Não foi possível encerrar a solicitação de retificação no banco", error); }
}
async function syncLocalBacklog() {
  // Somente a fila explícita é reenviada. Reenviar todos os dados locais pode
  // sobrescrever uma decisão mais recente registrada pela Liderança.
  return syncCloudOutbox();
}
function returnNotificationPermission() { return "Notification" in window ? Notification.permission : "unsupported"; }
async function enableReturnNotifications() {
  if (!("Notification" in window)) return alert("Este navegador não oferece notificações do sistema.");
  const registration = $("#driverRegistration")?.value.replace(/\D/g, "") || localStorage.getItem("checkfrota-driver-registration") || "";
  if (!registration) return alert("Digite sua matrícula antes de ativar os avisos.");
  const result = await window.URBAMOneSignal?.requestPermission({ role: "colaborador", base: $("#baseSelect")?.value || current.baseName, area: "checklist", externalId: `colaborador:${registration}` });
  const permission = result?.enabled ? "granted" : Notification.permission;
  if (permission === "granted") { alert("Avisos do aplicativo ativados para esta matrícula."); await loadReturnedIssuesForCollaborator(); }
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
function maintenanceMapUrl(maintenance = {}, issue = {}) {
  const opening = issue.openingLocation || {};
  const hasOrigin = opening.latitude != null && opening.longitude != null;
  const origin = hasOrigin ? `${opening.latitude},${opening.longitude}` : "";
  const address = String(maintenance.address || "").trim();
  const hasDestinationCoordinates = maintenance.latitude !== "" && maintenance.latitude != null && maintenance.longitude !== "" && maintenance.longitude != null;
  const destination = hasDestinationCoordinates ? `${maintenance.latitude},${maintenance.longitude}` : address;
  if (destination) return `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}&destination=${encodeURIComponent(destination)}`;
  const query = String(maintenance.provider || "").trim();
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}
function maintenanceDestination(maintenance = {}) {
  const hasCoordinates = maintenance.latitude !== "" && maintenance.latitude != null && maintenance.longitude !== "" && maintenance.longitude != null;
  return hasCoordinates ? `${maintenance.latitude},${maintenance.longitude}` : String(maintenance.address || maintenance.provider || "").trim();
}
function maintenanceGoogleNavigationUrl(maintenance = {}) {
  const destination = maintenanceDestination(maintenance);
  return destination ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving&dir_action=navigate` : "";
}
function maintenanceWazeNavigationUrl(maintenance = {}) {
  const destination = maintenanceDestination(maintenance);
  if (!destination) return "";
  const hasCoordinates = maintenance.latitude !== "" && maintenance.latitude != null && maintenance.longitude !== "" && maintenance.longitude != null;
  return hasCoordinates ? `https://www.waze.com/ul?ll=${encodeURIComponent(destination)}&navigate=yes` : `https://www.waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;
}
function appointmentFingerprint(issue) { const maintenance = maintenanceOf(issue); return [maintenance.scheduledAt, maintenance.provider, maintenance.address, maintenance.latitude, maintenance.longitude, maintenance.updatedAt].join("|"); }
function notifyScheduledAppointment(issue) {
  const maintenance = maintenanceOf(issue); const key = `checkfrota-schedule-notification-${issue.id}-${appointmentFingerprint(issue)}`;…34682 tokens truncated…At)}, o ${vehicleType.toLowerCase()} ${issue.vehiclePrefix || "—"}, placa ${issue.vehiclePlate || "—"}, apresentou ${problem}, motivo pelo qual foi encaminhado para manutenção.\n\nO veículo foi entregue para atendimento em ${dateTime(maintenance.deliveryAt)} e o prazo contratual de 6 horas venceu em ${dateTime(sla.deadline)}. Somente em ${dateTime(sla.finishedAt)} foi informado que o veículo estava pronto para retirada, caracterizando atraso de ${durationLabel(sla.difference)}.\n\nSolicitamos o registro formal desta ocorrência, a justificativa do atraso e as providências previstas no contrato para evitar nova indisponibilidade do serviço.\n\nDados do veículo:\n\n- Veículo: ${vehicleType}${issue.vehicleModel ? ` · ${issue.vehicleModel}` : ""}\n- Prefixo: ${issue.vehiclePrefix || "—"}\n- Placa: ${issue.vehiclePlate || "—"}\n- Contrato: ${issue.contract || data.vehicles.find((vehicle) => vehicle.id === issue.vehicleId)?.contract || "A informar"}\n- Oficina / fornecedor: ${maintenance.provider || "A informar"}\n- Entrega para manutenção: ${dateTime(maintenance.deliveryAt)}\n- Veículo pronto para retirada: ${dateTime(sla.finishedAt)}\n\nAtenciosamente,\nURBAM Frotas`;
  }
  return `Prezados,\n\nEm ${dateTime(maintenance.deliveryAt)}, o ${vehicleType.toLowerCase()} ${issue.vehiclePrefix || "—"}, placa ${issue.vehiclePlate || "—"}, apresentou ${problem}, motivo pelo qual o veículo permaneceu parado, conforme comunicado e registrado por mensagens, fotos e vídeos enviados.\n\nAté a presente data, o veículo ainda não foi reparado e não foi disponibilizado veículo reserva, impossibilitando a continuidade das atividades de forma adequada.\n\nSolicito providências urgentes para:\n\n- Realizar o reparo do veículo; ou\n- Disponibilizar imediatamente um veículo em condições de uso para a execução das atividades.\n\nEsta notificação tem como objetivo registrar que o problema foi comunicado tempestivamente e que, até o momento, não houve solução.\n\nDiante do exposto, solicitamos a regularização imediata da situação, com a devida prestação do serviço contratado ou a disponibilização de veículo substituto adequado.\n\nDados do veículo:\n\n- Veículo: ${vehicleType}${issue.vehicleModel ? ` · ${issue.vehicleModel}` : ""}\n- Prefixo: ${issue.vehiclePrefix || "—"}\n- Placa: ${issue.vehiclePlate || "—"}\n- Contrato: ${issue.contract || data.vehicles.find((vehicle) => vehicle.id === issue.vehicleId)?.contract || "A informar"}\n- Oficina / fornecedor: ${maintenance.provider || "A informar"}\n- Entrega para manutenção: ${dateTime(maintenance.deliveryAt)}\n- Prazo de 6 horas vencido em: ${dateTime(sla.deadline)}\n\nAtenciosamente,\nURBAM Frotas`;
}
async function copySupplierSlaNotice(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId); const message = issue ? buildSupplierSlaMessage(issue) : "";
  if (!message) return alert("O prazo de 6 horas começa somente após a entrega do veículo para manutenção.");
  try { await navigator.clipboard.writeText(`Assunto: ${slaEmailSubject(issue)}\n\n${message}`); alert("Texto do e-mail formal copiado."); }
  catch { alert("Não foi possível copiar automaticamente. Use o botão para preparar o e-mail."); }
}
async function sendSupplierSlaNotice(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  const maintenance = maintenanceOf(issue); const sla = supplierSlaResult(issue);
  if (!sla) return alert("Registre primeiro a entrega do veículo para iniciar o prazo contratual.");
  const type = sla.state === "late" ? "E-mail de notificação de atraso preparado" : "Comprovação de atendimento no prazo copiada";
  issue.maintenance = { ...maintenance, slaNoticeAt: new Date().toISOString(), slaNoticeType: type, slaEmailAt: sla.state === "late" ? new Date().toISOString() : maintenance.slaEmailAt, updatedAt: new Date().toISOString() };
  saveData(); renderControl();
  try { await cloudUpdateIssue(issue); await recordAuditEvent(issue, "notificacao_sla_email", type); }
  catch (error) { queueCloudWrite("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue }); }
  if (sla.state !== "late") return copySupplierSlaNotice(issueId);
  const target = String(issue.email || data.vehicles.find((vehicle) => vehicle.id === issue.vehicleId)?.email || "").trim();
  const subject = slaEmailSubject(issue);
  const body = buildSupplierSlaMessage(issue);
  if (!target) { await copySupplierSlaNotice(issueId); return alert("O e-mail formal foi copiado. Cadastre o e-mail da empresa responsável no veículo para abri-lo diretamente."); }
  window.location.href = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
  if (!canManageMaintenance(issue)) { alert("Este chamado ainda aguarda a aprovação da liderança. O agendamento será liberado após a decisão."); return; }
  const maintenance = maintenanceOf(issue);
  $("#maintenanceIssueId").value = issue.id;
  $("#maintenanceDialogTitle").textContent = `${issue.vehiclePlate} · ${issue.itemName}`;
  $("#maintenanceIssueSummary").textContent = `${issue.severity} · ${issue.description}`;
  const approvedWaitingSchedule = maintenance.status === "Solicitada" && canManageMaintenance(issue);
  $("#maintenanceStatus").value = approvedWaitingSchedule ? "Agendada" : (["Solicitada", "Agendada", "Em manutenção", "Veículo pronto para retirada"].includes(maintenance.status) ? maintenance.status : "Solicitada");
  $("#maintenanceResponsible").value = maintenance.responsible || "Gestão de Frota";
  $("#maintenanceNextActionAt").value = maintenance.nextActionAt ? maintenance.nextActionAt.slice(0, 16) : "";
  $("#maintenanceScheduledAt").value = maintenance.scheduledAt ? maintenance.scheduledAt.slice(0, 16) : "";
  $("#maintenanceProvider").value = maintenance.provider;
  const providers = [...new Set(data.issues.map((entry) => maintenanceOf(entry).provider).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const providerOptions = $("#maintenanceProviderOptions");
  if (providerOptions) providerOptions.innerHTML = providers.map((provider) => `<option value="${esc(provider)}"></option>`).join("");
  $("#maintenanceAddress").value = maintenance.address || "";
  maintenanceMapLocation = { latitude: maintenance.latitude ?? "", longitude: maintenance.longitude ?? "", mapLabel: maintenance.mapLabel || "", mapUrl: maintenance.mapUrl || maintenanceMapUrl(maintenance, issue) || "" };
  updateMaintenanceMapLink();
  $("#maintenanceService").value = maintenance.service || "";
  $("#maintenanceReturnAt").value = maintenance.returnAt ? maintenance.returnAt.slice(0, 16) : "";
  $("#maintenanceFeedback").value = maintenance.feedback;
  $("#maintenanceDelayReason").value = maintenance.delayReason || "";
  const dialog = $("#maintenanceDialog");
  if (!dialog) return alert("Não foi possível abrir o agendamento. Atualize o aplicativo e tente novamente.");
  if (!dialog.open) dialog.showModal();
  $("#maintenanceStatus")?.focus();
}
function sendMaintenanceWhatsApp() {
  const target = data.settings.maintenanceGroupPhone || data.settings.maintenancePhone;
  if (!target) return alert("Cadastre o WhatsApp do grupo de manutenção em Configurações da base.");
  window.open(whatsappLink(target, buildMaintenanceGroupMessage()), "_blank", "noopener");
}
async function saveAndSendInternalMaintenanceUpdate(issue) {
  if (!issue) return;
  const existing = maintenanceOf(issue);
  const form = maintenanceFormValues(existing);
  // Este botão apenas comunica a equipe e preserva os marcos já registrados.
  const maintenance = {
    ...existing,
    scheduledAt: form.scheduledAt,
    returnAt: form.returnAt,
    provider: form.provider,
    address: form.address,
    service: form.service,
    feedback: form.feedback,
    responsible: form.responsible,
    nextActionAt: form.nextActionAt,
    delayReason: form.delayReason,
    latitude: form.latitude,
    longitude: form.longitude,
    mapLabel: form.mapLabel,
    mapUrl: form.mapUrl,
    updatedAt: new Date().toISOString(),
  };
  issue.maintenance = maintenance;
  saveData();
  try {
    await cloudUpdateIssue(issue);
    await recordAuditEvent(issue, "aviso_equipe_interna", "Atualização de manutenção enviada ao grupo interno.");
  } catch (error) {
    queueCloudWrite("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue });
    alert("A atualização foi guardada neste aparelho e será sincronizada quando a internet voltar.");
  }
  sendSchedulingReturn(issue, maintenance);
  renderControl();
}
async function sendDriverMaintenanceWhatsApp(issue) {
  if (!issue) return;
  const target = phoneOnly(issue.driverPhone || "");
  if (!target) return alert("Este chamado não possui telefone do colaborador. Atualize o WhatsApp no aplicativo antes de agendar.");
  issue.maintenance = { ...maintenanceOf(issue), driverNotifiedAt: new Date().toISOString(), driverNotifiedPhone: target, driverNotificationStatus: "Mensagem de agendamento aberta no WhatsApp", updatedAt: new Date().toISOString() };
  saveData();
  try {
    await cloudUpdateIssue(issue);
    await recordAuditEvent(issue, "mensagem_agendamento_colaborador", `Mensagem de agendamento aberta para matrícula ${issue.driverRegistration || "—"} · telefone ${target}`);
  } catch (error) {
    queueCloudWrite("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue });
  }
  window.open(whatsappLink(target, buildDriverAppointmentMessage(issue)), "_blank", "noopener");
}
function sendDriverReadyWhatsApp(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  const target = phoneOnly(issue.driverPhone || "");
  if (!target) return alert("Este chamado não possui telefone do colaborador. Atualize o WhatsApp no aplicativo antes de enviar.");
  window.open(whatsappLink(target, buildDriverReadyMessage(issue)), "_blank", "noopener");
}
function sendLeaderReadyWhatsApp(issueId) {
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  const target = phoneOnly(issue.basePhone || data.settings.leaderPhone || "");
  if (!target) return alert("Cadastre o WhatsApp da liderança da base em Configurações antes de enviar.");
  window.open(whatsappLink(target, buildLeaderReadyMessage(issue)), "_blank", "noopener");
}
async function saveMaintenance() {
  const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (!issue) return;
  if (!canManageMaintenance(issue)) { alert("Este chamado ainda aguarda a aprovação da liderança."); return; }
  const previousMaintenance = maintenanceOf(issue);
  const nextMaintenance = maintenanceFormValues(previousMaintenance);
  if (nextMaintenance.status !== previousMaintenance.status && !confirm(`Confirma a mudança da manutenção de “${previousMaintenance.status || "Solicitada"}” para “${nextMaintenance.status}”?`)) return;
  if (nextMaintenance.status === "Agendada" && (!nextMaintenance.scheduledAt || !nextMaintenance.provider || !nextMaintenance.address)) { alert("Para agendar ou reagendar, informe data e horário, oficina e endereço do atendimento."); return; }
  if (nextMaintenance.status === "Agendada" && new Date(nextMaintenance.scheduledAt).getTime() < Date.now() - 5 * 60 * 1000) { alert("A data do agendamento não pode estar no passado. Confira data e horário ou use Reagendar."); return; }
  if (nextMaintenance.status === "Em manutenção" && !previousMaintenance.deliveryAt) { alert("O prazo contratual deve começar somente quando o colaborador confirmar a entrega do veículo no aplicativo dele."); return; }
  if (nextMaintenance.status === "Veículo pronto para retirada" && (!previousMaintenance.deliveryAt || !nextMaintenance.provider || !nextMaintenance.service)) { alert("Para liberar o veículo, confirme a entrega pelo colaborador e informe oficina/local e serviço executado."); return; }
  const saveButton = $("#saveMaintenanceButton");
  saveButton.disabled = true; saveButton.textContent = "Salvando agendamento…";
  issue.maintenance = nextMaintenance;
  if (issue.maintenance.status === "Agendada" && previousMaintenance.deliveryAt) { issue.maintenance.deliveryAt = ""; issue.maintenance.supplierDeadlineAt = ""; issue.maintenance.readyAt = ""; issue.maintenance.pickupAt = ""; issue.maintenance.pickupBy = ""; issue.maintenance.supplierReplyAt = ""; issue.maintenance.rescheduledAt = new Date().toISOString(); }
  if (issue.maintenance.status === "Concluída") { issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); }
  else if (issue.status === "resolvida") { issue.status = "aberta"; delete issue.resolvedAt; }
  try {
    saveData();
    try { await cloudUpdateIssue(issue); }
    catch (error) { queueCloudWrite("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue }); alert("A atualização foi guardada neste aparelho e será sincronizada quando a internet voltar."); }
    void recordAuditEvent(issue, "manutencao_atualizada", `Situação: ${issue.maintenance.status}`);
    if (data.settings.webhookUrl) void sendToIntegration({ type: issue.maintenance.status === "Agendada" ? "maintenance-scheduled" : "maintenance-update", issue, maintenance: issue.maintenance });
    $("#maintenanceDialog").close(); renderControl();
    const notificationChanged = issue.maintenance.status !== previousMaintenance.status
      || (issue.maintenance.status === "Agendada" && ["scheduledAt", "provider", "address"].some((field) => issue.maintenance[field] !== previousMaintenance[field]));
    if (notificationChanged && ["Agendada", "Veículo pronto para retirada"].includes(issue.maintenance.status)) {
      const delivery = await sendMaintenanceStatusPush(issue);
      if (!delivery.sent) alert("A atualização foi salva. O aviso no aplicativo não pôde ser entregue agora; use os botões de mensagem do chamado como alternativa e confira a conexão do servidor de notificações.");
    }
  } finally {
    saveButton.disabled = false; saveButton.textContent = "Salvar agendamento / retorno";
  }
}
function updateMaintenanceMapLink() {
  const link = $("#maintenanceMapLink"), wazeLink = $("#maintenanceWazeLink"); if (!link) return;
  const address = $("#maintenanceAddress")?.value.trim() || "";
  const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId")?.value) || {};
  const draft = { address, latitude: maintenanceMapLocation?.latitude ?? "", longitude: maintenanceMapLocation?.longitude ?? "", provider: $("#maintenanceProvider")?.value.trim() || "" };
  const mapUrl = maintenanceMapUrl(draft, issue);
  link.href = mapUrl || "https://www.google.com/maps";
  link.setAttribute("aria-disabled", mapUrl ? "false" : "true");
  link.classList.toggle("is-disabled", !mapUrl);
  const wazeUrl = maintenanceWazeNavigationUrl(draft);
  if (wazeLink) {
    wazeLink.href = wazeUrl || "https://www.waze.com";
    wazeLink.setAttribute("aria-disabled", wazeUrl ? "false" : "true");
    wazeLink.classList.toggle("is-disabled", !wazeUrl);
  }
  const status = $("#maintenanceMapStatus");
  if (status) status.textContent = address ? (issue.openingLocation ? "Rota pronta: saída no local registrado na abertura do chamado e destino na oficina." : "Chamado antigo sem localização de abertura: a rota usará a posição atual do aparelho.") : "Informe o endereço completo da oficina para abrir a rota correta.";
}
async function locateMaintenanceAddress() {
  const address = $("#maintenanceAddress").value.trim(), status = $("#maintenanceMapStatus");
  if (!address) return alert("Informe o endereço completo da oficina antes de localizar.");
  const hasCity = address.split(",").length >= 3 || /são josé dos campos|sao jose dos campos|\bsp\b/i.test(address);
  const query = hasCity ? address : `${address}, São José dos Campos, SP, Brasil`;
  status.textContent = "Localizando endereço no mapa...";
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("consulta indisponível"); const found = await response.json(); const place = found?.[0];
    if (!place?.lat || !place?.lon) throw new Error("endereço não encontrado");
    maintenanceMapLocation = { latitude: Number(place.lat), longitude: Number(place.lon), mapLabel: place.display_name || address, mapUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` };
    status.textContent = `Local confirmado: ${maintenanceMapLocation.mapLabel}`;
  } catch (error) { maintenanceMapLocation = null; status.textContent = "Não foi possível confirmar automaticamente. Use o botão Google Maps para conferir o endereço."; }
  updateMaintenanceMapLink();
}
function prepareReschedule() { $("#maintenanceStatus").value = "Agendada"; $("#maintenanceScheduledAt").focus(); $("#maintenanceMapStatus").textContent = "Atualize data, horário, oficina ou endereço e salve o novo agendamento."; }
async function closeIssue(issueId) { const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return; const maintenance = maintenanceOf(issue); if (!maintenance.pickupAt) return alert("Aguarde a confirmação de retirada pela Liderança antes de concluir este chamado."); issue.maintenance = { ...maintenance, status: "Concluída", updatedAt: new Date().toISOString() }; issue.status = "resolvida"; issue.resolvedAt = new Date().toISOString(); saveData(); try { await cloudUpdateIssue(issue); } catch (error) { queueCloudWrite("fleet_issues", { id: issue.id, inspection_id: issue.inspectionId, vehicle_id: issue.vehicleId, status: issue.status, data: issue }); alert("O chamado foi resolvido e será sincronizado quando a internet voltar."); } await recordAuditEvent(issue, "chamado_resolvido", "Manutenção concluída após confirmação de retirada pela Liderança"); if (data.settings.webhookUrl) void sendToIntegration({ type: "maintenance-update", issue, maintenance: issue.maintenance }); renderControl(); }
async function archiveIssue(issueId) {
  if (!requireMasterAccess()) return;
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  const reason = prompt("Informe o motivo do arquivamento. O chamado não será apagado e poderá ser restaurado pelo Master:");
  if (reason === null) return;
  if (reason.trim().length < 5) return alert("Informe um motivo com pelo menos 5 caracteres. Isso preserva a rastreabilidade.");
  if (!confirm(`Arquivar o chamado “${issue.itemName}” do prefixo ${issue.vehiclePrefix}? Ele sairá das pendências e ficará disponível somente no Histórico do Master.`)) return;
  try {
    await cloudRpc("fleet_archive_issue", { p_issue_id: issue.id, p_reason: reason.trim() });
    issue.status = "arquivada";
    issue.archivedAt = new Date().toISOString();
    issue.archiveReason = reason.trim();
    issue.archivedBy = sessionEmail() || "Administrador Master";
    saveData();
    await recordAuditEvent(issue, "chamado_arquivado", `Arquivado por erro: ${reason.trim()}`);
    renderControl();
  } catch (error) { alert("Não foi possível arquivar. Verifique a conexão e se a atualização do banco foi aplicada."); }
}
async function restoreArchivedIssue(issueId) {
  if (!requireMasterAccess()) return;
  const issue = data.issues.find((entry) => entry.id === issueId); if (!issue) return;
  if (!confirm(`Restaurar o chamado “${issue.itemName}” para as pendências?`)) return;
  try {
    await cloudRpc("fleet_restore_archived_issue", { p_issue_id: issue.id });
    issue.status = "aberta";
    delete issue.archivedAt; delete issue.archiveReason; delete issue.archivedBy;
    saveData();
    await recordAuditEvent(issue, "chamado_restaurado", "Chamado arquivado restaurado para pendências.");
    renderControl();
  } catch (error) { alert("Não foi possível restaurar. Verifique a conexão e se a atualização do banco foi aplicada."); }
}
function saveSettings() { if (!requireMasterAccess()) return; data.settings.webhookUrl = $("#webhookUrl").value.trim(); data.settings.maintenancePhone = phoneOnly($("#maintenancePhone").value); data.settings.maintenanceGroupPhone = phoneOnly($("#maintenanceGroupPhone").value); data.settings.leaderPhone = phoneOnly($("#leaderPhone").value); data.settings.coordinatorPhone = phoneOnly($("#coordinatorPhone").value); data.settings.fleetManagerPhone = phoneOnly($("#fleetManagerPhone").value); saveData(); $("#settingsDialog").close(); }
function configuredAutomationUrl() { return $("#webhookUrl")?.value.trim() || data.settings.webhookUrl || ""; }
function openEmailAutomation() {
  if (!requireMasterAccess()) return;
  const url = configuredAutomationUrl();
  if (!url) return alert("Informe e salve a URL de envio antes de verificar a automação.");
  const status = $("#emailAutomationStatus");
  if (status) status.textContent = "Abrindo o endereço de diagnóstico. O resultado esperado é um JSON com \"ok\": true.";
  window.open(url, "_blank", "noopener");
}
async function sendEmailAutomationTest() {
  if (!requireMasterAccess()) return;
  const url = configuredAutomationUrl();
  if (!url) return alert("Informe e salve a URL de envio antes de realizar o teste.");
  if (!confirm("Enviar um e-mail de teste para urbamfrota@gmail.com? Nenhum chamado real será criado.")) return;
  const button = $("#sendEmailAutomationTest");
  if (button) { button.disabled = true; button.textContent = "Encaminhando teste..."; }
  try {
    const result = await sendToIntegration({
      type: "email-automation-test",
      inspection: { id: `TESTE-EMAIL-${Date.now()}`, createdAt: new Date().toISOString(), driver: "Teste de integração", driverRegistration: "000000", baseName: "Gestão", odometer: "0" },
      vehicle: { prefix: "TESTE", plate: "TESTE", type: "Sistema" },
      issues: []
    });
    const status = $("#emailAutomationStatus");
    if (result.sent) {
      if (status) status.textContent = "Teste encaminhado ao Apps Script. Confirme o recebimento em urbamfrota@gmail.com; a tela não declara entrega sem confirmação do serviço.";
      alert("Teste encaminhado. Confirme o recebimento em urbamfrota@gmail.com.");
    } else {
      if (status) status.textContent = "Não foi possível encaminhar o teste. Confira a URL e a publicação do Apps Script.";
      alert("O teste não foi encaminhado. Verifique a URL e a implantação do Apps Script.");
    }
  } finally {
    if (button) { button.disabled = false; button.textContent = "Enviar teste por e-mail"; }
  }
}
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
  if (target.disabled || target.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  if (target.id === "submitChecklist") {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (submissionInProgress || submissionCompleted) return;
    target.disabled = true;
    target.setAttribute("aria-disabled", "true");
    void submitChecklist();
    return;
  }
  if (target.dataset.go) showScreen(target.dataset.go);
  if (target.id === "startChecklist") beginChecklist();
  if (target.id === "captureOpeningLocation") void captureOpeningLocation();
  if (target.dataset.state === "ok") { current.states[target.dataset.item] = { status: "ok" }; renderChecklist(); }
  if (target.dataset.state === "issue") openIssue(target.dataset.item);
  if (target.id === "reviewChecklist") reviewChecklist();
  if (target.dataset.severity) { issueDraft.severity = target.dataset.severity; $$(".severity").forEach((button) => button.classList.toggle("active", button === target)); }
  if (target.id === "saveIssue") { event.preventDefault(); saveIssue(); }
  if (target.id === "openSettings") { if (!requireMasterAccess()) return; $("#webhookUrl").value = data.settings.webhookUrl; $("#maintenancePhone").value = data.settings.maintenancePhone; $("#maintenanceGroupPhone").value = data.settings.maintenanceGroupPhone || ""; $("#leaderPhone").value = data.settings.leaderPhone || ""; $("#coordinatorPhone").value = data.settings.coordinatorPhone || ""; $("#fleetManagerPhone").value = data.settings.fleetManagerPhone || ""; $("#settingsDialog").showModal(); }
  if (target.id === "openEmailAutomation") openEmailAutomation();
  if (target.id === "sendEmailAutomationTest") void sendEmailAutomationTest();
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
  if (target.id === "copyDailyCoordinatorChecklistAlert") void copyDailyCoordinatorChecklistAlert();
  if (target.id === "sendDailyCoordinatorChecklistAlert") sendDailyCoordinatorChecklistAlert();
  if (target.id === "enableDailyNotifications") void enableDailyNotifications();
  if (target.id === "enablePushNotifications") void window.URBAMOneSignal?.requestPermission({ role: new URLSearchParams(location.search).get("gestao") === "1" ? "gestao" : "colaborador", base: current.baseName, area: "frota", externalId: $("#driverRegistration")?.value ? `colaborador:${$("#driverRegistration").value.replace(/\D/g, "")}` : "" }).then((result) => { if (result?.enabled) alert("Avisos ativados neste dispositivo."); else alert("Os avisos ainda não foram ativados. Em Configurações do site, defina Notificações como Permitir e tente novamente."); });
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
  if (target.dataset.markMaintenanceDelivery) void markVehicleDeliveredForMaintenance(target.dataset.markMaintenanceDelivery);
  if (target.dataset.acknowledgeSchedule) void acknowledgeSchedule(target.dataset.acknowledgeSchedule);
  if (target.id === "clearIssueFilters") { managerIssueFilters = { base: "", vehicle: "", date: "", owner: "", type: "" }; managerCommandFilter = ""; renderManagementCommandCenter(); renderIssues(); }
  if (target.dataset.viewPhoto) void openIssuePhoto(target.dataset.viewPhoto);
  if (target.dataset.managerDispatch) void dispatchManagerMaintenance(target.dataset.managerDispatch);
  if (target.dataset.approvedOwner) sendApprovedOwnerWhatsApp(target.dataset.approvedOwner);
  if (target.dataset.copyOwnerMessage) void copyOwnerMessage(target.dataset.copyOwnerMessage);
  if (target.dataset.copyCoordinatorMessage) void copyCoordinatorMessage(target.dataset.copyCoordinatorMessage);
  if (target.dataset.sendCoordinatorMessage) sendCoordinatorMessage(target.dataset.sendCoordinatorMessage);
  if (target.dataset.copyManagerMessage) void copyManagerMaintenanceMessage(target.dataset.copyManagerMessage);
  if (target.dataset.copySlaNotice) void copySupplierSlaNotice(target.dataset.copySlaNotice);
  if (target.dataset.sendSlaNotice) void sendSupplierSlaNotice(target.dataset.sendSlaNotice);
  if (target.dataset.driverMaintenanceWhatsapp) void sendDriverMaintenanceWhatsApp(data.issues.find((entry) => entry.id === target.dataset.driverMaintenanceWhatsapp));
  if (target.dataset.sendSchedulingReturn) { const issue = data.issues.find((entry) => entry.id === target.dataset.sendSchedulingReturn); if (issue) sendSchedulingReturn(issue); }
  if (target.dataset.driverReadyWhatsapp) sendDriverReadyWhatsApp(target.dataset.driverReadyWhatsapp);
  if (target.dataset.leaderReadyWhatsapp) sendLeaderReadyWhatsApp(target.dataset.leaderReadyWhatsapp);
  if (target.dataset.maintenanceIssue) { event.preventDefault(); try { openMaintenanceIssue(target.dataset.maintenanceIssue); } catch (error) { console.error("Falha ao abrir manutenção", error); alert("Não foi possível abrir o agendamento. Atualize o aplicativo e tente novamente."); } }
  if (target.dataset.maintenanceWhatsapp) sendMaintenanceWhatsApp(target.dataset.maintenanceWhatsapp);
  if (target.dataset.closeIssue) void closeIssue(target.dataset.closeIssue);
  if (target.dataset.archiveIssue) void archiveIssue(target.dataset.archiveIssue);
  if (target.dataset.restoreIssue) void restoreArchivedIssue(target.dataset.restoreIssue);
  if (target.id === "sendMaintenanceUpdate") { const issue = data.issues.find((entry) => entry.id === $("#maintenanceIssueId").value); if (issue) void saveAndSendInternalMaintenanceUpdate(issue); }
  if (target.id === "locateMaintenanceAddress") void locateMaintenanceAddress();
  if (target.id === "rescheduleMaintenance") prepareReschedule();
  if (target.id === "closeMaintenanceDialog") { event.preventDefault(); $("#maintenanceDialog")?.close(); }
  if (target.id === "downloadReport") downloadReport();
});
$("#vehicleSelect").addEventListener("change", renderVehicleOwner);
$("#baseSelect").addEventListener("change", () => { renderBasePhone(); renderVehicleOptions(); });
$("#driverRegistration")?.addEventListener("input", lookupDriverRegistration);
$("#driverPhone")?.addEventListener("change", () => { localStorage.setItem("checkfrota-driver-phone", phoneOnly($("#driverPhone").value)); void loadScheduledAppointmentsForCollaborator(); });
$("#vehiclePrefixLookup")?.addEventListener("input", lookupVehiclePrefix);
$("#employeeAccessLevel")?.addEventListener("change", toggleEmployeeLeaderFields);
$("#leaderInstallBase")?.addEventListener("change", renderLeaderInstallTarget);
$("#dismissInstallBanner").addEventListener("click", dismissInstallBanner);
$("#issueForm").addEventListener("submit", (event) => { event.preventDefault(); saveIssue(); });
$("#vehicleForm").addEventListener("submit", (event) => { event.preventDefault(); saveVehicle(); });
$("#employeeForm").addEventListener("submit", (event) => { event.preventDefault(); void saveEmployee(); });
$("#settingsForm").addEventListener("submit", (event) => { event.preventDefault(); saveSettings(); });
$("#maintenanceForm").addEventListener("submit", (event) => { event.preventDefault(); void saveMaintenance(); });
$("#maintenanceAddress")?.addEventListener("input", () => { maintenanceMapLocation = null; updateMaintenanceMapLink(); });
$("#maintenanceProvider")?.addEventListener("input", updateMaintenanceMapLink);
$$(".tab").forEach((tab) => tab.addEventListener("click", () => { $$(".tab").forEach((button) => button.classList.toggle("active", button === tab)); $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${tab.dataset.tab}Panel`)); }));

if ("serviceWorker" in navigator) {
  let refreshedForUpdate = false;
  let checkingVersion = false;
  let targetVersion = APP_VERSION;
  const reloadOnUpdate = () => {
    if (refreshedForUpdate) return;
    refreshedForUpdate = true;
    const url = new URL(location.href);
    url.searchParams.set("v", targetVersion);
    location.replace(url.toString());
  };
  const activateWaitingWorker = (registration) => registration.waiting?.postMessage({ type: "SKIP_WAITING" });
  const checkAppVersion = async () => {
    if (checkingVersion || !navigator.onLine) return;
    checkingVersion = true;
    try {
      const response = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const remote = String((await response.json()).version || "");
      if (remote && remote !== APP_VERSION) {
        targetVersion = remote;
        const registration = await navigator.serviceWorker.getRegistration();
        await registration?.update();
        activateWaitingWorker(registration);
        window.setTimeout(reloadOnUpdate, 1200);
      }
    } catch (_) {
      // Sem conexão: mantém a versão disponível no aparelho.
    } finally {
      checkingVersion = false;
    }
  };
  navigator.serviceWorker.addEventListener("controllerchange", reloadOnUpdate);
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(`service-worker.js?v=${APP_VERSION}`);
      registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", () => activateWaitingWorker(registration)));
      await registration.update();
      activateWaitingWorker(registration);
      // Elimina caches de versões anteriores sempre que o PWA é aberto.
      const expectedCache = `checkfrota-v${APP_VERSION}`;
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("checkfrota-v") && key !== expectedCache).map((key) => caches.delete(key)));
    } catch (_) {}
    void checkAppVersion();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) void checkAppVersion(); });
  window.addEventListener("online", () => void checkAppVersion());
  window.setInterval(() => void checkAppVersion(), 5 * 60 * 1000);
}
window.addEventListener("load", () => { void window.URBAMOneSignal?.initialize(); });
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt = event; showInstallBanner(); });
window.addEventListener("appinstalled", () => { document.body.classList.add("app-installed"); $("#installBanner").hidden = true; });
if (isInstalled()) document.body.classList.add("app-installed"); else window.addEventListener("load", showInstallBanner);
window.addEventListener("online", () => { localStorage.setItem("checkfrota-last-sync", new Date().toISOString()); void syncCloudOutbox().then((count) => { if (count) console.info(`${count} envio(s) pendente(s) sincronizado(s).`); }); });
window.addEventListener("offline", () => void syncCloudOutbox());
// Atualiza o acompanhamento assim que o colaborador volta ao aplicativo;
// não é necessário aguardar o próximo ciclo de consulta de 60 segundos.
function refreshOpenAppData() {
  if (document.hidden) return;
  void loadScheduledAppointmentsForCollaborator();
  void loadReturnedIssuesForCollaborator();
  if ($(".screen.active[data-screen='controle']") && cloudToken()) void loadCloudManager();
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshOpenAppData(); });
window.addEventListener("focus", refreshOpenAppData);
window.addEventListener("online", refreshOpenAppData);
if (new URLSearchParams(location.search).get("gestao") === "1") {
  if (cloudToken()) showScreen("controle");
  else location.replace(`gestao.html?v=${APP_VERSION}`);
} else { renderStart(); }
void syncCloudOutbox();
// Tentativas pendentes também ganham prioridade quando o aplicativo está aberto.
window.setInterval(() => { if (!document.hidden) void syncCloudOutbox(); }, FAST_SYNC_INTERVAL_MS);

