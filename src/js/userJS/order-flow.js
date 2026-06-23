/* ================= KEY ĐẾM MÃ ĐƠN HÀNG ================= */
export const ORDER_COUNTER_KEY = "KP_ORDER_COUNTER";

/* ================= LẤY USERNAME HIỆN TẠI ================= */
export const getCurrentUsername = () => {
  return localStorage.getItem("username") || "guest";
};

/* =================== TẠO KEY ĐƠN HÀNG THEO USER ============= */
const getOrderKey = () => {
  return `KP_ORDERS_${getCurrentUsername()}`;
};

/* ================= LẤY DANH SÁCH ĐƠN HÀNG ================= */
export const getOrders = () => {
  return JSON.parse(localStorage.getItem(getOrderKey())) || [];
};

/* ================= LƯU DANH SÁCH ĐƠN HÀNG ================= */
export const saveOrders = (orders) => {
  localStorage.setItem(getOrderKey(), JSON.stringify(orders));
};

/* ================= TẠO MÃ ĐƠN HÀNG ================= */
export const createOrderId = () => {
  const currentNumber = Number(localStorage.getItem(ORDER_COUNTER_KEY)) || 0;
  const nextNumber = currentNumber + 1;
  localStorage.setItem(ORDER_COUNTER_KEY, String(nextNumber));
  return "KPA" + String(nextNumber).padStart(5, "0");
};


/* ================= XỬ LÝ ĐƯỜNG DẪN HÌNH ẢNH ================= */
// export const getImageUrl = (img) => {
//   if (!img) return "";

//   const value = String(img).trim();

//   if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
//     return value;
//   }

//   const fileName = value.split("/").pop();
//   return `../images/${fileName}`;
// };