import {
  getOrders,
  saveOrders,
  createOrderId,
  formatCurrency,
  getImageUrl
} from "./order-core.js";
import { provinceList, getDistrictsByProvince } from "./address-data.js";

const API = "https://69f8c3e5f7044aa0103e73e0.mockapi.io/api/v1/productphone";

const form = document.getElementById("checkoutForm");
const orderSummary = document.getElementById("orderSummary");
const fullName = document.getElementById("fullName");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const receiveStore = document.getElementById("receiveStore");
const receiveDelivery = document.getElementById("receiveDelivery");
const storeBox = document.getElementById("storeBox");
const deliveryBox = document.getElementById("deliveryBox");
const provinceSelect = document.getElementById("fselect_province");
const districtSelect = document.getElementById("fselect_district");
const addressInput = document.getElementById("address");
const noteInput = document.getElementById("note");

let checkoutItems = [];

const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getQuantity = (product) => {
  return Number(product.quantity ?? 10);
};

const showError = (id, message) => {
  const error = document.getElementById(`error-${id}`);
  if (error) {
    error.textContent = message;
    error.classList.remove("hidden");
  }
};

const hideError = (id) => {
  const error = document.getElementById(`error-${id}`);
  if (error) {
    error.textContent = "";
    error.classList.add("hidden");
  }
};

const getParam = (name) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};

const loadCheckoutItems = async () => {
  const productId = getParam("id");
  const fromCart = getParam("from") === "cart";

  if (fromCart) {
    const username = localStorage.getItem("username") || "guest";
  const cartKey = `GIO_HANG_USER_${username}`;

  checkoutItems = JSON.parse(localStorage.getItem(cartKey)) || [];
      renderOrderSummary();
      return;
  }

  if (productId) {
    const response = await fetch(`${API}/${productId}`);
    const product = await response.json();
    checkoutItems = [{ ...product, soLuong: 1 }];
    renderOrderSummary();
    return;
  }
  const username = localStorage.getItem("username") || "guest";
  const cartKey = `GIO_HANG_USER_${username}`;

  checkoutItems = JSON.parse(localStorage.getItem(cartKey)) || [];
    renderOrderSummary();
  };

const renderOrderSummary = () => {
  if (!orderSummary) return;

  if (checkoutItems.length === 0) {
    orderSummary.innerHTML = `
      <p class="text-center text-slate-400 font-bold py-10">
        Chưa có sản phẩm thanh toán
      </p>
    `;
    return;
  }

  const total = checkoutItems.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.soLuong || 1);
  }, 0);

  orderSummary.innerHTML = `
    ${checkoutItems.map((item) => {
      return `
        <div class="flex items-center gap-4 border-b py-4">
          <img src="${getImageUrl(item.img)}" class="w-16 h-16 object-contain bg-slate-50 rounded-xl" />
          <div class="flex-1">
            <h4 class="font-black">${item.name}</h4>
            <p class="text-sm text-slate-500">${formatCurrency(item.price)} x ${item.soLuong || 1}</p>
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

const renderProvinces = () => {
  provinceSelect.innerHTML = `<option value="">Tỉnh/thành phố</option>`;

  provinceList.forEach((province) => {
    provinceSelect.innerHTML += `<option value="${province.value}">${province.name}</option>`;
  });

  provinceSelect.value = "ho-chi-minh";
  renderDistricts();
};

const renderDistricts = () => {
  const districts = getDistrictsByProvince(provinceSelect.value);
  districtSelect.innerHTML = `<option value="">Chọn quận/huyện</option>`;

  districts.forEach((district) => {
    districtSelect.innerHTML += `<option value="${district.value}">${district.name}</option>`;
  });
};

const toggleReceiveMethod = () => {
  if (receiveStore.checked) {
    storeBox.classList.remove("hidden");
    deliveryBox.classList.add("hidden");
  } else {
    storeBox.classList.add("hidden");
    deliveryBox.classList.remove("hidden");
  }
};

const validateForm = () => {
  let isValid = true;

  ["fullName", "phone", "email", "address", "province", "district"].forEach(hideError);

  if (fullName.value.trim() === "") {
    showError("fullName", "Không được để trống");
    isValid = false;
  }

  if (phone.value.trim() === "") {
    showError("phone", "Không được để trống");
    isValid = false;
  } else if (!phoneRegex.test(phone.value.trim())) {
    showError("phone", "Số điện thoại không đúng định dạng");
    isValid = false;
  }

  if (email.value.trim() === "") {
    showError("email", "Không được để trống");
    isValid = false;
  } else if (!emailRegex.test(email.value.trim())) {
    showError("email", "Email sai định dạng");
    isValid = false;
  }

  if (receiveDelivery.checked) {
    if (provinceSelect.value === "") {
      showError("province", "Vui lòng chọn tỉnh/thành phố");
      isValid = false;
    }

    if (districtSelect.value === "") {
      showError("district", "Vui lòng chọn quận/huyện");
      isValid = false;
    }

    if (addressInput.value.trim() === "") {
      showError("address", "Không được để trống");
      isValid = false;
    }
  }

  if (checkoutItems.length === 0) {
    alert("Không có sản phẩm để đặt hàng");
    isValid = false;
  }

  return isValid;
};

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

const capNhatSoLuongSauKhiDatHang = async () => {
  const response = await fetch(API);
  const products = await response.json();

  for (let item of checkoutItems) {
    const product = products.find((p) => p.id == item.id);

    if (!product) continue;

    const currentQuantity = getQuantity(product);
    const orderQuantity = Number(item.soLuong || 1);
    const newQuantity = currentQuantity - orderQuantity;

    await fetch(`${API}/${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...product,
        quantity: newQuantity < 0 ? 0 : newQuantity
      })
    });
  }
};

const submitOrder = async () => {
  if (!validateForm()) return;

  const isEnoughStock = await kiemTraTonKho();

  if (!isEnoughStock) {
    return;
  }

  const total = checkoutItems.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.soLuong || 1);
  }, 0);

  const order = {
    id: createOrderId(),
    customer: {
      fullName: fullName.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      note: noteInput.value.trim() || "Không có"
    },
    receiveMethod: receiveStore.checked ? "Nhận tại cửa hàng" : "Giao hàng tận nơi",
    store: document.getElementById("storeSelect")?.value || "",
    province: provinceSelect.value,
    district: districtSelect.value,
    address: addressInput.value.trim(),
    paymentMethod: document.querySelector("input[name='paymentMethod']:checked").value,
    note: noteInput.value.trim(),
    items: checkoutItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      img: getImageUrl(item.img),
      soLuong: item.soLuong || 1
    })),
    total,
    status: "Chờ xác nhận đặt hàng",
    createdAt: new Date().toLocaleString("vi-VN")
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  await capNhatSoLuongSauKhiDatHang();

  if (getParam("from") === "cart") {
    const username = localStorage.getItem("username") || "guest";
    const cartKey = `GIO_HANG_USER_${username}`;
    localStorage.removeItem(cartKey);
  }

  alert("Đặt hàng thành công");
  window.location.href = "./order-check.html";
};

export const initCheckout = () => {
  if (!form) return;

  renderProvinces();
  toggleReceiveMethod();
  loadCheckoutItems();

  provinceSelect.addEventListener("change", renderDistricts);
  receiveStore.addEventListener("change", toggleReceiveMethod);
  receiveDelivery.addEventListener("change", toggleReceiveMethod);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitOrder();
  });
};

initCheckout();