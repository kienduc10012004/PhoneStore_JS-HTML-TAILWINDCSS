const TOAST_CONTAINER_ID = "appToastContainer";
const DIALOG_ROOT_ID = "appDialogRoot";
const DIALOG_STYLE_ID = "appDialogStyle";

const escapeHtml = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const ensureDialogStyle = () => {
  if (document.getElementById(DIALOG_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = DIALOG_STYLE_ID;
  style.textContent = `
    .app-toast-wrap{position:fixed;top:6rem;right:1rem;z-index:9999;width:calc(100% - 2rem);max-width:24rem;display:flex;flex-direction:column;gap:.75rem;pointer-events:none}
    .app-toast{pointer-events:auto;display:flex;align-items:flex-start;gap:.75rem;padding:1rem;border:1px solid #e2e8f0;border-radius:1rem;background:#fff;box-shadow:0 24px 60px rgba(15,23,42,.18);transform:translateX(1rem);opacity:0;transition:transform .25s ease,opacity .25s ease;font-family:"Plus Jakarta Sans",system-ui,sans-serif}
    .app-toast.is-show{transform:translateX(0);opacity:1}
    .app-toast__icon{width:2.25rem;height:2.25rem;flex:0 0 auto;display:grid;place-items:center;border-radius:.75rem}
    .app-toast__body{min-width:0;flex:1}
    .app-toast__title{margin:0;color:#0f172a;font-size:.875rem;font-weight:900}
    .app-toast__message{margin:.25rem 0 0;color:#64748b;font-size:.875rem;font-weight:600;line-height:1.45;overflow-wrap:anywhere}
    .app-toast__close{width:2rem;height:2rem;border:0;border-radius:.75rem;background:#f1f5f9;color:#64748b;cursor:pointer;transition:background .15s ease,color .15s ease}
    .app-toast__close:hover{background:#0f172a;color:#fff}
    .app-toast--success .app-toast__icon{background:#ecfdf5;color:#059669}
    .app-toast--error .app-toast__icon{background:#fef2f2;color:#dc2626}
    .app-toast--warning .app-toast__icon{background:#fffbeb;color:#d97706}
    .app-toast--info .app-toast__icon{background:#eff6ff;color:#2563eb}
    .app-confirm{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem;font-family:"Plus Jakarta Sans",system-ui,sans-serif}
    .app-confirm__overlay{position:absolute;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}
    .app-confirm__panel{position:relative;width:100%;max-width:28rem;padding:1.5rem;border-radius:1.5rem;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.28);transform:scale(.96);opacity:0;transition:transform .2s ease,opacity .2s ease}
    .app-confirm__panel.is-show{transform:scale(1);opacity:1}
    .app-confirm__head{display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.25rem}
    .app-confirm__icon{width:3rem;height:3rem;flex:0 0 auto;display:grid;place-items:center;border-radius:1rem;background:#fef2f2;color:#dc2626;font-size:1.25rem}
    .app-confirm__icon.is-info{background:#eff6ff;color:#2563eb}
    .app-confirm__title{margin:0;color:#0f172a;font-size:1.25rem;font-weight:900;line-height:1.25}
    .app-confirm__message{margin:.5rem 0 0;color:#64748b;font-size:.9rem;font-weight:600;line-height:1.6}
    .app-confirm__actions{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
    .app-confirm__btn{min-height:3rem;border:0;border-radius:1rem;padding:.75rem 1rem;font-weight:900;cursor:pointer;transition:background .15s ease,color .15s ease,transform .15s ease}
    .app-confirm__btn:active{transform:translateY(1px)}
    .app-confirm__cancel{background:#f1f5f9;color:#334155}
    .app-confirm__cancel:hover{background:#e2e8f0}
    .app-confirm__ok{background:#dc2626;color:#fff}
    .app-confirm__ok:hover{background:#b91c1c}
    .app-confirm__ok.is-info{background:#2563eb}
    .app-confirm__ok.is-info:hover{background:#1d4ed8}
    @media (max-width:480px){.app-toast-wrap{top:5rem;right:.75rem;width:calc(100% - 1.5rem)}.app-confirm__panel{padding:1.25rem;border-radius:1.25rem}}
  `;

  document.head.appendChild(style);
};

const getToastType = (message, type = "info") => {
  const text = String(message || "").toLowerCase();

  if (type !== "info") return type;
  if (text.includes("thành công") || text.includes("đã ")) return "success";
  if (text.includes("lỗi") || text.includes("không thể") || text.includes("không tải")) return "error";
  if (text.includes("vui lòng") || text.includes("chỉ được") || text.includes("không đủ")) return "warning";

  return "info";
};

const toastMeta = {
  success: { icon: "fa-circle-check", title: "Thành công" },
  error: { icon: "fa-circle-xmark", title: "Có lỗi xảy ra" },
  warning: { icon: "fa-triangle-exclamation", title: "Cần chú ý" },
  info: { icon: "fa-circle-info", title: "Thông báo" },
};

const ensureToastContainer = () => {
  ensureDialogStyle();
  let container = document.getElementById(TOAST_CONTAINER_ID);

  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    container.className = "app-toast-wrap";
    document.body.appendChild(container);
  }

  return container;
};

export const showAppToast = (message, type = "info", duration = 3200) => {
  if (!document.body) {
    window.addEventListener("DOMContentLoaded", () => showAppToast(message, type, duration), { once: true });
    return;
  }

  const finalType = getToastType(message, type);
  const meta = toastMeta[finalType] || toastMeta.info;
  const toast = document.createElement("div");
  toast.className = `app-toast app-toast--${finalType}`;
  toast.innerHTML = `
    <div class="app-toast__icon"><i class="fa-solid ${meta.icon}"></i></div>
    <div class="app-toast__body">
      <p class="app-toast__title">${meta.title}</p>
      <p class="app-toast__message">${escapeHtml(message)}</p>
    </div>
    <button type="button" class="toastClose app-toast__close"><i class="fa-solid fa-xmark"></i></button>
  `;

  const closeToast = () => {
    toast.classList.remove("is-show");
    setTimeout(() => toast.remove(), 250);
  };

  ensureToastContainer().appendChild(toast);
  toast.querySelector(".toastClose")?.addEventListener("click", closeToast);
  requestAnimationFrame(() => toast.classList.add("is-show"));
  setTimeout(closeToast, duration);
};

const ensureDialogRoot = () => {
  ensureDialogStyle();
  let root = document.getElementById(DIALOG_ROOT_ID);

  if (!root) {
    root = document.createElement("div");
    root.id = DIALOG_ROOT_ID;
    document.body.appendChild(root);
  }

  return root;
};

export const showAppConfirm = ({
  title = "Xác nhận thao tác",
  message = "Bạn có chắc muốn tiếp tục?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  tone = "danger",
} = {}) => {
  if (!document.body) {
    return new Promise((resolve) => {
      window.addEventListener("DOMContentLoaded", async () => {
        resolve(await showAppConfirm({ title, message, confirmText, cancelText, tone }));
      }, { once: true });
    });
  }

  const isDanger = tone === "danger";
  const dialog = document.createElement("div");
  dialog.className = "app-confirm";
  dialog.innerHTML = `
    <div class="appConfirmOverlay app-confirm__overlay"></div>
    <div class="appConfirmPanel app-confirm__panel">
      <div class="app-confirm__head">
        <div class="app-confirm__icon ${isDanger ? "" : "is-info"}">
          <i class="fa-solid ${isDanger ? "fa-triangle-exclamation" : "fa-circle-info"}"></i>
        </div>
        <div>
          <h2 class="app-confirm__title">${escapeHtml(title)}</h2>
          <p class="app-confirm__message">${escapeHtml(message)}</p>
        </div>
      </div>
      <div class="app-confirm__actions">
        <button type="button" class="appConfirmCancel app-confirm__btn app-confirm__cancel">${escapeHtml(cancelText)}</button>
        <button type="button" class="appConfirmOk app-confirm__btn app-confirm__ok ${isDanger ? "" : "is-info"}">${escapeHtml(confirmText)}</button>
      </div>
    </div>
  `;

  ensureDialogRoot().appendChild(dialog);
  const panel = dialog.querySelector(".appConfirmPanel");
  requestAnimationFrame(() => panel?.classList.add("is-show"));

  return new Promise((resolve) => {
    const close = (value) => {
      panel?.classList.remove("is-show");
      setTimeout(() => {
        dialog.remove();
        resolve(value);
      }, 180);
    };

    dialog.querySelector(".appConfirmCancel")?.addEventListener("click", () => close(false));
    dialog.querySelector(".appConfirmOverlay")?.addEventListener("click", () => close(false));
    dialog.querySelector(".appConfirmOk")?.addEventListener("click", () => close(true));
  });
};

window.showAppToast = showAppToast;
window.showAppConfirm = showAppConfirm;
window.alert = (message) => showAppToast(message);
