/* ================= IMPORT MODULES ================= */
import {getOrders, saveOrders, createOrderId} from "./order-flow.js";
import {provinceList, getDistrictsByProvince} from "./address-data.js";
import { el, API, productDetailUrl, getElement, selectElement } from "./core.js";
import { formatCurrency, getImageUrl } from "./ui-flow.js";

/* ================= STATE CHECKOUT ================= */
let checkoutItems = [];
const SELECTED_CART_ITEMS_KEY = "KP_CHECKOUT_SELECTED_CART_ITEMS";

/* ================= REGEX VALIDATE ================= */
const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ================= LẤY SỐ LƯỢNG SẢN PHẨM ================= */
const getQuantity = (product) => {
  return Number(product.quantity ?? 10);
};

/* ================= HIỂN THỊ LỖI ================= */
const showError = (id, message) => {
  const error = getElement(`error-${id}`);

  if (error) {
    error.textContent = message;
    error.classList.remove("hidden");
  }
};

/* ================= ẨN LỖI ================= */
const hideError = (id) => {
  const error = getElement(`error-${id}`);

  if (error) {
    error.textContent = "";
    error.classList.add("hidden");
  }
};

/* ================= LẤY PARAM TRÊN URL ================= */
const getParam = (name) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
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

/* ================= LOAD SẢN PHẨM THANH TOÁN ================= */
const loadCheckoutItems = async () => {
  const productId = getParam("id");
  const fromCart = getParam("from") === "cart";

  /* Thanh toán từ giỏ hàng */
  if (fromCart) {
    const username = localStorage.getItem("username") || "guest";
    const cartKey = `GIO_HANG_USER_${username}`;
    const selectedIds = JSON.parse(localStorage.getItem(SELECTED_CART_ITEMS_KEY)) || [];
    const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];

    checkoutItems = selectedIds.length
      ? cartItems.filter((item) => selectedIds.includes(String(item.id)))
      : cartItems;

    renderOrderSummary();
    return;
  }

  /* Thanh toán trực tiếp một sản phẩm */
  if (productId) {
    const response = await fetch(`${API}/${productId}`);
    const product = await response.json();

    const selectedCapacity = getParam("capacity") || "";
    const selectedColor = getParam("color") || "";

    checkoutItems = [
      {
        ...product,
        soLuong: 1,
        selectedCapacity,
        selectedColor
      }
    ];

    renderOrderSummary();
    return;
  }

  /* Mặc định lấy giỏ hàng hiện tại */
  const username = localStorage.getItem("username") || "guest";
  const cartKey = `GIO_HANG_USER_${username}`;

  checkoutItems =
    JSON.parse(localStorage.getItem(cartKey)) || [];

  renderOrderSummary();
};

/* ================= RENDER TÓM TẮT ĐƠN HÀNG ================= */
const renderOrderSummary = () => {
  if (!el.orderSummary) return;

  /* Không có sản phẩm thanh toán */
  if (checkoutItems.length === 0) {
    el.orderSummary.innerHTML = `
      <p class="text-center text-slate-400 font-bold py-10">
        Chưa có sản phẩm thanh toán
      </p>
    `;
    return;
  }

  /* Tính tổng tiền */
  const total = checkoutItems.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.soLuong || 1);
  }, 0);

  /* Render danh sách sản phẩm + tổng tiền */
  el.orderSummary.innerHTML = `
    ${checkoutItems.map((item) => {
      const hasGift =
        item.giftName &&
        item.giftImg &&
        String(item.giftName).trim().toLowerCase() !== "không" &&
        String(item.giftImg).trim().toLowerCase() !== "không";

      return `
        <div onclick="window.location.href='${productDetailUrl(item.id)}'" class="flex items-center bg-slate-100 rounded-2xl gap-4 mb-3 border-b py-4 cursor-pointer hover:bg-slate-200 duration-100">
          <img src="${getImageUrl(item.img)}" class="w-16 h-16 md:w-30 md:h-30 shrink-0 object-contain rounded-xl" />
          <div class="flex-1 min-w-0">
            ${renderHoverText(item.name, "font-black hover:text-blue-600", "line-clamp-1")}
            ${renderHoverText(`Giá: ${formatCurrency(item.price)}`, "text-sm text-slate-500")}
            ${renderHoverText(`Số lượng: ${item.soLuong || 1} sản phẩm`, "text-sm text-slate-500")}
            ${renderHoverText(`Dung lượng: ${item.selectedCapacity || "Chưa chọn"}`, "text-sm text-blue-600 font-bold")}
            ${renderHoverText(`Màu sắc: ${item.selectedColor || "Chưa chọn"}`, "text-sm text-orange-500 font-bold")}

            ${
              hasGift
                ? `
                  <div class="flex items-center justify-center md:justify-start gap-3 p-3 mt-3 w-[60%] bg-orange-100 border border-orange-100 rounded-2xl">
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
          </div>
        </div>
      `;
    }).join("")}
    <div class="flex justify-between items-center pt-5">
      <span class="font-bold text-slate-500">Tổng tiền</span>
      <span class="text-2xl font-black text-red-500">${formatCurrency(total)}</span>
    </div>
  `;
};

/* ================= RENDER TỈNH / THÀNH PHỐ ================= */
const renderProvinces = () => {
  el.provinceSelect.innerHTML = `<option value="">Tỉnh/thành phố</option>`;

  provinceList.forEach((province) => {
    el.provinceSelect.innerHTML += `
      <option value="${province.value}">
        ${province.name}
      </option>
    `;
  });

  el.provinceSelect.value = "Hồ Chí Minh";

  renderDistricts();
};

/* ================= RENDER QUẬN / HUYỆN ================= */
const renderDistricts = () => {
  const districts = getDistrictsByProvince(el.provinceSelect.value);

  el.districtSelect.innerHTML = `<option value="">Chọn quận/huyện</option>`;

  districts.forEach((district) => {
    el.districtSelect.innerHTML += `
      <option value="${district.value}">
        ${district.name}
      </option>
    `;
  });
};

/* ================= CHỌN HÌNH THỨC NHẬN HÀNG ================= */
const toggleReceiveMethod = () => {
  if (el.receiveStore.checked) {
    el.storeBox.classList.remove("hidden");
    el.deliveryBox.classList.add("hidden");
  } else {
    el.storeBox.classList.add("hidden");
    el.deliveryBox.classList.remove("hidden");
  }
};

/* ================= VALIDATE FORM THANH TOÁN ================= */
const validateForm = () => {
  let isValid = true;

  /* Xóa lỗi cũ */
  [
    "fullName",
    "phone",
    "email",
    "address",
    "province",
    "district"
  ].forEach(hideError);

  /* Họ tên */
  if (el.fullName.value.trim() === "") {
    showError("fullName", "Không được để trống");
    isValid = false;
  }

  /* Số điện thoại */
  if (el.phone.value.trim() === "") {
    showError("phone", "Không được để trống");
    isValid = false;
  } else if (!phoneRegex.test(el.phone.value.trim())) {
    showError("phone", "Số điện thoại không đúng định dạng");
    isValid = false;
  }

  /* Email */
  if (el.email.value.trim() === "") {
    showError("email", "Không được để trống");
    isValid = false;
  } else if (!emailRegex.test(el.email.value.trim())) {
    showError("email", "Email sai định dạng");
    isValid = false;
  }

  /* Địa chỉ nếu chọn giao hàng tận nơi */
  if (el.receiveDelivery.checked) {
    if (el.provinceSelect.value === "") {
      showError("province", "Vui lòng chọn tỉnh/thành phố");
      isValid = false;
    }

    if (el.districtSelect.value === "") {
      showError("district", "Vui lòng chọn quận/huyện");
      isValid = false;
    }

    if (el.addressInput.value.trim() === "") {
      showError("address", "Không được để trống");
      isValid = false;
    }
  }

  /* Kiểm tra có sản phẩm thanh toán không */
  if (checkoutItems.length === 0) {
    alert("Không có sản phẩm để đặt hàng");
    isValid = false;
  }

  return isValid;
};

/* ================= KIỂM TRA TỒN KHO ================= */
const kiemTraTonKho = async () => {
  const response = await fetch(API);
  const products = await response.json();

  for (let item of checkoutItems) {
    const product = products.find((p) => p.id == item.id);

    if (!product) {
      alert(`Không tìm thấy sản phẩm ${item.name}!`);
      return false;
    }

    const quantity = getQuantity(product);
    const orderQuantity = Number(item.soLuong || 1);

    if (orderQuantity > quantity) {
      alert(`Sản phẩm: ${item.name} ko đủ số lượng!`);
      return false;
    }
  }

  return true;
};

/* ================= SUBMIT ĐƠN HÀNG ================= */
const submitOrder = async () => {

  /* Validate form */
  if (!validateForm()) return;

  /* Kiểm tra tồn kho */
  const isEnoughStock = await kiemTraTonKho();

  if (!isEnoughStock) {
    return;
  }

  /* Tính tổng tiền */
  const total = checkoutItems.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.soLuong || 1);
  }, 0);

  /* Tạo đơn hàng */
  const order = {
    id: createOrderId(),
    customer: {
      fullName: el.fullName.value.trim(),
      phone: el.phone.value.trim(),
      email: el.email.value.trim(),
      note: el.noteInput.value.trim() || "Không có"
    },
    receiveMethod: el.receiveStore.checked ? "Nhận tại cửa hàng" : "Giao hàng tận nơi",
    store: getElement("storeSelect")?.value || "",
    province: el.provinceSelect.value,
    district: el.districtSelect.value,
    address: el.addressInput.value.trim(),
    paymentMethod: selectElement("input[name='paymentMethod']:checked").value,
    note: el.noteInput.value.trim(),
    items: checkoutItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      img: getImageUrl(item.img),
      soLuong: item.soLuong || 1,

      selectedCapacity: item.selectedCapacity || "",
      selectedColor: item.selectedColor || "",

      giftName: item.giftName || "Không",
      giftImg: item.giftImg || "Không"
    })),
    total,
    status: "Đang xử lý",
    stockStatus: "Chưa trừ kho",
    createdAt: new Date().toLocaleString("vi-VN")
  };

  /* Lưu đơn hàng vào localStorage */
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  /* Nếu thanh toán từ giỏ hàng thì chỉ xóa các sản phẩm đã chọn */
  if (getParam("from") === "cart") {
    const username = localStorage.getItem("username") || "guest";
    const cartKey = `GIO_HANG_USER_${username}`;
    const selectedIds = JSON.parse(localStorage.getItem(SELECTED_CART_ITEMS_KEY)) || [];
    const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const nextCart = selectedIds.length
      ? currentCart.filter((item) => !selectedIds.includes(String(item.id)))
      : [];

    localStorage.setItem(cartKey, JSON.stringify(nextCart));
    localStorage.removeItem(SELECTED_CART_ITEMS_KEY);
  }

  alert("Đặt hàng thành công");

  window.location.href = "./order-check.html";
};

/* ================= KHỞI TẠO CHECKOUT ================= */
export const initCheckout = () => {

  if (!el.checkoutForm) return;

  renderProvinces();
  toggleReceiveMethod();
  loadCheckoutItems();

  el.provinceSelect.addEventListener("change", renderDistricts);
  el.receiveStore.addEventListener("change", toggleReceiveMethod);
  el.receiveDelivery.addEventListener("change", toggleReceiveMethod);

  el.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitOrder();
  });
};

/* ================= KHỞI CHẠY CHECKOUT ================= */
initCheckout();
