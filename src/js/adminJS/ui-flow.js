/* ================= IMPORT MODULES ================= */
import { dom, state, formatCurrency, logOutAdmin, getBrands, saveBrands, isInPageAdmin, getElement, selectElements, createElement } from "./core.js";
import { showAppConfirm } from "../shared-dialog.js";

/* ======================= LẤY LINK ẢNH ========================= */
export const getImageUrl = (img) => {
  if (!img) {
    return "";
  }

  const value = String(img).trim();

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;

  const hasExtension = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(value);
  const imagePath = hasExtension ? value : `${value}.png`;
  const fileName = imagePath.split("/").pop();
  const prefix = isInPageAdmin() ? "../images/" : "./images/";
  return `${prefix}${fileName}`;
};

/* ================= HIỂN THỊ LỖI FORM ================= */
const setErrorMessage = (id, message) => {
  const errorElement = getElement(`error-${id}`);

  if (errorElement) {
    errorElement.innerText = message;
  }
};

/* ================= XÓA TOÀN BỘ LỖI FORM ================= */
export const clearErrors = () => {
  selectElements(".error-msg").forEach((item) => {
    item.innerText = "";
  });
};

/* ================= LẤY DỮ LIỆU TỪ FORM SẢN PHẨM ================= */
export const getProductDataFromForm = () => {
  const originalPrice = Number(dom.price.value.trim() || 0);
  const discountPercent = Number(dom.discountPercent?.value || 0);
  const hasInstallment = Boolean(dom.hasInstallment?.checked);
  const installmentPercent = hasInstallment
    ? Number(dom.installmentPercent?.value || 0)
    : 0;
  const finalPrice = discountPercent > 0
    ? Math.round(originalPrice * (100 - discountPercent) / 100)
    : originalPrice;

  return {
    name: dom.name.value.trim(),
    price: String(finalPrice),
    originalPrice: String(originalPrice),
    discountPercent: String(discountPercent),
    hasInstallment,
    installmentPercent: String(installmentPercent),
    quantity: dom.quantity.value.trim(),
    img: dom.img.value.trim(),
    giftName: dom.giftName.value.trim(),
    giftImg: dom.giftImg.value.trim(),
    screen: dom.screen.value.trim(),
    backCamera: dom.backCamera.value.trim(),
    frontCamera: dom.frontCamera.value.trim(),
    desc: dom.desc.value.trim(),
    type: dom.type.value.trim(),
    capacity: dom.capacity.value.trim(),
    color: dom.color.value.trim(),
  };
};

/* ================= VALIDATE FORM SẢN PHẨM ================= */
export const validateForm = () => {
  const data = getProductDataFromForm();
  let isValid = true;

  clearErrors();

  /* Kiểm tra trường rỗng */
  for (let key in data) {
    if (data[key] === "") {
      setErrorMessage(key, "Trường này không được để trống");
      isValid = false;
    }
  }

  /* Kiểm tra giá bán */
  if (data.price !== "" && Number(data.price) <= 0) {
    setErrorMessage("price", "Giá bán phải là số dương");
    isValid = false;
  }

  /* Kiểm tra số lượng */
  if (data.quantity !== "" && Number(data.quantity) < 0) {
    setErrorMessage("quantity", "Số lượng không được âm");
    isValid = false;
  }

  if (Number(data.discountPercent) < 0 || Number(data.discountPercent) > 100) {
    setErrorMessage("discountPercent", "Giảm giá phải từ 0 đến 100");
    isValid = false;
  }

  if (data.hasInstallment && Number(data.installmentPercent) <= 0) {
    setErrorMessage("installmentPercent", "Phần trăm trả góp phải lớn hơn 0");
    alert("Phần trăm trả góp phải lớn hơn 0");
    isValid = false;
  }

  return isValid;
};

/* ================= RESET FORM SẢN PHẨM ================= */
export const resetForm = () => {
  if (!dom.productForm) return;

  dom.productForm.reset();
  state.editingProduct = null;

  clearErrors();

  dom.installmentPercentBox?.classList.add("hidden");
  if (dom.installmentPercent) dom.installmentPercent.value = "";

  dom.btnSave.classList.remove("hidden");
  dom.btnUpdate.classList.add("hidden");
};

/* ================= THÊM HÃNG MỚI ================= */
export const addNewTypeOption = () => {
  if (!dom.newType || !dom.type) return;

  const newTypeValue = dom.newType.value.trim();

  /* Kiểm tra nhập tên hãng */
  if (newTypeValue === "") {
    alert("Vui lòng nhập tên hãng mới");
    return;
  }

  const brands = getBrands();

  /* Kiểm tra hãng đã tồn tại */
  const existed = brands.some((brand) => {
    return brand.toLowerCase() === newTypeValue.toLowerCase();
  });

  if (existed) {
    alert("Hãng này đã tồn tại");
    return;
  }

  /* Lưu hãng mới */
  brands.push(newTypeValue);
  saveBrands(brands);

  /* Render lại select hãng */
  renderBrandSelect();

  dom.type.value = newTypeValue;
  dom.newType.value = "";

  alert("Thêm hãng thành công");
};

/* ================= RENDER DANH SÁCH SẢN PHẨM ADMIN ================= */
export const renderDanhSachSP = (danhSachSP) => {
  if (!dom.productTableBody) return;

  /* Không tìm thấy sản phẩm */
  if (!danhSachSP || danhSachSP.length === 0) {
    dom.productTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-10 text-center text-slate-400 italic">
          Không tìm thấy sản phẩm
        </td>
      </tr>
    `;

    dom.paginationContainer.innerHTML = "";
    return;
  }

  /* Xử lý phân trang */
  const startIndex =
    (state.currentPage - 1) * state.itemsPerPage;

  const currentItems =
    danhSachSP.slice(
      startIndex,
      startIndex + state.itemsPerPage
    );

  /* Render bảng sản phẩm */
  dom.productTableBody.innerHTML = currentItems.map((phone) => {
    return `
      <tr class="hover:bg-slate-50 border-b border-slate-100 transition-all">
        <td class="py-4 px-6 text-slate-500 font-medium">${phone.id}</td>
        <td class="py-4 px-6 font-bold text-slate-800">${phone.name}</td>
        <td class="py-4 px-6 text-right text-emerald-600 font-bold whitespace-nowrap">${formatCurrency(phone.price)}</td>
        <td class="py-4 px-6 text-center font-bold">${phone.quantity || 0}</td>
        <td class="py-4 px-6">
          <span class="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold uppercase text-slate-600">
            ${phone.type}
          </span>
        </td>
        <td class="py-4 px-6 text-center">
          <div class="flex justify-center gap-2">
            <button class="bg-blue-500 duration-200 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 text-xs shadow-sm cursor-pointer" onclick="editProduct('${phone.id}')">
              Sửa
            </button>
            <button class="bg-rose-500 duration-200 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 text-xs shadow-sm cursor-pointer" onclick="deleteProduct('${phone.id}')">
              Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  renderPagination(danhSachSP.length);
};


/* ================= RENDER PHÂN TRANG ADMIN ================= */
const renderPagination = (totalItems) => {
  const totalPages = Math.ceil(totalItems / state.itemsPerPage);

  if (!dom.paginationContainer) return;

  if (totalPages <= 1) {
    dom.paginationContainer.innerHTML = "";
    return;
  }

  let buttons = "";

  for (let i = 1; i <= totalPages; i++) {
    const active = state.currentPage === i
      ? "bg-indigo-600 text-white shadow-md"
      : "bg-white border hover:bg-gray-300";

    buttons += `
      <button onclick="changePage(${i})" class="w-9 h-9 rounded-lg font-bold transition-all ${active} cursor-pointer">
        ${i}
      </button>
    `;
  }

  dom.paginationContainer.innerHTML = buttons;
};

/* ================= KHỞI TẠO CHUNG ADMIN ================= */
export const initAdminCommon = () => {
  if (dom.btnlogout) {
    dom.btnlogout.addEventListener("click", logOutAdmin);
  }
};

/* ================= BACK TO TOP ADMIN ================= */

/* Khởi tạo nút quay lại đầu trang admin */
export const initAdminBackToTop = () => {
  if (getElement("btnAdminBackToTop")) return;

  const btnBackToTop = createElement("button");

  btnBackToTop.id = "btnAdminBackToTop";
  btnBackToTop.type = "button";
  btnBackToTop.setAttribute("aria-label", "Quay lại đầu trang");
  btnBackToTop.className = "hidden fixed right-5 bottom-5 z-[60] w-12 h-12 rounded-full bg-blue-500/30 text-blue-700 border border-blue-500/30 shadow-lg backdrop-blur-md hover:bg-blue-500 hover:text-white duration-200 cursor-pointer";
  btnBackToTop.innerHTML = `<i class="fa-solid fa-caret-up"></i>`;

  document.body.appendChild(btnBackToTop);

  const toggleBackToTopButton = () => {
    if (window.scrollY > 300) {
      btnBackToTop.classList.remove("hidden");
      btnBackToTop.classList.add("flex", "items-center", "justify-center");
    }
    else {
      btnBackToTop.classList.add("hidden");
      btnBackToTop.classList.remove("flex", "items-center", "justify-center");
    }
  };

  btnBackToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  window.addEventListener("scroll", toggleBackToTopButton);

  toggleBackToTopButton();
};

/* ================= RENDER SELECT HÃNG ================= */
export const renderBrandSelect = () => {
  if (!dom.type) return;

  const brands = getBrands();

  dom.type.innerHTML = `
    <option value="">Chọn loại</option>
  `;

  brands.forEach((brand) => {
    dom.type.innerHTML += `
      <option value="${brand}">
        ${brand}
      </option>
    `;
  });
};

/* ================= XÓA HÃNG ================= */
export const deleteTypeOption = async () => {
  if (!dom.type) return;

  const selectedType = dom.type.value.trim();

  /* Kiểm tra đã chọn hãng chưa */
  if (selectedType === "") {
    alert("Vui lòng chọn hãng cần xóa");
    return;
  }

  /* Xác nhận xóa */
  const isConfirm = await showAppConfirm({
    title: "Xóa hãng",
    message: `Bạn có chắc muốn xóa hãng "${selectedType}" không?`,
    confirmText: "Xóa",
  });

  if (!isConfirm) return;

  const brands = getBrands();

  /* Lọc bỏ hãng cần xóa */
  const newBrands = brands.filter((brand) => {
    return brand.toLowerCase() !== selectedType.toLowerCase();
  });

  saveBrands(newBrands);
  renderBrandSelect();
  dom.type.value = "";
  alert("Xóa hãng thành công");
};

/* ================= MENU ADMIN MOBILE ================= */
export const initAdminMobileMenu = () => {
  if (
    !dom.btnOpenAdminMenu ||
    !dom.btnCloseAdminMenu ||
    !dom.adminMenuOverlay ||
    !dom.adminMobileDrawer
  ) {
    return;
  }

  /* Mở / đóng menu */
  const toggleAdminMenu = () => {
    dom.adminMenuOverlay.classList.toggle("hidden");
    dom.adminMobileDrawer.classList.toggle("hidden");
  };

  /* Đóng menu */
  const closeAdminMenu = () => {
    dom.adminMenuOverlay.classList.add("hidden");
    dom.adminMobileDrawer.classList.add("hidden");
  };

  dom.btnOpenAdminMenu.addEventListener("click", toggleAdminMenu);
  dom.btnCloseAdminMenu.addEventListener("click", closeAdminMenu);
  dom.adminMenuOverlay.addEventListener("click", closeAdminMenu);

  /* Tự đóng menu khi màn hình >= md */
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeAdminMenu();
    }
  });
};


/* ============ ĐÓNG MỞ LOADING ============== */

export const showAdminLoading = () => {
  dom.adminLoading?.classList.remove("hidden");
};

export const hideAdminLoading = () => {
  dom.adminLoading?.classList.add("hidden");
};
