import { el, addDocumentEvent, pageBody } from "./core.js";

export const bindPopupEvents = () => {
  const closeCart = () => { el.popupGioHang?.classList.add("hidden"); pageBody.classList.remove("overflow-hidden"); };
  el.overlayGioHang?.addEventListener("click", closeCart);
  el.btnCloseGioHang?.addEventListener("click", closeCart);
  addDocumentEvent("keydown", e => { if (e.key === "Escape") closeCart(); });
};
