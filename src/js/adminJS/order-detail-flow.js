/* ================= IMPORT MODULES ================= */
import {
    findOrderForAdmin,
    updateOrderForAdmin,
    deleteOrderForAdmin,
} from "../adminJS/order-flow.js";

import {
  applyStockWhenOrderStatusChanges,
  cancelOrder,
} from "../shared-stock-flow.js";

import {
  formatCurrency,
  dom,
  orderId,
  username,
  getElement,
  createElement
} from "./core.js";

import { getImageUrl } from "./ui-flow.js";
import { showAppConfirm } from "../shared-dialog.js";
/* ===================Xóa đơn hàng ======================= */
/* Kiểm tra đơn hàng có được xóa không */
const canDeleteOrder = (status) => {
  return status === "Đã bị hủy" || status === "Đã giao hàng";
};

/* ================= XÓA ĐƠN HÀNG Ở TRANG CHI TIẾT ================= */
/* Gắn sự kiện xóa đơn hàng */
const handleDeleteOrderDetail = () => {
  const btnDeleteOrderDetail = getElement("btnDeleteOrderDetail");

  if (!btnDeleteOrderDetail) return;

  btnDeleteOrderDetail.addEventListener("click", async () => {
    if (!currentOrder || !canDeleteOrder(currentOrder.status)) {
      alert("Admin chỉ được xóa đơn hàng đã bị hủy hoặc đã giao");
      return;
    }

    const isConfirm = await showAppConfirm({
      title: "Xóa đơn hàng",
      message: "Bạn có chắc muốn xóa đơn hàng này?",
      confirmText: "Xóa",
    });
    if (!isConfirm) return;

    deleteOrderForAdmin(username, currentOrder.id);

    alert("Đã xóa đơn hàng");

    window.location.href = "./manage-order.html";
  });
};

/* ================= STATE TRANG CHI TIẾT ================= */

/* Lưu đơn hàng hiện tại */
let currentOrder = null;

/* ================= HÀM HỖ TRỢ ================= */

/* ================= RENDER SẢN PHẨM VÀ QUÀ TẶNG ================= */

/* Render quà ưu đãi nếu có */
const renderGift = (item) => {
  if (!item.giftName) return "";
  const hasGift =
        item.giftName &&
        item.giftImg &&
        String(item.giftName).trim().toLowerCase() !== "không" &&
        String(item.giftImg).trim().toLowerCase() !== "không";


  return `
    ${
      hasGift
        ? `
          <div class="flex items-center justify-center md:justify-start gap-3 p-3 mt-3 md:w-[50%] lg:w-[60%] bg-orange-100 border border-orange-100 rounded-2xl">
            <div class="flex gap-2 items-center">
              <div class="flex flex-col gap-2">
                <p class=" md:hidden text-[11px] font-black text-orange-500 uppercase">
                  Quà tặng
                </p>
                <img src="${getImageUrl(item.giftImg)}" class="w-12 h-12 object-contain">
              
              </div>
              <div class="hidden md:block"> 
                <p class="text-[11px] font-black text-orange-500 uppercase">
                  Quà tặng
                </p>
                <p class="text-sm font-black">
                  ${item.giftName}
                </p>
              </div>
          
            </div>
          </div>
        `
        : ""
    }
  `;
};

const totalPrice = (items) => {
  return items.reduce((sum, item) => {
    return sum + item.price * item.soLuong;
  }, 0);
};

/* Render một sản phẩm trong đơn */
const renderOrderItem = (item) => {
  return `
    <div class="border rounded-3xl p-4 mb-4 bg-white">
        <div class="flex gap-4 items-center">
            <img 
                src="${item.img}" 
                class="w-24 h-24 object-contain bg-slate-50 rounded-2xl" 
            />

            <div class="w-full">
                <h3 class="font-black text-[15px] md:text-lg">
                ${item.name}
                </h3>

                <p class="text-slate-500 text-[15px] md:text-sm font-bold mt-1">
                Giá: ${formatCurrency(item.price)}
                </p>

                <p class="text-slate-500 font-bold">
                Số lượng: ${item.soLuong}
                </p>

                ${
                  item.selectedCapacity
                    ? `
                      <p class="text-blue-600 font-bold">
                        Dung lượng:
                        ${item.selectedCapacity}
                      </p>
                    `
                    : ""
                }

                ${
                  item.selectedColor
                    ? `
                      <p class="text-orange-500 font-bold">
                        Màu sắc:
                        ${item.selectedColor}
                      </p>
                    `
                    : ""
                }

                ${renderGift(item)}
            </div>
        </div>
    </div>
  `;
};

/* Render toàn bộ sản phẩm trong đơn */
const renderOrderItems = (items) => {
  return items
    .map((item) => {
      return renderOrderItem(item);
    })
    .join("");
};

/* ================= RENDER TRẠNG THÁI ĐƠN HÀNG ================= */

/* Render select cập nhật trạng thái */
const renderStatusSelect = (status) => {
  return `
    <select
      id="adminOrderStatus"
      class="w-full text-sm lg:text-lg mt-2 border rounded-xl px-4 py-3 font-bold"
    >
      <option ${status === "Đang xử lý" || status === "Chờ xác nhận đặt hàng" || status === "Chuẩn bị hàng" ? "selected" : ""}>
        Đang xử lý
      </option>

      <option ${status === "Đang giao hàng" ? "selected" : ""}>
        Đang giao hàng
      </option>

      <option ${status === "Đã giao hàng" ? "selected" : ""}>
        Đã giao hàng
      </option>

      <option ${status === "Đã bị hủy" ? "selected" : ""}>
        Đã bị hủy
      </option>
    </select>
  `;
};

/* Render lý do hủy nếu đơn đã bị hủy */
const renderCancelReason = (order) => {
  if (order.status !== "Đã bị hủy") return "";

  return `
    <p>
      Lý do hủy:
      <span class="text-red-500">
        ${order.cancelReason || "Không có"}
      </span>
    </p>
  `;
};


const getStatusClass = (status) => {
  if (status === "Đã bị hủy") return "font-bold text-red-600";
  if (status === "Đang giao hàng") return "font-bold text-blue-600";
  if (status === "Đã giao hàng") return "font-bold text-emerald-600";
  return "text-amber-600";
};
    
/* ================= RENDER CHI TIẾT ĐƠN HÀNG ================= */

/* Render toàn bộ trang chi tiết */
const renderOrderDetail = () => {
  currentOrder = findOrderForAdmin(orderId, username);

  if (!currentOrder) {
    dom.orderDetailBox.innerHTML = `
      <div class="bg-white p-10 rounded-3xl text-center font-bold text-slate-400">
        Không tìm thấy đơn hàng
      </div>
    `;
    return;
  }

  dom.orderDetailBox.innerHTML = `
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="bg-slate-200 h-fit p-5 rounded-2xl">
        ${renderOrderItems(currentOrder.items)}
        <hr class="mb-3">
        <span class="text-sm md:text-xl font-bold text-blue-600">Tổng giá đơn hàng: ${totalPrice(currentOrder.items).toLocaleString()} đ</span>
      </div>

      <div class="bg-slate-200 p-5 rounded-2xl flex h-fit items-center">
        <div class="bg-white border rounded-3xl p-6 h-full w-full">
            <h2 class="text-[17px] text-center md:text-xl font-black mb-5">
              Thông tin đơn hàng
            </h2>

            <div class="mb-5">
              <label class="font-bold text-sm md:text-lg">
                  Cập nhật trạng thái
              </label>

              ${renderStatusSelect(currentOrder.status)}
            </div>

            <div class="space-y-4 font-bold text-sm md:text-lg">
              <p>
                  Trạng thái:
                  <span class="${getStatusClass(currentOrder.status)}">
                  ${currentOrder.status}
                  </span>
              </p>

              <p>
                Phương thức nhận hàng:
                <span class="text-slate-500 text-sm md:text-lg">
                  ${getReceiveMethodText(currentOrder)}
                </span>
              </p>

              ${renderReceiveAddress(currentOrder)}

              <p>
                Thời gian:
                <span class="text-slate-500 text-sm md:text-lg">
                  ${currentOrder.updatedAt || currentOrder.createdAt || "Chưa cập nhật"}
                </span>
              </p>

              <p>
                Ghi chú:
                <span class="text-slate-500 text-sm md:text-lg">
                  ${currentOrder.customer?.note || currentOrder.note || "Không có"}
                </span>
              </p>

              ${renderCancelReason(currentOrder)}
            </div>
            <div class="mt-3 md:mt-10  mb-2">
              <button
                  id="btnDeleteOrderDetail"
                  class="w-full px-4 py-3 rounded-xl font-bold ${
                  canDeleteOrder(currentOrder.status)
                      ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }"
                  ${canDeleteOrder(currentOrder.status) ? "" : "disabled"}
              >
                  Xóa đơn hàng
              </button>
          </div>
          <div class="mt-3 md:mt-10  mb-2">
              <button class="w-full px-4 bg-blue-600 hover:bg-blue-700 duration-100 cursor-pointer text-white font-bold py-3 rounded-xl font-bold" onClick="alert('Đã cập nhật thay đổi')">
                Xác nhận
              </button>
          </div>
        </div>
      </div>
    </div>
  `;

  handleChangeStatus();
  handleDeleteOrderDetail();
};

/* ========= HIỂN THỊ PHƯƠNG THỨC GIAO HÀNG & ĐỊA CHỈ GIAO NHẬN HÀNG */
/* Lấy phương thức nhận hàng */
const getReceiveMethodText = (order) => {
  return order.receiveMethod || "Không có";
};

/* render địa chỉ nhận dựa vào phương thức nhận */
const renderReceiveAddress = (order) => {
  if (order.receiveMethod === "Nhận tại cửa hàng") {
    return `
      <p>
        Cửa hàng:
        <span class="text-slate-500 text-sm md:text-lg">
          ${order.store || "Không có"}
        </span>
      </p>
    `;
  }

  return `
    <p>
      Địa chỉ:
      <span class="text-slate-500 text-sm md:text-lg">
        ${order.province || "Không có"} - ${order.district || "Không có"} - ${order.address || "Không có"}
      </span>
    </p>
  `;
};

/* ================= XỬ LÝ CẬP NHẬT TRẠNG THÁI ================= */

/* Gắn sự kiện khi admin đổi trạng thái */
const handleChangeStatus = () => {
  const adminOrderStatus = getElement("adminOrderStatus");

  adminOrderStatus.addEventListener("change", () => {
    const newStatus = adminOrderStatus.value;

    if (newStatus === "Đã bị hủy") {
      openAdminCancelPopup();
      return;
    }

    updateOrderStatus(newStatus);
  });
};

/* Mở popup nhập lý do hủy */
const openAdminCancelPopup = () => {
  dom.adminCancelReason.value = "Không gửi được đơn vị vận chuyển";
  const otherReason = getElement("adminCancelOtherReason");

  if (otherReason) {
    otherReason.value = "";
    otherReason.classList.add("hidden");
  }

  dom.adminCancelPopup.classList.remove("hidden");
};

/* Đóng popup nhập lý do hủy */
const closeAdminCancelPopup = () => {
  dom.adminCancelPopup.classList.add("hidden");
};

/* Cập nhật trạng thái bình thường */
const updateOrderStatus = async (newStatus) => {
  try {
    await applyStockWhenOrderStatusChanges(currentOrder, newStatus);
  } catch (error) {
    alert(error.message || "Không thể cập nhật tồn kho");
    renderOrderDetail();
    return;
  }

  updateOrderForAdmin(username, currentOrder);

  renderOrderDetail();
};

/* Admin xác nhận hủy đơn */
const confirmAdminCancelOrder = async () => {
  const otherReason = getElement("adminCancelOtherReason");
  let reason = dom.adminCancelReason.value.trim();

  if (reason === "Lý do khác") {
    reason = otherReason?.value.trim() || "";
  }

  if (!reason) {
    alert("Vui lòng nhập lý do hủy hàng");
    return;
  }

  try {
    await cancelOrder(currentOrder, reason, "Admin");
  } catch (error) {
    alert(error.message || "Không thể hủy đơn hàng");
    return;
  }

  updateOrderForAdmin(username, currentOrder);

  closeAdminCancelPopup();

  renderOrderDetail();
};

const setupAdminCancelReasonControl = () => {
  if (!dom.adminCancelReason || dom.adminCancelReason.tagName === "SELECT") return;

  const wrapper = createElement("div");
  wrapper.innerHTML = `
    <select id="adminCancelReason" class="w-full mt-2 border rounded-xl px-4 py-3 outline-none">
      <option value="Không gửi được đơn vị vận chuyển">Không gửi được đơn vị vận chuyển</option>
      <option value="Sự cố về sản phẩm">Sự cố về sản phẩm</option>
      <option value="Lý do khác">Lý do khác</option>
    </select>
    <textarea id="adminCancelOtherReason" class="hidden w-full mt-3 border rounded-xl px-4 py-3 outline-none" rows="3" placeholder="Nhập lý do hủy hàng"></textarea>
  `;

  const select = wrapper.querySelector("#adminCancelReason");
  const textarea = wrapper.querySelector("#adminCancelOtherReason");

  dom.adminCancelReason.replaceWith(select, textarea);
  dom.adminCancelReason = select;

  select.addEventListener("change", () => {
    textarea.classList.toggle("hidden", select.value !== "Lý do khác");
  });
};



/* ================= KHỞI TẠO TRANG ================= */
export const initOrderDetail = () => {
  if (!dom.orderDetailBox) return;

  setupAdminCancelReasonControl();

  renderOrderDetail();

  dom.btnConfirmAdminCancel?.addEventListener("click", () => {
    confirmAdminCancelOrder();
  });

  dom.btnCloseAdminCancel?.addEventListener("click", () => {
    closeAdminCancelPopup();
    renderOrderDetail();
  });
};
