/* Integração centralizada de notificações push do URBAM Frotas. */
window.URBAMOneSignal = (() => {
  const APP_ID = "3d57134c-adf3-4f8f-8ec2-093b1d02f3bf";
  const DIALOG_KEY = "urbam-onesignal-verification-shown";
  let sdk = null;
  let initialized = false;
  let initialization = null;
  let subscriptionObserverAttached = false;
  function installedPath(path) { return new URL(path, document.baseURI).pathname; }
  function isRealSubscription(id) { return Boolean(id && !String(id).startsWith("local-")); }
  function showVerificationDialog() {
    // A explicação aparece uma vez; em uma nova tentativa seguimos direto ao pedido do navegador.
    if (localStorage.getItem(DIALOG_KEY)) return Promise.resolve(true);
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.className = "onesignal-verification";
      modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `<section><h2>Your OneSignal SDK integration is complete!</h2><p>You can now send Push Notifications & In-App Messages through OneSignal. Tap below to enable push notifications.</p><button type="button">Got it</button></section>`;
      modal.querySelector("button").onclick = () => { localStorage.setItem(DIALOG_KEY, "1"); modal.remove(); resolve(true); };
      document.body.append(modal);
    });
  }
  function evaluateSubscription() { const id = sdk?.User?.PushSubscription?.id; if (isRealSubscription(id)) document.dispatchEvent(new CustomEvent("urbam-onesignal-subscribed", { detail: { id } })); }
  function attachSubscriptionObserver() {
    if (subscriptionObserverAttached || !sdk?.User?.PushSubscription?.addEventListener) return;
    subscriptionObserverAttached = true;
    sdk.User.PushSubscription.addEventListener("change", evaluateSubscription);
    evaluateSubscription();
  }
  async function initialize() {
    if (initialized) return sdk;
    if (initialization) return initialization;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    initialization = new Promise((resolve) => {
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({ appId: APP_ID, serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js", serviceWorkerParam: { scope: installedPath("push/onesignal/") }, autoResubscribe: true, notifyButton: { enable: false } });
          sdk = OneSignal; initialized = true; attachSubscriptionObserver(); document.dispatchEvent(new CustomEvent("urbam-onesignal-ready"));
        } catch (error) { console.warn("OneSignal não foi inicializado.", error); }
        resolve(sdk);
      });
    });
    return initialization;
  }
  async function setContext({ role = "colaborador", base = "", area = "" } = {}) {
    const OneSignal = await initialize(); if (!OneSignal?.User?.addTags) return false;
    try { await OneSignal.User.addTags({ aplicativo: "urbam-frotas", perfil: role, base: base || "sem-base", area: area || "frota" }); return true; }
    catch (error) { console.warn("Não foi possível identificar o contexto de notificações.", error); return false; }
  }
  async function requestPermission(context = {}) {
    const OneSignal = await initialize(); if (!OneSignal?.Notifications) return { enabled: false, reason: "unsupported" };
    await setContext(context); if (OneSignal.User?.PushSubscription?.optedIn) return { enabled: true, alreadyEnabled: true };
    if (!await showVerificationDialog()) return { enabled: false, reason: "dismissed" };
    try { await OneSignal.Notifications.requestPermission(); evaluateSubscription(); return { enabled: Boolean(OneSignal.User?.PushSubscription?.optedIn) }; }
    catch (error) { console.warn("Permissão de avisos não concedida.", error); return { enabled: false, reason: "denied" }; }
  }
  return { initialize, requestPermission, setContext, isEnabled: () => Boolean(sdk?.User?.PushSubscription?.optedIn) };
})();

