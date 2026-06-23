/* ================= IMPORT MODULES ================= */
import { API, el, state, luuGioHang, capNhatSoLuongGioHang, productDetailUrl, isInPageUser, getElement, selectElements, createElement } from "./core.js";
import { formatCurrency, renderStars, showToast, getImageUrl, openRequireLoginPopup } from "./ui-flow.js";

/* ================= LẤY SỐ LƯỢNG SẢN PHẨM ================= */
const getQuantity = (product) => {
  return Number(product.quantity ?? 10);
};

/* ================= RENDER DANH SÁCH SẢN PHẨM ================= */
export const renderDanhSachSP = (list) => {
  if (!el.danhSachSP) return;

  /* Lưu danh sách đang hiển thị */
  state.activeList = [...list];

  /* Xử lý phân trang */
  const totalPages = Math.ceil(list.length / state.itemsPerPage);
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const currentItems = list.slice(start, start + state.itemsPerPage);

  /* Cập nhật label số lượng sản phẩm */
  if (el.productCountLabel) el.productCountLabel.textContent = `Hiển thị ${currentItems.length}/${list.length} sản phẩm`;

  /* Trường hợp không tìm thấy sản phẩm */
  if (!list.length) {
    el.danhSachSP.innerHTML = `
    <div class="col-span-full py-20 text-center bg-white rounded-[2rem] border">
      <h3 class="text-xl font-black">Không tìm thấy sản phẩm</h3>
      <p class="text-slate-400 mt-2">Hãy thử từ khóa khác.</p>
    </div>`;
    renderPagination(0); return;
  }

  /* Render từng card sản phẩm */
  el.danhSachSP.innerHTML = currentItems.map(p => {
    const hasStoredReviews = Array.isArray(p.reviews) && p.reviews.length > 0;
    const rating = Number(p.rating || 0) || (!hasStoredReviews && p.defaultReviewInitialized !== true ? 5 : 0);
    const oldPrice = Number(p.originalPrice || p.price);
    const discount = Number(p.discountPercent || 0);
    const installment = p.hasInstallment && Number(p.installmentPercent || 0) > 0
      ? Number(p.installmentPercent)
      : 0;
    const isWish = state.wishlist.includes(String(p.id));
    const quantity = getQuantity(p);
    const isOutOfStock = quantity <= 0;

    /* Kiểm tra sản phẩm có quà tặng hay không */
    const hasGift = p.giftName && p.giftImg && String(p.giftName).trim().toLowerCase() !== "không" &&
    String(p.giftImg).trim().toLowerCase() !== "không";

    return `
      <div class="group bg-white rounded-[2rem] p-5 border border-slate-200 border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 relative overflow-hidden">
        <!-- Link bọc toàn bộ thẻ -->
        <a href="${productDetailUrl(p.id)}" class="block">
          
          <!-- Badge giảm giá -->
          ${
            discount > 0
              ? `
                <div class="absolute top-4 left-4 z-10 bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full">
                  -${discount}%
                </div>
              `
              : ""
          }

          <!-- Hình ảnh sản phẩm -->
          <div class="bg-slate-50 rounded-[1.5rem] p-6 mb-5 flex justify-center overflow-hidden h-56">
            <img src="${getImageUrl(p.img)}" class="h-44 object-contain group-hover:scale-110 transition-all duration-500 drop-shadow-xl" alt="${p.name}">
          </div>

          <!-- Thông tin sản phẩm -->
          <span class="text-[11px] font-black text-blue-600 uppercase tracking-widest">${p.type}</span>
          <h3 class="font-black text-slate-800 mt-1 line-clamp-2 min-h-12 group-hover:text-blue-600 transition-colors">
            ${p.name}
          </h3>

          <!-- Đánh giá -->
          <div class="flex items-center gap-2 my-3">
            <span class="text-amber-400 text-xs tracking-wider">${renderStars(rating)}</span>
            <span class="text-xs text-slate-400 font-bold">${rating}</span>
            ${
              hasGift
                ? `
                  <!-- Gift Section -->
                      <p class="shadow shadow-orange-400 p-1 rounded-lg text-[8px] hover:bg-orange-50 duration-100 font-black text-orange-500 uppercase">
                        Có quà tặng
                      </p>
                `
                : ""
            }
          </div>

          <!-- Giá tiền -->
          <p class="text-red-500 font-black text-xl">${formatCurrency(p.price)}</p>
          <div class="flex items-center gap-2 mt-1">
            ${discount > 0 ? `<p class="text-slate-400 line-through text-sm font-bold">${formatCurrency(oldPrice)}</p>` : ""}
            ${installment > 0 ? `<p class="text-emerald-600 text-xs font-black">Trả góp ${installment}%</p>` : ""}
          </div>
        </a>

        <!-- Nút Wishlist -->
        <button 
          onclick="event.stopPropagation(); toggleWishlist('${p.id}')" 
          class="cursor-pointer absolute top-4 right-4 z-10 w-10 h-10 rounded-full ${isWish ? "bg-rose-500 text-white" : "bg-white text-slate-400"} hover:bg-rose-500 hover:text-white shadow-md font-black transition"
        >
          <i class="fa-solid fa-heart text-sm"></i>
        </button>

        <!-- Nút hành động -->
        ${
          isOutOfStock
            ? `
              <div class="mt-4 py-3 rounded-2xl bg-slate-200 text-slate-500 text-center text-xs font-black cursor-not-allowed">
                HẾT HÀNG
              </div>
            `
            : `
              <div class="grid grid-cols-2 gap-2 mt-4">
                <button onclick="openProductOptionPopup('${p.id}', 'buy')" class="text-center bg-slate-100 cursor-pointer text-slate-700 font-black py-3 rounded-2xl text-xs hover:bg-slate-200">
                  Mua
                </button>
                <button onclick="openProductOptionPopup('${p.id}', 'cart')" class="bg-blue-600 text-white cursor-pointer font-black py-3 rounded-2xl text-xs hover:bg-blue-700 shadow-lg shadow-blue-100">
                  Thêm giỏ
                </button>
              </div>
            `
        }
      </div>
    `;
  }).join("");

  /* Render phân trang */
  renderPagination(totalPages);
};

/* ================= RENDER PHÂN TRANG ================= */
const renderPagination = (total) => {
  let box = getElement("pagination");

  /* Nếu chưa có box pagination thì tạo mới */
  if (!box && el.danhSachSP) { box = createElement("div"); box.id = "pagination"; box.className = "flex justify-center gap-2 mt-12 flex-wrap"; el.danhSachSP.after(box); }

  if (!box) return;

  /* Nếu chỉ có 1 trang thì ẩn pagination */
  if (total <= 1) { box.innerHTML = ""; return; }

  /* Render các nút phân trang */
  box.innerHTML = Array.from({ length: total }, (_, i) => `<button onclick="changePage(${i + 1})" class="w-11 h-11 rounded-2xl font-black transition-all cursor-pointer ${i + 1 === state.currentPage ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"}">${i + 1}</button>`).join("");
};

/* ================= CHUYỂN TRANG SẢN PHẨM ================= */
window.changePage = (p) => { state.currentPage = p; renderDanhSachSP(state.activeList); getElement("san-pham")?.scrollIntoView({ behavior: "smooth" }); };

/* ================= LẤY DANH SÁCH SẢN PHẨM TỪ API ================= */
export const layDanhSachSP = async () => {

  /* Hiện loading */
  el.loading?.classList.remove("hidden");

  /* Xóa nội dung cũ */
  if (el.danhSachSP) el.danhSachSP.innerHTML = "";

  try {

    /* Gọi API lấy danh sách sản phẩm */
    const res = await axios.get(API);

    state.danhSachSP = Array.isArray(res.data) ? res.data : [];
    state.activeList = [...state.danhSachSP];

    /* Render sản phẩm */
    renderDanhSachSP(state.danhSachSP);

    /* Cập nhật badge giỏ hàng */
    capNhatSoLuongGioHang();

  } catch (e) {

    /* Hiển thị lỗi nếu gọi API thất bại */
    if (el.danhSachSP) el.danhSachSP.innerHTML = `<div class="col-span-full py-20 text-center text-red-500 font-black">Lỗi kết nối API!</div>`;

  } finally {

    /* Ẩn loading */
    el.loading?.classList.add("hidden");
  }
};

let selectedPopupProduct = null;
let selectedPopupAction = "buy";
let popupQuantity = 1;
let selectedPopupCapacity = "";
let selectedPopupColor = "";

const splitOptions = (value) => {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const resetPopupOption = () => {
  popupQuantity = 1;
  selectedPopupCapacity = "";
  selectedPopupColor = "";
};

const validatePopupOption = () => {
  let isValid = true;

  const capacityError = getElement("popupCapacityError");
  const colorError = getElement("popupColorError");

  if (!selectedPopupCapacity) {
    capacityError.textContent = "Vui lòng chọn dung lượng!";
    capacityError.classList.remove("hidden");
    isValid = false;
  }

  if (!selectedPopupColor) {
    colorError.textContent = "Vui lòng chọn màu sắc!";
    colorError.classList.remove("hidden");
    isValid = false;
  }

  return isValid;
};

window.selectPopupOption = (button, type) => {
  const selector = type === "capacity" ? ".popupCapacityBtn" : ".popupColorBtn";

  selectElements(selector).forEach((btn) => {
    btn.classList.remove("bg-blue-50", "text-blue-600", "border-blue-300");
    btn.classList.remove("bg-orange-50", "text-orange-600", "border-orange-300");
    btn.classList.add("bg-white", "border-slate-200");
  });

  if (type === "capacity") {
    selectedPopupCapacity = button.textContent.trim();
    button.classList.remove("bg-white", "border-slate-200");
    button.classList.add("bg-blue-50", "text-blue-600", "border-blue-300");
    getElement("popupCapacityError")?.classList.add("hidden");
  }

  if (type === "color") {
    selectedPopupColor = button.textContent.trim();
    button.classList.remove("bg-white", "border-slate-200");
    button.classList.add("bg-orange-50", "text-orange-600", "border-orange-300");
    getElement("popupColorError")?.classList.add("hidden");
  }
};

window.tangSoLuongPopup = () => {
  const quantity = getQuantity(selectedPopupProduct);

  if (popupQuantity + 1 > quantity) {
    alert(`Sản phẩm: ${selectedPopupProduct.name} ko đủ số lượng!`);
    return;
  }

  popupQuantity++;
  renderProductOptionPopup();
};

window.giamSoLuongPopup = () => {
  if (popupQuantity <= 1) return;

  popupQuantity--;
  renderProductOptionPopup();
};

const closeProductOptionPopup = () => {
  el.productOptionPopup?.classList.add("hidden");
};


/* ===================== RENDER POPUP MUA HÀNG ====================== */
 export const renderProductOptionPopup = () => {
  if (!selectedPopupProduct || !el.productOptionContent) return;

  const p = selectedPopupProduct;
  const capacities = splitOptions(p.capacity);
  const colors = splitOptions(p.color);
  const quantity = getQuantity(p);
  const oldPrice = Number(p.originalPrice || p.price);
  const discount = Number(p.discountPercent || 0);
  const installment = p.hasInstallment && Number(p.installmentPercent || 0) > 0
    ? Number(p.installmentPercent)
    : 0;

  const hasGift =
    p.giftName &&
    p.giftImg &&
    String(p.giftName).trim().toLowerCase() !== "không" &&
    String(p.giftImg).trim().toLowerCase() !== "không";


  el.productOptionTitle.textContent = selectedPopupAction === "buy" ? "Mua hàng" : "Thêm giỏ hàng";

  el.productOptionContent.innerHTML = `
    <div class="flex gap-4 items-center border-b pb-4">
      <img src="${getImageUrl(p.img)}" class="w-24 h-24 object-contain bg-slate-50 rounded-2xl" />

      <div>
        <h3 class="font-black text-lg">${p.name}</h3>
        <p class="text-red-500 font-black">${formatCurrency(p.price)}</p>
        ${
          discount > 0 || installment > 0
            ? `
              <div class="flex items-center gap-2 flex-wrap mt-1">
                ${discount > 0 ? `<span class="text-xs font-bold text-slate-400 line-through">${formatCurrency(oldPrice)}</span>` : ""}
                ${discount > 0 ? `<span class="text-xs font-black text-red-500">-${discount}%</span>` : ""}
                ${installment > 0 ? `<span class="text-xs font-black text-emerald-600">Trả góp ${installment}%</span>` : ""}
              </div>
            `
            : ""
        }
        <p class="text-sm text-slate-400 font-bold">Còn lại: ${quantity}</p>
      </div>
    </div>

    <div class="mt-5">
      ${hasGift
        ? `
          <div class="flex items-center justify-center md:justify-start gap-3 p-3 mt-3 w-[60%] bg-orange-100 border border-orange-100 rounded-2xl">
            <div class="flex gap-2 items-center">
              <div class="flex flex-col gap-2">
                <p class=" md:hidden text-[11px] font-black text-orange-500 uppercase">
                  Quà tặng
                </p>
                <img src="${getImageUrl(p.giftImg)}" class="w-12 h-12 object-contain">
              </div>
              <div class="hidden md:block"> 
                <p class="text-[11px] font-black text-orange-500 uppercase">
                  Quà tặng
                </p>
                <p class="text-sm font-black">
                  ${p.giftName}
                </p>
              </div>          
            </div>
          </div>`
        : ""
      }
      <p class="font-black mb-3">Số lượng</p>

      <div class="flex items-center gap-3">
        <button
          onclick="giamSoLuongPopup()"
          ${popupQuantity <= 1 ? "disabled" : ""}
          class="w-10 h-10 rounded-xl font-black ${popupQuantity <= 1 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white cursor-pointer"}"
        >
          -
        </button>

        <input
          value="${popupQuantity}"
          readonly
          class="w-16 text-center border rounded-xl py-2 font-black"
        />

        <button
          onclick="tangSoLuongPopup()"
          class="w-10 h-10 rounded-xl bg-blue-600 text-white font-black cursor-pointer"
        >
          +
        </button>
      </div>
    </div>

    <div class="mt-5">
      <p class="font-black mb-3">Dung lượng</p>

      <div class="flex flex-wrap gap-3">
        ${capacities.map((capacity) => `
          <button
            type="button"
            onclick="selectPopupOption(this, 'capacity')"
            class="popupCapacityBtn px-4 py-2 rounded-2xl border border-slate-200 bg-white font-black text-sm cursor-pointer"
          >
            ${capacity}
          </button>
        `).join("")}
      </div>

      <p id="popupCapacityError" class="hidden text-red-500 text-sm font-bold mt-2"></p>
    </div>

    <div class="mt-5">
      <p class="font-black mb-3">Màu sắc</p>

      <div class="flex flex-wrap gap-3">
        ${colors.map((color) => `
          <button
            type="button"
            onclick="selectPopupOption(this, 'color')"
            class="popupColorBtn px-4 py-2 rounded-2xl border border-slate-200 bg-white font-black text-sm cursor-pointer"
          >
            ${color}
          </button>
        `).join("")}
      </div>

      <p id="popupColorError" class="hidden text-red-500 text-sm font-bold mt-2"></p>
    </div>

    <button
      onclick="submitProductOptionPopup()"
      class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black cursor-pointer"
    >
      ${selectedPopupAction === "buy" ? "THANH TOÁN" : "THÊM GIỎ HÀNG"}
    </button>
  `;
};

/* ============================ MỎ POPUP ======================== */
window.openProductOptionPopup = (id, action) => {
  const product = state.danhSachSP.find((item) => item.id == id);

  if (!product) return;

  selectedPopupProduct = product;
  selectedPopupAction = action;
  resetPopupOption();

  el.productOptionPopup?.classList.remove("hidden");
  renderProductOptionPopup();
};

/* ========================= SUBMIT MUA HÀNG =============================== */
window.submitProductOptionPopup = () => {
 if (!validatePopupOption()) return;

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {
    openRequireLoginPopup();
    return;
  }

  const p = selectedPopupProduct;
  const cartId = `${p.id}_${selectedPopupCapacity}_${selectedPopupColor}`;

  if (selectedPopupAction === "buy") {
    window.location.href =
      `${isInPageUser() ? "./checkout.html" : "./page-user/checkout.html"}?id=${p.id}&quantity=${popupQuantity}&capacity=${encodeURIComponent(selectedPopupCapacity)}&color=${encodeURIComponent(selectedPopupColor)}`;
    return;
  }

  const exist = state.gioHang.find((item) => item.cartId === cartId);

  if (exist) {
    if (exist.soLuong + popupQuantity > getQuantity(p)) {
    alert(`Sản phẩm: ${p.name} ko đủ số lượng!`);
    return;
  }

  exist.soLuong += popupQuantity;
  } else {
    state.gioHang.push({
      ...p,
      cartId,
      soLuong: popupQuantity,
      selectedCapacity: selectedPopupCapacity,
      selectedColor: selectedPopupColor
    });
  }

  luuGioHang();
  capNhatSoLuongGioHang();
  closeProductOptionPopup();
  showToast(`Đã thêm ${p.name} vào giỏ hàng`);
};

/* ======================= ĐÓNG POPUP MUA HÀNG ======================= */
el.productOptionOverlay?.addEventListener("click", closeProductOptionPopup);
el.btnCloseProductOptionPopup?.addEventListener("click", closeProductOptionPopup);
