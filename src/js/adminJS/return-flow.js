/* ================= IMPORT MODULES ================= */
import { dom, API_URL, formatCurrency, getElement } from "./core.js";
import { updateProductStock } from "../shared-stock-flow.js";

/* ================= KEY LOCALSTORAGE ĐỔI TRẢ ================= */
/* ----- Key luu danh sach yeu cau doi tra trong localStorage ----- */
const RETURN_STORAGE_KEY = "KP_RETURN_REQUESTS";

/* ================= LẤY DANH SÁCH ĐỔI TRẢ ================= */
/* ----- Doc danh sach yeu cau doi tra de admin quan ly ----- */
const getReturnRequests = () => {
  return JSON.parse(localStorage.getItem(RETURN_STORAGE_KEY)) || [];
};

/* ================= LƯU DANH SÁCH ĐỔI TRẢ ================= */
/* ----- Luu lai danh sach yeu cau doi tra sau khi admin cap nhat ----- */
const saveReturnRequests = (requests) => {
  localStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(requests));
};

/* ----- Lay danh sach don hang cua user gui yeu cau doi tra ----- */
const getUserOrders = (username) => {
  return JSON.parse(localStorage.getItem(`KP_ORDERS_${username}`)) || [];
};

/* ----- Luu lai don hang user sau khi dong bo trang thai doi tra ----- */
const saveUserOrders = (username, orders) => {
  localStorage.setItem(`KP_ORDERS_${username}`, JSON.stringify(orders));
};

/* ----- Dong bo trang thai yeu cau doi tra vao san pham trong don hang user ----- */
const syncReturnRequestToOrderItem = (request) => {
  const username = request.username || "guest";
  const orders = getUserOrders(username);
  const order = orders.find((item) => item.id === request.orderId);

  if (!order) return;

  const orderItem = (order.items || []).find((item) => {
    const itemKey = `${request.orderId}_${item.id}_${item.selectedCapacity || ""}_${item.selectedColor || ""}`;
    return itemKey === request.itemKey;
  });

  if (!orderItem) return;

  orderItem.returnRequest = request;
  saveUserOrders(username, orders);
};

/* ========== KIỂM TRA CÓ ĐƯỢC XÓA / SỬA HOÀN TIỀN KHÔNG ============ */
/* ----- Kiem tra yeu cau co du dieu HiKu cap nhat hoan tien khong ----- */
const canChangeRefund = (request) => {
  return request.status === "Đã chấp nhận" && request.refundStatus !== "Đã hoàn tiền";
};

/* ================= RENDER DANH SÁCH ĐỔI TRẢ ================= */
/* ----- Render bang danh sach yeu cau doi tra cho admin ----- */
const renderReturnRequests = () => {
  if (!dom.returnTableBody) return;

  const requests = getReturnRequests();

  if (requests.length === 0) {
    dom.returnTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="py-10 text-center text-slate-400 font-bold">
          Chưa có yêu cầu đổi trả
        </td>
      </tr>
    `;
    return;
  }

  dom.returnTableBody.innerHTML = requests.map((request, index) => {
    return `
      <tr class="border-b hover:bg-slate-50">
        <td class="p-4 text-center font-bold">${index + 1}</td>
        <td class="p-4 font-black text-indigo-600">${request.orderId}</td>
        <td class="p-4 font-bold">${request.customer?.fullName || "Không có"}</td>
        <td class="p-4">${request.createdAt}</td>
        <td class="p-4">${request.reason}</td>
        <td class="p-4 font-bold">${request.requestType}</td>
        <td class="p-4 font-black">${request.status}</td>
        <td class="p-4 text-center">
          <button
            onclick="openReturnDetail('${request.id}')"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold"
          >
            Chi tiết
          </button>
        </td>
      </tr>
    `;
  }).join("");
};

/* ================= MỞ CHI TIẾT ĐỔI TRẢ ================= */
/* ================= CHI TIET DOI TRA ADMIN ================= */
/* ----- Mo popup chi tiet va render thong tin yeu cau doi tra ----- */
window.openReturnDetail = (id) => {
  const requests = getReturnRequests();
  const request = requests.find((item) => item.id === id);

  if (!request) return;

  dom.returnDetailContent.innerHTML = `
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="bg-slate-50 rounded-3xl p-5">
        <h3 class="text-xl font-black mb-4">Thông tin khách hàng</h3>
        <p><b>Khách hàng:</b> ${request.customer?.fullName || "Không có"}</p>
        <p><b>SĐT:</b> ${request.customer?.phone || "Không có"}</p>
        <p><b>Email:</b> ${request.customer?.email || "Không có"}</p>

        <h3 class="text-xl font-black mt-6 mb-4">Thông tin đơn hàng</h3>
        <p><b>Mã đơn:</b> ${request.orderId}</p>
        <p><b>Ngày gửi:</b> ${request.createdAt}</p>

        <h3 class="text-xl font-black mt-6 mb-4">Thông tin sản phẩm</h3>
        <div class="flex gap-4 items-center">
          <img src="${request.product.img}" class="w-24 h-24 object-contain bg-white rounded-2xl">
          <div>
            <p class="font-black">${request.product.name}</p>
            <p>${formatCurrency(request.product.price)} x ${request.product.soLuong}</p>
            <p class="text-blue-600 font-bold">Dung lượng: ${request.product.selectedCapacity || "Không có"}</p>
            <p class="text-orange-500 font-bold">Màu sắc: ${request.product.selectedColor || "Không có"}</p>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 rounded-3xl p-5">
        <h3 class="text-xl font-black mb-4">Nội dung yêu cầu</h3>
        <p><b>Lý do:</b> ${request.reason}</p>
        <p><b>Hình thức:</b> ${request.requestType}</p>
        <p><b>Mô tả:</b> ${request.description}</p>

        <div class="mt-5">
          <label class="font-bold">Trạng thái xử lý</label>
          <select id="adminReturnStatus" class="w-full mt-2 border rounded-xl px-4 py-3 font-bold">
            <option ${request.status === "Chờ duyệt" || request.status === "Đang chờ duyệt" ? "selected" : ""}>Chờ duyệt</option>
            <option ${request.status === "Đã chấp nhận" ? "selected" : ""}>Đã chấp nhận</option>
            <option ${request.status === "Đã từ chối" ? "selected" : ""}>Đã từ chối</option>
          </select>
        </div>

        <div id="rejectReasonBox" class="${request.status === "Đã từ chối" ? "" : "hidden"} mt-4">
          <label class="font-bold">Lý do từ chối</label>
          <textarea id="adminRejectReason" class="w-full mt-2 border rounded-xl px-4 py-3" rows="3">${request.rejectReason || ""}</textarea>
        </div>

        <div class="mt-5">
          <label class="font-bold">Trạng thái hoàn tiền</label>
          <select
            id="adminRefundStatus"
            class="w-full mt-2 border rounded-xl px-4 py-3 font-bold"
            ${request.status === "Đã từ chối" || request.refundStatus === "Đã hoàn tiền" ? "disabled" : ""}
          >
            <option ${request.refundStatus === "Chưa hoàn tiền" ? "selected" : ""}>Chưa hoàn tiền</option>
            <option ${request.refundStatus === "Đã hoàn tiền" ? "selected" : ""}>Đã hoàn tiền</option>
          </select>
        </div>

        <button
          onclick="markReturnRestocked('${request.id}')"
          class="w-full mt-4 py-3 rounded-xl font-bold ${
            request.status === "Đã chấp nhận" && !request.restocked
              && request.refundStatus === "Đã hoàn tiền"
              && !request.stockReturned
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }"
          ${request.status === "Đã chấp nhận" && request.refundStatus === "Đã hoàn tiền" && !request.stockReturned && !request.restocked ? "" : "disabled"}
        >
          ${request.stockReturned || request.restocked ? "Đã nhập lại kho" : "Hàng đã nhập lại - Cộng kho"}
        </button>

        <button
          onclick="saveReturnStatus('${request.id}')"
          class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black"
        >
          Lưu cập nhật
        </button>
      </div>
    </div>

    <div class="mt-6">
      <h3 class="text-xl font-black mb-4">Ảnh minh chứng</h3>
      <div class="grid md:grid-cols-3 gap-4">
        ${
          request.images?.length
            ? request.images.map((image) => `
              <img src="${image.data}" class="w-full h-44 object-cover rounded-2xl border">
            `).join("")
            : `<p class="text-slate-400 font-bold">Không có ảnh</p>`
        }
      </div>

      <h3 class="text-xl font-black mt-6 mb-4">Video minh chứng</h3>
      ${
        request.video
          ? `<video src="${request.video.data}" controls class="w-full rounded-2xl border"></video>`
          : `<p class="text-slate-400 font-bold">Không có video</p>`
      }
    </div>
  `;

  getElement("adminReturnStatus").addEventListener("change", (event) => {
    if (event.target.value === "Đã từ chối") {
      getElement("rejectReasonBox").classList.remove("hidden");
      getElement("adminRefundStatus").value = "Chưa hoàn tiền";
      getElement("adminRefundStatus").disabled = true;
    } else {
      getElement("rejectReasonBox").classList.add("hidden");
      getElement("adminRefundStatus").disabled =
        event.target.value !== "Đã chấp nhận" ||
        request.refundStatus === "Đã hoàn tiền";
    }
  });

  dom.returnDetailPopup.classList.remove("hidden");
};

/* ================= LƯU TRẠNG THÁI ĐỔI TRẢ ================= */
/* ----- Luu trang thai xu ly, tu choi va hoan tien cua yeu cau ----- */
window.saveReturnStatus = (id) => {
  const requests = getReturnRequests();
  const request = requests.find((item) => item.id === id);

  if (!request) return;

  const newStatus = getElement("adminReturnStatus").value;
  const rejectReason = getElement("adminRejectReason")?.value.trim() || "";
  const refundStatus = getElement("adminRefundStatus").value;

  if (
    (request.status === "Đã chấp nhận" || request.status === "Đã từ chối") &&
    newStatus !== request.status
  ) {
    alert("Yêu cầu đổi trả đã xử lý thì không được đổi lại trạng thái");
    return;
  }

  if (newStatus === "Đã từ chối" && !rejectReason) {
    alert("Vui lòng nhập lý do từ chối");
    return;
  }

  request.status = newStatus;

  if (newStatus === "Đã từ chối") {
    request.rejectReason = rejectReason;
    request.refundStatus = "Chưa hoàn tiền";
  }

  if (newStatus === "Đã chấp nhận" && request.refundStatus !== "Đã hoàn tiền") {
    request.refundStatus = refundStatus;
  }

  request.updatedAt = new Date().toLocaleString("vi-VN");

  saveReturnRequests(requests);
  syncReturnRequestToOrderItem(request);

  alert("Đã cập nhật yêu cầu đổi trả");

  renderReturnRequests();

  dom.returnDetailPopup.classList.add("hidden");
};

/* ================= CỘNG LẠI TỒN KHO ================= */
/* ----- Cong lai ton kho sau khi yeu cau da chap nhan va da hoan tien ----- */
window.markReturnRestocked = async (id) => {
  const requests = getReturnRequests();
  const request = requests.find((item) => item.id === id);

  if (
    !request ||
    request.status !== "Đã chấp nhận" ||
    request.refundStatus !== "Đã hoàn tiền" ||
    request.stockReturned ||
    request.restocked
  ) return;

  try {
    const response = await fetch(`${API_URL}/${request.product.id}`);
    const product = await response.json();

    const currentQuantity = Number(product.quantity || 0);
    const returnQuantity = Number(request.product.soLuong || 1);

    await updateProductStock(request.product.id, currentQuantity + returnQuantity);

    request.stockReturned = true;
    request.restocked = true;
    request.restockedAt = new Date().toLocaleString("vi-VN");

    saveReturnRequests(requests);
    syncReturnRequestToOrderItem(request);

    alert("Đã cộng lại số lượng tồn kho");

    window.openReturnDetail(id);
    renderReturnRequests();

  } catch (error) {
    alert("Không thể cập nhật tồn kho");
  }
};

/* ================= KHỞI TẠO QUẢN LÝ ĐỔI TRẢ ================= */
/* ----- Khoi tao trang quan ly doi tra va gan su HiKu dong popup ----- */
export const initManageReturn = () => {
  if (!dom.returnTableBody) return;

  renderReturnRequests();

  dom.btnCloseReturnDetail?.addEventListener("click", () => {
    dom.returnDetailPopup.classList.add("hidden");
  });
};
