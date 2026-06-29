/* ================= IMPORT MODULES ================= */
import { dom, state, formatCurrency, selectElements } from "./core.js";
import { showAppConfirm } from "../shared-dialog.js";

/* ================= ADMIN: LẤY TẤT CẢ ĐƠN HÀNG ================= */

/* Lấy toàn bộ đơn hàng của tất cả user */
export const getAllOrdersForAdmin = () => {
  const allOrders = [];

  Object.keys(localStorage).forEach((key) => {
    /* Chỉ lấy key đơn hàng */
    if (!key.startsWith("KP_ORDERS_")) return;

    /* Lấy username từ key */
    const username = key.replace("KP_ORDERS_", "");

    /* Lấy dữ liệu đơn hàng */
    const value = localStorage.getItem(key);

    if (!value || value === "undefined") return;

    let orders = [];

    /* Parse JSON an toàn */
    try {
      orders = JSON.parse(value);
    } catch (error) {
      orders = [];
    }

    /* Bỏ qua nếu không phải mảng */
    if (!Array.isArray(orders)) return;

    /* Gắn ownerUsername để admin biết đơn thuộc ai */
    orders.forEach((order) => {
      allOrders.push({
        ...order,
        ownerUsername: username,
      });
    });
  });

  return allOrders;
};

/* ================= ADMIN: TÌM ĐƠN HÀNG ================= */

/* Tìm đơn hàng theo mã đơn + username */
export const findOrderForAdmin = (orderId, username) => {
  const orders =
    JSON.parse(localStorage.getItem(`KP_ORDERS_${username}`)) || [];

  return orders.find((order) => {
    return order.id === orderId;
  });
};

/* ================= ADMIN: CẬP NHẬT ĐƠN HÀNG ================= */

/* Cập nhật đơn hàng đúng user */
export const updateOrderForAdmin = (username, updatedOrder) => {
  const key = `KP_ORDERS_${username}`;

  const orders = JSON.parse(localStorage.getItem(key)) || [];

  const newOrders = orders.map((order) => {
    if (order.id === updatedOrder.id) {
      return updatedOrder;
    }

    return order;
  });

  localStorage.setItem(key, JSON.stringify(newOrders));
};

/* ================= ADMIN: XÓA ĐƠN HÀNG ================= */

/* Xóa đơn hàng đúng user */
export const deleteOrderForAdmin = (username, orderId) => {
  const key = `KP_ORDERS_${username}`;

  const orders = JSON.parse(localStorage.getItem(key)) || [];

  const newOrders = orders.filter((order) => {
    return order.id !== orderId;
  });

  localStorage.setItem(key, JSON.stringify(newOrders));
};

/* Kiểm tra đơn hàng có được xóa không */
const canDeleteOrder = (status) => {
  return status === "Đã bị hủy" || status === "Đã giao hàng";
};

/* ================= HÀM HỖ TRỢ HIỂN THỊ ĐƠN HÀNG ================= */

/* Lấy tên khách hàng */
const getCustomerName = (order) => {
  return order.customer?.fullName || "Không có";
};

/* Lấy số điện thoại khách hàng */
const getCustomerPhone = (order) => {
  return order.customer?.phone || "Không có";
};

/* Lấy số lượng sản phẩm trong đơn */
const getTotalOrderItems = (order) => {
  return order.items ? order.items.length : 0;
};

/* ================= RENDER ĐƠN HÀNG ADMIN ================= */

const renderOrderProducts = (items) => {
  return items.map((item) => {
    return `
      <div class="flex items-center gap-3 mb-3">
        <img src="${item.img}" class="w-12 h-12 object-contain bg-slate-50 rounded-lg" />
        <div>
          <p class="font-bold text-sm">${item.name}</p>
          <p class="text-xs text-slate-500">${formatCurrency(item.price)} x ${item.soLuong || 1}</p>
          ${
            item.selectedCapacity
              ? `
                <p class="text-xs font-bold text-blue-600 mt-1">
                  Dung lượng: ${item.selectedCapacity}
                </p>
              `
              : ""
          }

          ${
            item.selectedColor
              ? `
                <p class="text-xs font-bold text-orange-500">
                  Màu sắc: ${item.selectedColor}
                </p>
              `
              : ""
          }
        </div>
      </div>
    `;
  }).join("");
};

/* Lấy ngày - giờ phút giây tạo đơn để group */
const getOrderDateTime = (order) => {
  if (!order.createdAt) {
    return "Không xác định";
  }

  const [date, time] = order.createdAt.split(" ");

  return `${date} - ${time}`;
};

/* Render danh sách đơn hàng */
const renderOrders = () => {
  if (!dom.orderTableBody) return;

  if (state.orders.length === 0) {
    dom.orderTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-10 text-center text-slate-400 font-bold">
          Chưa có đơn hàng
        </td>
      </tr>
    `;
    return;
  }

/* Gom nhóm đơn hàng theo ngày tạo */
const groupedOrders = {};

state.orders.forEach((order) => {
  const date = getOrderDateTime(order);

  if (!groupedOrders[date]) {
    groupedOrders[date] = [];
  }

  groupedOrders[date].push(order);
});

dom.orderTableBody.innerHTML = Object.entries(groupedOrders)
  .map(([date, orders]) => {
    return `
      <tr>
        <td colspan="7" class="bg-slate-100 py-4 px-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">📅</span>

            <span class="font-black text-slate-700">
              ${date}
            </span>
          </div>
        </td>
      </tr>

      ${orders.map((order) => {
        return `
          <tr class="border-b hover:bg-slate-50">
            <td class="p-4 text-center font-black text-indigo-600">
              ${order.id}
            </td>

            <td class="p-4 font-bold">
              ${getCustomerName(order)}
            </td>

            <td class="p-4 text-center font-bold">
              ${getCustomerPhone(order)}
            </td>

            <td class="p-4 min-w-64">
              ${renderOrderProducts(order.items || [])}
            </td>

            <td class="p-4 text-center font-black text-red-500">
              ${formatCurrency(order.total)}
            </td>

            <td class="p-4 text-center">
              <a
                href="./order-detail.html?id=${order.id}&user=${order.ownerUsername}"
                class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold"
              >
                Xem chi tiết
              </a>
            </td>

            <td class="p-4 text-center">
              <button
                class="btnDeleteOrder px-4 py-2 rounded-xl font-bold ${
                  canDeleteOrder(order.status)
                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }"
                data-id="${order.id}"
                data-user="${order.ownerUsername}"
                ${canDeleteOrder(order.status) ? "" : "disabled"}
              >
                Xóa
              </button>
            </td>
          </tr>
        `;
      }).join("")}
    `;
  })
  .join("");

  handleDeleteOrderButtons();
};

/* ================= XÓA ĐƠN HÀNG Ở TRANG QUẢN LÝ ================= */

/* Gắn sự kiện cho nút xóa đơn */
const handleDeleteOrderButtons = () => {
  selectElements(".btnDeleteOrder").forEach((button) => {
    button.addEventListener("click", async () => {
      const orderId = button.dataset.id;
      const username = button.dataset.user;

      const order = state.orders.find((item) => {
        return item.id === orderId;
      });

      if (!order || !canDeleteOrder(order.status)) {
        alert("Admin chỉ được xóa đơn hàng đã bị hủy hoặc đã giao");
        return;
      }

      const isConfirm = await showAppConfirm({
        title: "Xóa đơn hàng",
        message: "Bạn có chắc muốn xóa đơn hàng này?",
        confirmText: "Xóa",
      });
      if (!isConfirm) return;

      deleteOrderForAdmin(username, orderId);

      state.orders = state.orders.filter((item) => {
        return item.id !== orderId;
      });

      renderOrders();
    });
  });
};

/* ================= TÌM KIẾM ĐƠN HÀNG ADMIN ================= */

/* Lọc đơn hàng theo mã đơn / khách hàng / số điện thoại */
const filterOrders = (keyword) => {
  const value = keyword.trim().toLowerCase();

  if (!value) {
    state.orders = getAllOrdersForAdmin();
    renderOrders();
    return;
  }

  state.orders = getAllOrdersForAdmin().filter((order) => {
    const orderId = String(order.id || "").toLowerCase();
    const customerName = String(order.customer?.fullName || "").toLowerCase();
    const customerPhone = String(order.customer?.phone || "").toLowerCase();

    return (
      orderId.includes(value) ||
      customerName.includes(value) ||
      customerPhone.includes(value)
    );
  });

  renderOrders();
};

/* Gắn sự kiện nút tìm kiếm */
const handleSearchOrder = () => {
  if (!dom.btnSearchOrder || !dom.orderKeyword) return;

  dom.btnSearchOrder.addEventListener("click", () => {
    filterOrders(dom.orderKeyword.value);
  });

  dom.orderKeyword.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      filterOrders(dom.orderKeyword.value);
    }
  });
};

/* ================= XUẤT FILE EXCEL ================= */

/* Xuất danh sách đơn hàng ra Excel */
const exportOrdersToExcel = () => {
const data = state.orders.map((order) => ({
  "Mã đơn": order.id,

  "Khách hàng":
    order.customer?.fullName || "Không có",

  "Số điện thoại":
    order.customer?.phone || "Không có",

  "Email":
    order.customer?.email || "Không có",

  "Phương thức nhận":
    order.receiveMethod || "",

  "Tổng tiền":
    order.total || 0,

  "Trạng thái":
    order.status || "",

  "Ngày đặt":
    order.createdAt || "",

  "Cập nhật":
    order.updatedAt || "Chưa cập nhật",

  "Ghi chú":
    order.customer?.note ||
    order.note ||
    "Không có",
}));

const worksheet =
  XLSX.utils.json_to_sheet(data);

const workbook =
  XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
  workbook,
  worksheet,
  "Danh sách đơn hàng"
);

XLSX.writeFile(
  workbook,
  "danh-sach-don-hang.xlsx"
);
};

/* Gắn sự kiện xuất Excel */
const handleExportExcel = () => {
console.log("btnExportExcel:", dom.btnExportExcel);
if (!dom.btnExportExcel) return;

dom.btnExportExcel.addEventListener("click", () => {
    console.log("Đã bấm xuất Excel");
    console.log("XLSX:", window.XLSX);
    console.log("orders:", state.orders);
    exportOrdersToExcel();
  }
);
};

/* ================= KHỞI TẠO TRANG QUẢN LÝ ĐƠN HÀNG ================= */

/* Chạy chức năng quản lý đơn hàng */
export const initManageOrder = () => {
  if (!dom.orderTableBody) return;

  state.orders = getAllOrdersForAdmin();

  renderOrders();

  handleSearchOrder();
  handleExportExcel();
};
