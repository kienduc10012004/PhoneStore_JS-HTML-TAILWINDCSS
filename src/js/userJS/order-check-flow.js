/* ================= IMPORT MODULES ================= */
import { getOrders, saveOrders } from "./order-flow.js";
import { cancelOrder } from "../shared-stock-flow.js";
import { productDetailUrl, getElement, selectElements, pageBody } from "./core.js";
import { formatCurrency } from "./ui-flow.js";
import {
  initReturnFeature,
  createReturnItemKey,
  hasReturnRequest,
  getReturnRequestByItemKey,
} from "./return-flow.js";

const isUserLoggedIn = localStorage.getItem("isLoggedIn") === "true";

if (!isUserLoggedIn) {
  window.location.href = "./login.html";
}

/* ================= DOM ĐƠN HÀNG ================= */
const orderTableBody = getElement("orderTableBody");
const RETURN_WINDOW_MS = 7 * 60 * 1000;

/* ================= HÀM HỖ TRỢ ================= */

/* Kiểm tra đơn hàng có được hủy không */
const canCancelOrder = (status) => {
  return status === "Đang xử lý";
};

const getReceiveAddress = (order) => {
  if (order.receiveMethod === "Nhận tại cửa hàng") {
    return order.store || "Không có";
  }

  return `${order.province || "Không có"} - ${order.district || "Không có"} - ${order.address || "Không có"}`;
};

const getOrderReturnRequest = (order, item) => {
  const itemKey = createReturnItemKey(order.id, item);
  return item.returnRequest || getReturnRequestByItemKey(order.id, itemKey);
};

const isReturnTimeValid = (order) => {
  if (order.status !== "Đã giao hàng") return false;
  if (!order.deliveredAtMs) return true;

  return Date.now() - Number(order.deliveredAtMs) <= RETURN_WINDOW_MS;
};

const ensureDeliveredTime = (orders) => {
  let hasChanged = false;

  orders.forEach((order) => {
    if (order.status === "Đã giao hàng" && !order.deliveredAtMs) {
      order.deliveredAtMs = Date.now();
      order.deliveredAt = order.updatedAt || order.createdAt || new Date().toLocaleString("vi-VN");
      hasChanged = true;
    }
  });

  if (hasChanged) {
    saveOrders(orders);
  }
};

const formatRemainingTime = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const renderHoverText = (text, className = "", clampClass = "line-clamp-2") => {
  if (text === "") return "";

  const value = text || "Không có";

  return `
    <span class="relative block min-w-0 ${className}">
      <span class="block ${clampClass} break-words">${value}</span>
    </span>
  `;
};

const renderReturnTime = (order) => {
  if (order.status !== "Đã giao hàng") return "";

  const expireAt = Number(order.deliveredAtMs || 0) + RETURN_WINDOW_MS;
  const remainingTime = expireAt - Date.now();

  if (remainingTime <= 0) {
    return `
      <p class="jsReturnTime mt-2 text-xs font-black text-red-500" data-expire-at="${expireAt}">
        Hết thời gian đổi trả
      </p>
    `;
  }

  return `
    <p class="jsReturnTime mt-2 text-xs font-black text-emerald-600" data-expire-at="${expireAt}">
      Thời gian đổi trả còn lại: ${formatRemainingTime(remainingTime)}
    </p>
  `;
};

const updateReturnTimers = () => {
  selectElements(".jsReturnTime").forEach((element) => {
    const expireAt = Number(element.dataset.expireAt || 0);
    const remainingTime = expireAt - Date.now();

    if (remainingTime <= 0) {
      element.textContent = "Hết thời gian đổi trả";
      element.classList.remove("text-emerald-600");
      element.classList.add("text-red-500");
      return;
    }

    element.textContent = `Thời gian đổi trả còn lại: ${formatRemainingTime(remainingTime)}`;
    element.classList.remove("text-red-500");
    element.classList.add("text-emerald-600");
  });

  selectElements(".jsReturnButton").forEach((button) => {
    const expireAt = Number(button.dataset.expireAt || 0);

    if (expireAt && expireAt <= Date.now()) {
      button.classList.add("hidden");
      button.disabled = true;
    }
  });
};

const renderReturnStatus = (request) => {
  if (!request) return "";

  return `
    <div class="mt-2 text-xs font-bold text-slate-600 bg-slate-50 border rounded-xl p-2">
      <p>Trạng thái đổi trả: <span class="text-blue-600">${request.status}</span></p>
      ${
        request.rejectReason
          ? `<p class="text-red-500 mt-1">Lý do từ chối: ${request.rejectReason}</p>`
          : ""
      }
      ${
        request.adminNote
          ? `<p class="text-slate-500 mt-1">Ghi chú admin: ${request.adminNote}</p>`
          : ""
      }
    </div>
  `;
};

/* ================= RENDER SẢN PHẨM TRONG ĐƠN ================= */

/* Render từng sản phẩm */
const renderOrderItems = (order) => {
  return order.items
    .map((item) => {
      const itemKey = createReturnItemKey(order.id, item);
      const canReturn = isReturnTimeValid(order);
      const returnRequest = getOrderReturnRequest(order, item);
      const alreadyReturned = Boolean(returnRequest) || hasReturnRequest(order.id, item);
      const lineTotal = Number(item.price || 0) * Number(item.soLuong || 1);
      const expireAt = Number(order.deliveredAtMs || 0) + RETURN_WINDOW_MS;

      return `
        <div onclick="window.location.href='${productDetailUrl(item.id)}'" class="flex items-center bg-slate-100 p-2 rounded-lg hover:bg-slate-200 duration-100 gap-3 mb-3 cursor-pointer">
          <img
            src="${item.img}" 
            class="w-14 h-14 shrink-0 object-contain bg-slate-50 rounded-xl cursor-pointer"
          />

          <div class="min-w-0">
            ${renderHoverText(item.name, "font-black text-slate-900 hover:text-blue-600", "line-clamp-1")}
            ${renderHoverText(`${formatCurrency(item.price)} x ${item.soLuong}`, "text-sm text-slate-500")}
            ${renderHoverText(`Dung lượng: ${item.selectedCapacity || "Chưa chọn"}`, "text-xs text-blue-600 font-bold")}
            ${renderHoverText(`Màu sắc: ${item.selectedColor || "Chưa chọn"}`, "text-xs text-orange-500 font-bold")}
            ${renderHoverText(`Thành tiền: ${formatCurrency(lineTotal)}`, "text-xs text-red-500 font-bold")}

            ${renderReturnTime(order)}

            ${
              canReturn
                ? `
                  <button
                    onclick="event.stopPropagation(); openReturnPopup('${order.id}', '${itemKey}')"
                    data-expire-at="${expireAt}"
                    class="jsReturnButton mt-2 px-3 py-2 rounded-xl text-xs font-bold ${
                      alreadyReturned
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                    }"
                    ${alreadyReturned ? "disabled" : ""}
                  >
                    ${alreadyReturned ? "Đã gửi đổi trả" : "Yêu cầu đổi trả"}
                  </button>
                `
                : ""
            }

            ${renderReturnStatus(returnRequest)}
          </div>
        </div>
      `;
    })
    .join("");
};

/* ================= POPUP HỦY ĐƠN CỦA USER ================= */

/* Tạo popup hủy đơn */
const createCancelPopup = () => {
  pageBody.insertAdjacentHTML(
    "beforeend",
    `
    <div 
      id="userCancelPopup" 
      class="hidden fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-md">
        <h2 class="text-xl font-black mb-4">
          Lý do hủy đơn hàng
        </h2>

        <label class="font-bold text-sm">
          Lý do hủy
        </label>

        <select 
          id="userCancelReasonSelect" 
          class="w-full mt-2 border rounded-xl px-4 py-3"
        >
          <option value="Không cần nữa">Không cần nữa</option>
          <option value="Muốn đổi sản phẩm">Muốn đổi sản phẩm</option>
          <option value="Muốn đổi size">Muốn đổi size</option>
          <option value="Lý do khác">Lý do khác</option>
        </select>

        <textarea
          id="userCancelReasonInput"
          class="hidden w-full mt-3 border rounded-xl px-4 py-3 outline-none"
          placeholder="Nhập lý do khác"
          rows="3"
        ></textarea>

        <div class="flex gap-3 mt-5">
          <button 
            id="btnConfirmUserCancel" 
            class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl"
          >
            Xác nhận hủy
          </button>

          <button 
            id="btnCloseUserCancel" 
            class="flex-1 bg-slate-200 hover:bg-slate-300 font-bold py-3 rounded-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  `,
  );
};

/* Khởi tạo popup */
createCancelPopup();

/* Lấy DOM popup */
const userCancelPopup = getElement("userCancelPopup");
const userCancelReasonSelect = getElement(
  "userCancelReasonSelect",
);
const userCancelReasonInput = getElement("userCancelReasonInput");
const btnConfirmUserCancel = getElement("btnConfirmUserCancel");
const btnCloseUserCancel = getElement("btnCloseUserCancel");

/* Lưu mã đơn đang được chọn để hủy */
let cancelOrderId = null;

/* Hiện input khi chọn lý do khác */
userCancelReasonSelect.addEventListener("change", () => {
  if (userCancelReasonSelect.value === "Lý do khác") {
    userCancelReasonInput.classList.remove("hidden");
  } else {
    userCancelReasonInput.classList.add("hidden");
    userCancelReasonInput.value = "";
  }
});

/* Đóng popup hủy đơn */
btnCloseUserCancel.addEventListener("click", () => {
  userCancelPopup.classList.add("hidden");
});

/* Xác nhận hủy đơn */
btnConfirmUserCancel.addEventListener("click", async () => {
  const orders = getOrders();

  const order = orders.find((item) => {
    return item.id === cancelOrderId;
  });

  if (!order || !canCancelOrder(order.status)) return;

  let reason = userCancelReasonSelect.value;

  if (reason === "Lý do khác") {
    reason = userCancelReasonInput.value.trim();

    if (!reason) {
      alert("Vui lòng nhập lý do hủy");
      return;
    }
  }

  try {
    await cancelOrder(order, reason, "Khách hàng");
  } catch (error) {
    alert(error.message || "Không thể hủy đơn hàng");
    return;
  }

  saveOrders(orders);

  userCancelPopup.classList.add("hidden");

  alert("Đã hủy đơn");

  renderOrders();
});

/* ================= RENDER DANH SÁCH ĐƠN HÀNG ================= */

/* Render danh sách đơn hàng */
const renderOrders = () => {
  const orders = getOrders();

  if (!orderTableBody) return;
  ensureDeliveredTime(orders);

  if (orders.length === 0) {
    orderTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-10 text-center text-slate-400 font-bold">
          Chưa có đơn hàng
        </td>
      </tr>
    `;
    return;
  }

  const hasCancelReason = orders.some((order) => {
    return order.status === "Đã bị hủy";
  });

  orderTableBody.innerHTML = orders
    .map((order) => {
      const allowCancel = canCancelOrder(order.status);

      return `
        <tr class="border-b align-top hover:bg-slate-50">
          <td class="p-4 font-black text-blue-600">
            <div class="space-y-2 min-w-0">
              ${renderHoverText(order.id, "", "line-clamp-1")}
              ${renderHoverText(`Ngày đặt: ${order.createdAt || "Không có"}`, "text-xs text-slate-500")}
              ${renderHoverText(`Khách hàng: ${order.customer?.fullName || "Không có"}`, "text-xs text-slate-500")}
              ${renderHoverText(`SĐT: ${order.customer?.phone || "Không có"}`, "text-xs text-slate-500")}
              ${renderHoverText(`Địa chỉ: ${getReceiveAddress(order)}`, "text-xs text-slate-500")}
              ${renderHoverText(`Thanh toán: ${order.paymentMethod || "Không có"}`, "text-xs text-slate-500")}
              ${renderHoverText(`Ghi chú: ${order.customer?.note || order.note || "Không có"}`, "text-xs text-slate-500")}
            </div>
          </td>

          <td class="p-4">
            <div class="min-w-0">
              ${renderOrderItems(order)}
            </div>
          </td>

          <td class="p-4 text-right font-black whitespace-nowrap text-red-500">
            ${formatCurrency(order.total)}
          </td>

          <td class="p-4 text-center">
            <button
              class="btnCancelOrder whitespace-nowrap px-4 py-2 rounded-xl font-bold ${
                allowCancel
                  ? "bg-red-500 cursor-pointer hover:bg-red-600 duration-100 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }"
              data-id="${order.id}"
              ${allowCancel ? "" : "disabled"}
            >
              Hủy đơn
            </button>
          </td>

          <td class="p-4 font-bold whitespace-nowrap">
            ${order.status}
          </td>

          ${
            hasCancelReason
              ? `
                <td class="p-4 font-bold text-red-500">
                  ${renderHoverText(
                    order.status === "Đã bị hủy"
                      ? order.cancelReason || "Không có"
                      : "",
                    "",
                    "line-clamp-2"
                  )}
                </td>
              `
              : ""
          }
        </tr>
      `;
    })
    .join("");

  handleCancelButtons();
};

/* Gắn sự kiện cho nút hủy đơn */
const handleCancelButtons = () => {
  selectElements(".btnCancelOrder").forEach((button) => {
    button.addEventListener("click", () => {
      cancelOrderId = button.dataset.id;

      userCancelReasonSelect.value = "Không cần nữa";
      userCancelReasonInput.value = "";
      userCancelReasonInput.classList.add("hidden");

      userCancelPopup.classList.remove("hidden");
    });
  });
};

/* ================= KHỞI CHẠY TRANG ================= */
if (isUserLoggedIn) {
  renderOrders();
  setInterval(updateReturnTimers, 1000);
  initReturnFeature(renderOrders);
}
