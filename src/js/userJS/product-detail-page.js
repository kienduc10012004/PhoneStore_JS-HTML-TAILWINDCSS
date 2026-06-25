/* ================= IMPORT MODULES ================= */
import { API, el, state, luuGioHang, capNhatSoLuongGioHang, productDetailUrl, isInPageUser, getElement, selectElements } from "./core.js";
import { bindPopupEvents } from "./popup-flow.js";
import { renderGioHang } from "./cart-flow.js";
import { formatCurrency, renderStars, showToast, getImageUrl, openRequireLoginPopup, initBackToTop } from "./ui-flow.js";
import { initWishlistPopup } from "./wishlist-popup.js";
import { renderProductReviews } from "./review-flow.js";

/* ================= LẤY SỐ LƯỢNG SẢN PHẨM ================= */
const getQuantity = (product) => {
  return Number(product.quantity ?? 10);
};

/* ================= THÊM SẢN PHẨM VÀO GIỎ HÀNG ================= */
window.themVaoGioHang = (id) => {

  /* Tìm sản phẩm theo id */
  const sp = state.danhSachSP.find(p => p.id == id);
  if (!sp) return;

  const quantity = getQuantity(sp);

  /* Kiểm tra sản phẩm hết hàng */
  if (quantity <= 0) {
    alert(`Sản phẩm ${sp.name} đã hết hàng!`);
    return;
  }

  const exist = state.gioHang.find(i => i.id == id);

  /* Nếu sản phẩm đã có trong giỏ */
  if (exist) {

    /* Kiểm tra vượt quá số lượng */
    if (exist.soLuong + 1 > quantity) {
      alert(`Sản phẩm: ${sp.name} ko đủ số lượng!`);
      return;
    }

    exist.soLuong++;
  }

  /* Nếu chưa có trong giỏ */
  else {
    state.gioHang.push({
      ...sp,
      soLuong: 1
    });
  }

  /* Lưu giỏ hàng */
  luuGioHang();

  /* Cập nhật badge giỏ hàng */
  capNhatSoLuongGioHang();

  /* Hiển thị toast */
  showToast(`Đã thêm ${sp.name} vào giỏ hàng`);
};


/* ================= RENDER CARD SẢN PHẨM LIÊN QUAN ================= */
const renderCard = (p) => {

  /* Lấy dữ liệu hiển thị */
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
        <span class="text-[11px] font-black text-blue-600 uppercase tracking-widest">
          ${p.type}
        </span>

        <h3 class="font-black text-slate-800 mt-1 line-clamp-2 min-h-12 group-hover:text-blue-600 transition-colors">
          ${p.name}
        </h3>

        <!-- Đánh giá -->
        <div class="flex items-center gap-2 my-3">
          <span class="text-amber-400 text-xs tracking-wider">
            ${renderStars(rating)}
          </span>

          <span class="text-xs text-slate-400 font-bold">
            ${rating}
          </span>
        </div>

        <!-- Giá tiền -->
        <p class="text-red-500 font-black text-xl">
          ${formatCurrency(p.price)}
        </p>

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
};

/* ================= LOAD CHI TIẾT SẢN PHẨM ================= */
const loadDetail = async () => {

  /* Khởi tạo popup */
  bindPopupEvents();

  /* Sự kiện mở giỏ hàng */
  getElement("btnGioHang")?.addEventListener("click", () => {
    renderGioHang();
  });

  /* Cập nhật badge giỏ hàng */
  capNhatSoLuongGioHang();

  /* Lấy id sản phẩm từ URL */
  const id = new URLSearchParams(location.search).get("id");

  /* Gọi API lấy sản phẩm */
  const res = await axios.get(API);

  state.danhSachSP = Array.isArray(res.data)
    ? res.data
    : [];

  /* Tìm sản phẩm */
  const sp =
    state.danhSachSP.find(p => p.id == id)
    || state.danhSachSP[0];

  if (!sp) return;

  /* Lấy dữ liệu hiển thị */
  const hasStoredReviews = Array.isArray(sp.reviews) && sp.reviews.length > 0;
  const rating = Number(sp.rating || 0) || (!hasStoredReviews && sp.defaultReviewInitialized !== true ? 5 : 0);
  const oldPrice = Number(sp.originalPrice || sp.price);
  const discount = Number(sp.discountPercent || 0);
  const installment = sp.hasInstallment && Number(sp.installmentPercent || 0) > 0
    ? Number(sp.installmentPercent)
    : 0;

  const quantity = getQuantity(sp);
  const isOutOfStock = quantity <= 0;

  const capacities = splitOptions(sp.capacity);
  const colors = splitOptions(sp.color);

  /* ================= RENDER CHI TIẾT SẢN PHẨM ================= */

  el.detailBox.innerHTML = `
    <section class="grid lg:grid-cols-2 gap-10 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm">

      <!-- Phần hình ảnh -->
      <div
        id="productImageZoomBox"
        class="relative flex items-center justify-center p-8 bg-slate-50 rounded-[2rem] overflow-hidden cursor-default"
      >
        ${
          discount > 0
            ? `
              <span class="absolute top-5 left-5 z-20 bg-red-500 text-white text-xs font-black px-4 py-2 rounded-full">
                -${discount}%
              </span>
            `
            : ""
        }

        <button
          type="button"
          id="btnZoomProductImage"
          class="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white text-slate-700 shadow-lg hover:bg-blue-600 hover:text-white duration-100 cursor-pointer"
        >
          <i class="fa-solid fa-magnifying-glass-plus"></i>
        </button>

        <img
          id="productZoomImage"
          src="${getImageUrl(sp.img)}"
          class="h-80 object-contain drop-shadow-2xl transition-transform duration-100"
        >

        <p
          id="selectedColorText"
          class="hidden absolute bottom-5 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full text-sm font-black text-slate-700 shadow z-20"
        ></p>
      </div>

      <!-- Phần thông tin sản phẩm -->
      <div>

        <!-- Loại sản phẩm -->
        <span class="inline-flex px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest">
          ${sp.type}
        </span>

        <!-- Tên sản phẩm -->
        <h1 class="mt-4 text-3xl font-black leading-tight md:text-5xl">
          ${sp.name}
        </h1> 

        

        <!-- Rating -->
        <div class="flex items-center gap-2 my-4">
          <span class="text-amber-400 tracking-widest">
            ${renderStars(rating)}
          </span>

          <b class="text-sm text-slate-500">
            ${rating}/5
          </b>

          <span class="text-slate-300">|</span>

          <b class="text-sm text-slate-500">
            Đã bán ${120 + Number(sp.id) * 7}
          </b>
        </div>

        <!-- Giá tiền -->
        <div class="p-5 mb-6 bg-slate-50 rounded-3xl">
          <p class="text-4xl font-black text-red-500">
            ${formatCurrency(sp.price)}
          </p>

          ${
            discount > 0 || installment > 0
              ? `
                <div class="flex gap-3 mt-2 flex-wrap">
                  ${discount > 0 ? `<span class="font-bold text-slate-400 line-through">${formatCurrency(oldPrice)}</span>` : ""}
                  ${discount > 0 ? `<span class="font-black text-emerald-600">Tiết kiệm ${formatCurrency(oldPrice - Number(sp.price))}</span>` : ""}
                  ${installment > 0 ? `<span class="font-black text-emerald-600">Trả góp ${installment}%</span>` : ""}
                </div>
              `
              : ""
          }
        </div>

        <!-- Thông số kỹ thuật -->
        <div class="mb-8 space-y-4 text-slate-600">
          <p><b>Màn hình:</b> ${sp.screen || "Đang cập nhật"}</p>
          <p><b>Camera trước:</b> ${sp.frontCamera || "Đang cập nhật"}</p>
          <p><b>Camera sau:</b> ${sp.backCamera || "Đang cập nhật"}</p>
          <p><b>Số lượng còn lại:</b> ${quantity}</p>
          <p class="leading-relaxed">
            <b>Mô tả:</b>
            ${sp.desc || "Sản phẩm chính hãng, phù hợp học tập, làm việc và giải trí."}
          </p>
          <div class="mb-6 space-y-5">
            <div>
              <p class="font-black mb-3">Dung lượng: </p>
              <div class="flex flex-wrap gap-3">
                ${capacities.map((capacity) => {
                    return `
                      <button
                        type="button"
                        onclick="selectProductOption(this, 'capacity')"
                        class="btnCapacity px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 font-black text-sm duration-100 cursor-pointer"
                      >
                        ${capacity}
                      </button>
                    `;
                  }).join("")
                }
                <button
                  type="button"
                  onclick="clearProductCapacity()"
                  class="px-5 py-3 rounded-2xl bg-slate-200 hover:bg-red-500 hover:text-white font-black text-sm duration-100 cursor-pointer"
                >
                  X
                </button>
              </div>
            </div>
            <p id="capacityError" class="hidden text-red-500 text-sm font-bold mt-2"></p>

            <div>
              <p class="font-black mb-3">Màu sắc: </p>
              <div class="flex flex-wrap gap-3">
                ${colors.map((color) => {
                    return `
                      <button
                        type="button"
                        onclick="selectProductOption(this, 'color')"
                        class="btnColor px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 font-black text-sm duration-100 cursor-pointer"
                      >
                        ${color}
                      </button>
                    `;
                  }).join("")
                }
                <button
                  type="button"
                  onclick="clearProductColor()"
                  class=" px-5 py-3 rounded-2xl bg-slate-200 hover:bg-red-500 hover:text-white font-black text-sm duration-100 cursor-pointer"
                >
                  X
                </button>
              </div>
            </div>
            <p id="colorError" class="hidden text-red-500 text-sm font-bold mt-2"></p>
          </div>
        </div>

        <!-- Quà tặng ưu đãi -->
        ${
          hasGift(sp)
            ? `
              <div class="flex items-center gap-4 mb-8 p-5 rounded-3xl bg-orange-50 border border-orange-100">
                <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0">
                  <img src="${getImageUrl(sp.giftImg)}" class="w-12 h-12 object-contain" alt="${sp.giftName}">
                </div>

                <div>
                  <p class="text-xs font-black text-orange-500 uppercase tracking-widest">
                    Quà tặng ưu đãi
                  </p>

                  <h3 class="text-lg font-black text-slate-800 mt-1">
                    ${sp.giftName}
                  </h3>

                  <p class="text-sm text-slate-500 font-bold mt-1">
                    Quà tặng đi kèm khi mua sản phẩm này.
                  </p>
                </div>
              </div>
            `
            : ""
        }

        <!-- Nút hành động -->
        ${
          isOutOfStock
            ? `
              <div class="py-4 rounded-2xl bg-slate-200 text-slate-500 text-center font-black cursor-not-allowed">
                HẾT HÀNG
              </div>
            `
            : `
              <div class="grid gap-3 sm:grid-cols-2">
                <button onclick="themVaoGioHangDetail('${sp.id}')" class="py-4 font-black duration-100 cursor-pointer text-white bg-slate-900 rounded-2xl hover:bg-blue-600">
                  THÊM GIỎ HÀNG
                </button>

                <button onclick="thanhToanDetail('${sp.id}')" class="flex items-center justify-center py-4 font-black text-white bg-blue-600 rounded-2xl hover:bg-slate-900 cursor-pointer">
                  THANH TOÁN
                </button    
              </div>
            `
        }
      </div>
    </section>
  `;
  initProductImageZoom();

  /* ================= RENDER SẢN PHẨM LIÊN QUAN ================= */

  const related = state.danhSachSP
    .filter(p => p.id != sp.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  el.relatedProducts.innerHTML =
    related.map(renderCard).join("");

  renderProductReviews(sp);
};

/* ========================= ZOOM ẢNH ===================================== */
const initProductImageZoom = () => {
  const zoomBox = getElement("productImageZoomBox");
  const zoomImage = getElement("productZoomImage");
  const btnZoom = getElement("btnZoomProductImage");

  if (!zoomBox || !zoomImage || !btnZoom) return;

  let isZooming = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let lastTranslateX = 0;
  let lastTranslateY = 0;
  const zoomScale = 2;

  zoomImage.style.userSelect = "none";

  /* Cập nhật vị trí ảnh khi kéo trong trạng thái zoom */
  const updateZoomTransform = () => {
    zoomImage.style.transform = isZooming
      ? `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`
      : "";
  };

  /* Giới hạn ảnh không bị kéo quá xa khỏi khung */
  const limitTranslate = (value, maxValue) => {
    return Math.max(-maxValue, Math.min(maxValue, value));
  };

  /* Lấy giới hạn kéo theo kích thước khung ảnh */
  const getDragLimit = () => {
    const rect = zoomBox.getBoundingClientRect();

    return {
      x: rect.width / 2,
      y: rect.height / 2,
    };
  };

  /* Reset ảnh về vị trí ban đầu */
  const resetZoomPosition = () => {
    isDragging = false;
    translateX = 0;
    translateY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    zoomImage.style.transformOrigin = "center center";
    updateZoomTransform();
  };

  /* Kết thúc thao tác kéo ảnh */
  const stopDragging = () => {
    isDragging = false;
    zoomBox.style.cursor = "grab";
    zoomBox.classList.remove("cursor-grabbing");
    zoomBox.classList.add("cursor-grab");
  };

  btnZoom.addEventListener("click", () => {
    isZooming = !isZooming;

    if (isZooming) {
      zoomBox.style.touchAction = "none";
      zoomBox.style.cursor = "grab";
      zoomBox.classList.remove("cursor-default");
      zoomBox.classList.add("cursor-grab");

      zoomImage.classList.remove("scale-[2]");
      updateZoomTransform();
    } else {
      zoomBox.style.touchAction = "";
      zoomBox.style.cursor = "default";
      zoomBox.classList.remove("cursor-grab", "cursor-grabbing");
      zoomBox.classList.add("cursor-default");

      zoomImage.classList.remove("scale-[2]");
      resetZoomPosition();
    }
  });

  zoomBox.addEventListener("pointerdown", (event) => {
    if (!isZooming) return;

    event.preventDefault();
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    lastTranslateX = translateX;
    lastTranslateY = translateY;

    zoomBox.setPointerCapture(event.pointerId);
    zoomBox.style.cursor = "grabbing";
    zoomBox.classList.remove("cursor-grab");
    zoomBox.classList.add("cursor-grabbing");
  });

  zoomBox.addEventListener("pointermove", (event) => {
    if (!isZooming || !isDragging) return;

    const limit = getDragLimit();
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    translateX = limitTranslate(lastTranslateX + deltaX, limit.x);
    translateY = limitTranslate(lastTranslateY + deltaY, limit.y);

    updateZoomTransform();
  });

  zoomBox.addEventListener("pointerup", (event) => {
    if (!isDragging) return;

    zoomBox.releasePointerCapture(event.pointerId);
    stopDragging();
  });

  zoomBox.addEventListener("pointercancel", (event) => {
    if (!isDragging) return;

    zoomBox.releasePointerCapture(event.pointerId);
    stopDragging();
  });

  zoomBox.addEventListener("mouseleave", () => {
    if (!isZooming || !isDragging) return;

    stopDragging();
  });
};




/* ================= KIỂM TRA QUÀ TẶNG ƯU ĐÃI ================= */
const hasGift = (product) => {
  return (
    product.giftName &&
    product.giftImg &&
    product.giftName.trim().toLowerCase() !== "không" &&
    product.giftImg.trim().toLowerCase() !== "không"
  );
};



/* ============================ ... ========================== */ 
let selectedCapacity = "";
let selectedColor = "";

/* ====================== THÊM VÀO GIỎ VÀ THANH TOÁN ============================== */
window.themVaoGioHangDetail = (id) => {
  if (!validateProductOption()) return;

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {
    openRequireLoginPopup();
    return;
  }

  const sp = state.danhSachSP.find((p) => p.id == id);
  if (!sp) return;

  const cartId = `${sp.id}_${selectedCapacity}_${selectedColor}`;

  const exist = state.gioHang.find((item) => item.cartId === cartId);

  if (exist) {
    exist.soLuong++;
  } else {
    state.gioHang.push({
      ...sp,
      cartId,
      soLuong: 1,
      selectedCapacity,
      selectedColor
    });
  }

  luuGioHang();
  capNhatSoLuongGioHang();
  showToast(`Đã thêm ${sp.name} vào giỏ hàng`);
};

window.thanhToanDetail = (id) => {
  if (!validateProductOption()) return;

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {
    openRequireLoginPopup();
    return;
  }

  window.location.href =
    `./checkout.html?id=${id}&capacity=${encodeURIComponent(selectedCapacity)}&color=${encodeURIComponent(selectedColor)}`;
};

/* =================== CHỌN MÀU VÀ DUNG LƯƠNG CHO SẢN PHẨM ============================= */
/* NGẮT CHUỖI */
const splitOptions = (value) => {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};


/* HIỂN THỊ TÊN MÀU SẮC DƯỚI ẢNH(TƯỢNG TRƯNG CHO VIỆC THAY ĐỔI ẢNH THEO MÀU) */
window.selectProductColor = (color) => {
  const selectedColorText = getElement("selectedColorText");

  if (!selectedColorText) return;

  selectedColorText.textContent = `Màu sắc: ${color}`;
  selectedColorText.classList.remove("hidden");
};


/* CHỌN OPTION DUNG LƯƠNG VÀ MÀU SẮC SẢN PHẨM */
  window.selectProductOption = (button, type) => {
  const selector = type === "capacity" ? ".btnCapacity" : ".btnColor";

  selectElements(selector).forEach((btn) => {
    btn.classList.remove("bg-blue-50", "text-blue-500", "border-blue-300");
    btn.classList.remove("bg-orange-50", "text-orange-500", "border-orange-200");
    btn.classList.add("bg-white", "border-slate-200");
  });

  if (type === "capacity") {
    selectedCapacity = button.textContent.trim();

    button.classList.remove("bg-white", "border-slate-200");
    button.classList.add("bg-blue-50", "text-blue-500", "border-blue-300");

    getElement("capacityError")?.classList.add("hidden");
  }

  if (type === "color") {
    selectedColor = button.textContent.trim();

    button.classList.remove("bg-white", "border-slate-200");
    button.classList.add("bg-orange-50", "text-orange-500", "border-orange-200");

    const selectedColorText = getElement("selectedColorText");

    if (selectedColorText) {
      selectedColorText.textContent = `Màu sắc: ${selectedColor}`;
      selectedColorText.classList.remove("hidden");
    }

    getElement("colorError")?.classList.add("hidden");
  }
};

/* ===================== HÀM BẮT LỖI RÀNG BUỘC   ===================== */

const validateProductOption = () => {
  let isValid = true;

  const capacityError = getElement("capacityError");
  const colorError = getElement("colorError");

  if (!selectedCapacity) {
    capacityError.textContent = "Vui lòng chọn dung lượng!";
    capacityError.classList.remove("hidden");
    isValid = false;
  }

  if (!selectedColor) {
    colorError.textContent = "Vui lòng chọn màu sắc!";
    colorError.classList.remove("hidden");
    isValid = false;
  }

  return isValid;
};


/* XÓA OPTION MÀU SẮC */
window.clearProductColor = () => {
  selectedColor = "";

  selectElements(".btnColor").forEach((btn) => {
    btn.classList.remove("bg-orange-500", "text-orange-500", "border-orange-500");
    btn.classList.add("bg-white", "border-slate-200");
  });

  const selectedColorText = getElement("selectedColorText");

  if (selectedColorText) {
    selectedColorText.textContent = "";
    selectedColorText.classList.add("hidden");
  }
};

/* XÓA OPTION DUNG LƯỢNG */
window.clearProductCapacity = () => {
  selectedCapacity = "";

  selectElements(".btnCapacity").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-blue-500", "border-blue-600");
    btn.classList.add("bg-white", "border-slate-200");
  });
};




/* ================= KHỞI CHẠY TRANG ================= */
loadDetail();
initWishlistPopup();
initBackToTop();
