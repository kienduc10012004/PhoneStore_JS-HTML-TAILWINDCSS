import { dom, state, formatCurrency, logOutAdmin, getBrands, saveBrands } from "./core.js";

const setErrorMessage = (id, message) => {
  const errorElement = document.getElementById(`error-${id}`);
  if (errorElement) {
    errorElement.innerText = message;
  }
};

export const clearErrors = () => {
  document.querySelectorAll(".error-msg").forEach((item) => {
    item.innerText = "";
  });
};

export const getProductDataFromForm = () => {
  return {
    name: dom.name.value.trim(),
    price: dom.price.value.trim(),
    quantity: dom.quantity.value.trim(),
    img: dom.img.value.trim(),
    giftName: dom.giftName.value.trim(),
    giftImg: dom.giftImg.value.trim(),
    screen: dom.screen.value.trim(),
    backCamera: dom.backCamera.value.trim(),
    frontCamera: dom.frontCamera.value.trim(),
    desc: dom.desc.value.trim(),
    type: dom.type.value.trim()
  };
};

export const validateForm = () => {
  const data = getProductDataFromForm();
  let isValid = true;
  clearErrors();

  for (let key in data) {
    if (data[key] === "") {
      setErrorMessage(key, "Trường này không được để trống");
      isValid = false;
    }
  }

  if (data.price !== "" && Number(data.price) <= 0) {
    setErrorMessage("price", "Giá bán phải là số dương");
    isValid = false;
  }

  if (data.quantity !== "" && Number(data.quantity) < 0) {
    setErrorMessage("quantity", "Số lượng không được âm");
    isValid = false;
  }

  return isValid;
};

export const resetForm = () => {
  if (!dom.productForm) return;
  dom.productForm.reset();
  state.editingProduct = null;
  clearErrors();
  dom.btnSave.classList.remove("hidden");
  dom.btnUpdate.classList.add("hidden");
};

export const addNewTypeOption = () => {
  if (!dom.newType || !dom.type) return;

  const newTypeValue = dom.newType.value.trim();

  if (newTypeValue === "") {
    alert("Vui lòng nhập tên hãng mới");
    return;
  }

  const brands = getBrands();

  const existed = brands.some((brand) => {
    return brand.toLowerCase() === newTypeValue.toLowerCase();
  });

  if (existed) {
    alert("Hãng này đã tồn tại");
    return;
  }

  brands.push(newTypeValue);
  saveBrands(brands);

  renderBrandSelect();

  dom.type.value = newTypeValue;
  dom.newType.value = "";

  alert("Thêm hãng thành công");
};

export const renderDanhSachSP = (danhSachSP) => {
  if (!dom.productTableBody) return;

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

  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const currentItems = danhSachSP.slice(startIndex, startIndex + state.itemsPerPage);

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

export const initAdminCommon = () => {
  if (dom.btnlogout) {
    dom.btnlogout.addEventListener("click", logOutAdmin);
  }
};


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

export const deleteTypeOption = () => {
  if (!dom.type) return;

  const selectedType = dom.type.value.trim();

  if (selectedType === "") {
    alert("Vui lòng chọn hãng cần xóa");
    return;
  }

  const isConfirm = confirm(
    `Bạn có chắc muốn xóa hãng "${selectedType}" không?`
  );

  if (!isConfirm) return;

  const brands = getBrands();

  const newBrands = brands.filter((brand) => {
    return brand.toLowerCase() !== selectedType.toLowerCase();
  });

  saveBrands(newBrands);

  renderBrandSelect();

  dom.type.value = "";

  alert("Xóa hãng thành công");
};

export const initAdminMobileMenu = () => {
  if (
    !dom.btnOpenAdminMenu ||
    !dom.btnCloseAdminMenu ||
    !dom.adminMenuOverlay ||
    !dom.adminMobileDrawer
  ) {
    return;
  }

  const toggleAdminMenu = () => {
    dom.adminMenuOverlay.classList.toggle("hidden");
    dom.adminMobileDrawer.classList.toggle("hidden");
  };

  const closeAdminMenu = () => {
    dom.adminMenuOverlay.classList.add("hidden");
    dom.adminMobileDrawer.classList.add("hidden");
  };

  dom.btnOpenAdminMenu.addEventListener("click", toggleAdminMenu);
  dom.btnCloseAdminMenu.addEventListener("click", closeAdminMenu);
  dom.adminMenuOverlay.addEventListener("click", closeAdminMenu);

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeAdminMenu();
    }
  });
};