/* ================= IMPORT MODULES ================= */
import { API, el, state, luuGioHang, capNhatSoLuongGioHang, checkoutUrl, productDetailUrl, getElement, pageBody } from "./core.js";
import { formatCurrency, showToast, getImageUrl } from "./ui-flow.js";
import { showAppConfirm } from "../shared-dialog.js";

const SELECTED_CART_ITEMS_KEY = "KP_CHECKOUT_SELECTED_CART_ITEMS";
let selectedCartIds = new Set();

const getCartItemKey = (item) => {
  return String(item.cartId || item.id);
};

/* ================= MỞ POPUP GIỎ HÀNG ================= */
const openCart = () => {
  if (el.popupGioHang) {
    el.popupGioHang.classList.remove("hidden");
    pageBody.classList.add("overflow-hidden");
  }
};

/* ================= LẤY SỐ LƯỢNG SẢN PHẨM ================= */
const getQuantity = (product) => {
  return Number(product.quantity ?? 10);
};

/* ================= TẠO URL THANH TOÁN GIỎ HÀNG ================= */
const getCheckoutCartUrl = () => {
  const url = checkoutUrl();

  if (url.includes("?")) {
    return `${url}&from=cart`;
  }

  return `${url}?from=cart`;
};

const getSelectedCartItems = () => {
  return state.gioHang.filter((item) => selectedCartIds.has(getCartItemKey(item)));
};

const syncSelectedCartIds = () => {
  selectedCartIds = new Set(
    [...selectedCartIds].filter((id) => {
      return state.gioHang.some((item) => getCartItemKey(item) === String(id));
    })
  );
};

const saveSelectedCartIdsForCheckout = () => {
  localStorage.setItem(SELECTED_CART_ITEMS_KEY, JSON.stringify([...selectedCartIds]));
};

window.toggleCartItemSelected = (id) => {
  const value = String(id);

  if (selectedCartIds.has(value)) {
    selectedCartIds.delete(value);
  } else {
    selectedCartIds.add(value);
  }

  renderGioHang(false);
};

window.toggleAllCartItems = (checked) => {
  selectedCartIds = checked
    ? new Set(state.gioHang.map((item) => getCartItemKey(item)))
    : new Set();

  renderGioHang(false);
};

window.xoaSanPhamDaChon = async () => {
  if (selectedCartIds.size === 0) {
    alert("Vui lòng tick chọn sản phẩm cần xóa.");
    return;
  }

  const isConfirm = await showAppConfirm({
    title: "Xóa sản phẩm đã chọn",
    message: "Bạn có chắc muốn xóa các sản phẩm đã chọn khỏi giỏ hàng?",
    confirmText: "Xóa",
  });
  if (!isConfirm) return;

  state.gioHang = state.gioHang.filter((item) => !selectedCartIds.has(getCartItemKey(item)));
  selectedCartIds.clear();

  luuGioHang();
  capNhatSoLuongGioHang();
  renderGioHang(false);
};

window.goToCartProductDetail = (id) => {
  window.location.href = productDetailUrl(id);
};

/* ================= TĂNG SỐ LƯỢNG SẢN PHẨM ================= */
window.tangSoLuong = async (key) => {
  const item = state.gioHang.find(p => getCartItemKey(p) === String(key));
  if (!item) return;

  try {
    const response = await fetch(`${API}/${item.id}`);
    const product = await response.json();
    const quantity = getQuantity(product);

    /* Kiểm tra vượt quá tồn kho */
    if (item.soLuong + 1 > quantity) {
      alert(`Sản phẩm: ${item.name} ko đủ số lượng!`);
      return;
    }
    
    item.soLuong++;

    luuGioHang();
    capNhatSoLuongGioHang();
    renderGioHang(false);

  } catch (error) {
    alert("Không thể kiểm tra số lượng sản phẩm!");
  }
};

/* ================= GIẢM SỐ LƯỢNG SẢN PHẨM ================= */
window.giamSoLuong = (key) => {
  const item = state.gioHang.find(p => getCartItemKey(p) === String(key));

  if (!item || item.soLuong <= 1) {
    
    return;
  } 

  item.soLuong--;

  luuGioHang();
  capNhatSoLuongGioHang();
  renderGioHang(false);
};

/* ================= XÓA SẢN PHẨM KHỎI GIỎ HÀNG ================= */
window.xoaSanPham = async (key) => {
  const isConfirm = await showAppConfirm({
    title: "Xóa sản phẩm",
    message: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
    confirmText: "Xóa",
  });

  if (!isConfirm) return;

  const itemElement =
    getElement(`cart-item-${key}`);

  if (itemElement) {
    itemElement.classList.add("animate-cart-remove");
  }

  setTimeout(() => {
    state.gioHang = state.gioHang.filter((item) => {
      return getCartItemKey(item) !== String(key);
    });

    selectedCartIds.delete(String(key));
    
    luuGioHang();
    renderGioHang();
    capNhatSoLuongGioHang();
  }, 350);
};

/* ================= KIỂM TRA TỒN KHO VÀ THANH TOÁN ================= */
window.kiemTraTonKhoVaThanhToan = async () => {
  const selectedItems = getSelectedCartItems();

  /* Nếu giỏ hàng trống */
  if (!state.gioHang.length) {
    showToast("Giỏ hàng đang trống", "warning");
    return;
  }

  if (!selectedItems.length) {
    alert("Vui lòng chọn sản phẩm để thanh toán.");
    return;
  }

  try {
    const response = await fetch(API);
    const products = await response.json();

    /* Kiểm tra từng sản phẩm trong giỏ hàng */
    for (let item of selectedItems) {
      const product = products.find((p) => p.id == item.id);

      if (!product) {
        alert(`Không tìm thấy sản phẩm ${item.name}!`);
        return;
      }

      const quantity = getQuantity(product);

      if (item.soLuong > quantity) {
        alert(`Sản phẩm: ${item.name} ko đủ số lượng!`);
        return;
      }
    }

    saveSelectedCartIdsForCheckout();

    /* Chuyển sang trang checkout */
    window.location.href = getCheckoutCartUrl();

  } catch (error) {
    alert("Không thể kiểm tra số lượng sản phẩm!");
  }
};

/* ================= THANH TOÁN DEMO GIỎ HÀNG ================= */
window.thanhToanDemo = () => {
  if (!state.gioHang.length) return showToast("Giỏ hàng đang trống", "warning");

  state.gioHang = [];

  luuGioHang();
  capNhatSoLuongGioHang();
  renderGioHang(false);

  showToast("Đặt hàng demo thành công!");
};

/* ================= THANH TOÁN DEMO CHI TIẾT ================= */
window.thanhToanDemoDetail = () => {
  showToast("Đặt hàng demo thành công!");
};

/* ================= RENDER GIỎ HÀNG ================= */
export const renderGioHang = (shouldOpen = true) => {
  if (!el.noiDungGioHang) return;
  syncSelectedCartIds();

  /* ================= GIỎ HÀNG TRỐNG ================= */
  if (!state.gioHang.length) {
    el.noiDungGioHang.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center px-6">
        <div class="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl mb-5">
          <i class="fa-solid fa-cart-arrow-down"></i>
        </div>
        <h3 class="text-xl font-black text-slate-800">Giỏ hàng trống</h3>
        <p class="text-sm text-slate-400 mt-2 max-w-xs">Hãy thêm sản phẩm yêu thích vào giỏ hàng.</p>
      </div>
    `;

    if (shouldOpen) openCart();

    return;
  }

  /* ================= TÍNH TIỀN GIỎ HÀNG ================= */
  const selectedItems = getSelectedCartItems();
  const allSelected = state.gioHang.length > 0 && selectedItems.length === state.gioHang.length;
  const tamTinh = selectedItems.reduce((s, i) => s + Number(i.price) * i.soLuong, 0);
  const ship = tamTinh === 0 ? 0 : tamTinh >= 5000000 ? 0 : 30000;
  const tong = tamTinh + ship;

  /* ================= HIỂN THỊ SẢN PHẨM TRONG GIỎ ================= */
  el.noiDungGioHang.innerHTML = `
  <div class="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between gap-3">
    <label class="flex items-center gap-2 text-sm font-black text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        class="w-4 h-4 accent-blue-600"
        onchange="toggleAllCartItems(this.checked)"
        ${allSelected ? "checked" : ""}
      />
      Chọn tất cả
    </label>

    <button onclick="xoaSanPhamDaChon()" class="px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black duration-100">
      Xóa đã chọn
    </button>
  </div>

  <div class="${state.gioHang.length > 3 ? "max-h-[52vh] overflow-y-auto" : ""}">
  ${state.gioHang.map(item => {
    const itemKey = getCartItemKey(item);

    return `
  <div id="cart-item-${itemKey}" class="p-5 flex flex-col justify-center border-b border-slate-300 hover:bg-slate-50 duration-100">
    <div class="flex gap-4">
      <input
        type="checkbox"
        class="mt-12 w-4 h-4 accent-blue-600 shrink-0"
        onchange="toggleCartItemSelected('${itemKey}')"
        ${selectedCartIds.has(itemKey) ? "checked" : ""}
      />

      <div onclick="goToCartProductDetail('${item.id}')" class="w-20 h-20 md:w-30 md:h-30 rounded-2xl mt-10 bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 cursor-pointer">
        <img src="${getImageUrl(item.img)}" class="w-20 h-20 object-contain">
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex justify-between gap-3">
          <div class="min-w-0">
            <h4 onclick="goToCartProductDetail('${item.id}')" class="font-black text-sm text-slate-800 line-clamp-2 cursor-pointer hover:text-blue-600">
              ${item.name}
            </h4>

            <p class="text-blue-600 font-black text-sm mt-1">
              ${formatCurrency(item.price)}
            </p>
          </div>

          <button onclick="xoaSanPham('${itemKey}')" class="w-8 h-8 shrink-0 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black cursor-pointer duration-100">
            X
          </button>
        </div>

        <div class="flex flex-col gap-2 mt-3">
          <div class="flex flex-col md:flex-row gap-2 md:items-center">
            <span class="text-blue-600 hidden md:block text-[11px] font-black">Dung lượng:</span>
            <span class="px-3 py-1 rounded-full w-fit bg-blue-50 text-blue-600 text-[11px] font-black">
              ${item.selectedCapacity || "Chưa chọn"}
            </span>
          </div>
           
          <div class="flex flex-col md:flex-row gap-2 md:items-center">
            <span class="text-orange-500 hidden md:block text-[11px] font-black">Màu sắc:</span>
            <span class="px-3 py-1 rounded-full w-fit bg-orange-50 text-orange-500 text-[11px] font-black">
              ${item.selectedColor || "Chưa chọn"}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center bg-slate-100 rounded-2xl p-1">
            <button onclick="giamSoLuong('${itemKey}')" 
              ${item.soLuong <= 1 ? "disabled" : ""}
              class="w-8 h-8 bg-white text-slate-700 rounded-xl font-black cursor-pointer hover:bg-slate-900 hover:text-white duration-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700">
              -
            </button>

            <span class="w-10 text-center text-sm font-black">
              ${item.soLuong}
            </span>

            <button onclick="tangSoLuong('${itemKey}')" class="w-8 h-8 bg-blue-600 text-white rounded-xl font-black cursor-pointer hover:bg-blue-700 duration-100">
              +
            </button>
          </div>

          </div>
          <p class="text-sm mt-5 font-black text-slate-800">
            Giá: ${formatCurrency(Number(item.price) * Number(item.soLuong || 1))}
          </p>
      </div>
    </div>
  </div>
`;
  }).join("")}
  </div>
  <span class="mt-5 text-center block text-slate-400 font-bold text-sm">Không còn sản phẩm </span>
  <!-- Tổng thanh toán -->
  <div class="sticky bottom-0 bg-white border-t border-slate-100 p-6 shadow-[0_-20px_40px_rgba(15,23,42,0.08)]">
    <div class="space-y-3 text-sm mb-5">
      <div class="flex justify-between text-slate-500 font-bold">
        <span>Tạm tính</span>
        <span>${formatCurrency(tamTinh)}</span>
      </div>

      <div class="flex justify-between text-slate-500 font-bold">
        <span>Phí vận chuyển</span>
        <span>${ship ? formatCurrency(ship) : "Miễn phí"}</span>
      </div>

      <div class="h-px bg-slate-100"></div>

      <div class="flex justify-between items-center">
        <span class="font-black text-slate-800">Tổng thanh toán</span>
        <span class="text-2xl font-black text-blue-600">${formatCurrency(tong)}</span>
      </div>
    </div>

    <button onclick="kiemTraTonKhoVaThanhToan()" class="w-full cursor-pointer duration-100 bg-blue-600 text-white font-black py-4 px-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100">
      THANH TOÁN NGAY
    </button>
  </div>
`;

  /* ================= MỞ POPUP SAU KHI RENDER ================= */
  if (shouldOpen) openCart();
};
