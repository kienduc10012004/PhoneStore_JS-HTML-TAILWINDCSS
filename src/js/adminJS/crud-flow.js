/* ================= IMPORT MODULES ================= */
import { API_URL, dom, state } from "./core.js";
import { showAppConfirm } from "../shared-dialog.js";
import {
  renderDanhSachSP,
  resetForm,
  validateForm,
  getProductDataFromForm,
  addNewTypeOption,
  renderBrandSelect,
  deleteTypeOption,
  showAdminLoading,
  hideAdminLoading
} from "./ui-flow.js";



/* ================= CUỘN VỀ DANH SÁCH SẢN PHẨM ================= */
const scrollToProductList = () => {
  const productListSection =
    dom.productTableBody?.closest("section") ||
    dom.productTableBody;

  productListSection?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const createDefaultReview = () => {
  return {
    id: "DEFAULT_REVIEW",
    username: "__default_review__",
    displayName: "HiKuPhone",
    avatar: "K",
    stars: 5,
    title: "Đánh giá sản phẩm",
    content: "sản phẩm tốt",
    image: null,
    hidden: false,
    createdAt: "Mặc định",
    updatedAt: "Mặc định",
  };
};

/* ================= LỌC DANH SÁCH SẢN PHẨM ================= */
export const getFilteredList = () => {
  const keyword = dom.inputKeyword.value.toLowerCase().trim();

  if (!keyword) {
    return state.danhSachSP;
  }

  return state.danhSachSP.filter((product) => {
    return product.name.toLowerCase().includes(keyword) ||
      product.desc.toLowerCase().includes(keyword) ||
      product.type.toLowerCase().includes(keyword);
  });
};

/* ================= LẤY DANH SÁCH SẢN PHẨM TỪ API ================= */
export const fetchDanhSachSP = async () => {
  showAdminLoading();
  try {
    const response = await axios.get(API_URL);

    state.danhSachSP = Array.isArray(response.data)
      ? response.data
      : [];

    renderDanhSachSP(getFilteredList());
  } catch (error) {
    console.error(error);
    alert("Không tải được danh sách sản phẩm");
  } finally { hideAdminLoading() }
};

/* ================= TÌM KIẾM SẢN PHẨM ================= */
export const filterSP = () => {
  state.currentPage = 1;
  renderDanhSachSP(getFilteredList());
};

/* ================= CHUYỂN TRANG PHÂN TRANG ================= */
window.changePage = (page) => {
  state.currentPage = page;
  renderDanhSachSP(getFilteredList());

  requestAnimationFrame(() => {
    scrollToProductList();
  });
};

/* ================= THÊM SẢN PHẨM ================= */
export const createProduct = async () => {
  if (!validateForm()) return;

  try {
    await axios.post(API_URL, {
      ...getProductDataFromForm(),
      rating: 5,
      totalReviews: 1,
      defaultReviewInitialized: true,
      reviews: [createDefaultReview()],
    });

    alert("Thêm thành công!");

    resetForm();

    await fetchDanhSachSP();
  } catch (error) {
    alert("Lỗi khi thêm sản phẩm");
  }
};

/* ================= CẬP NHẬT SẢN PHẨM ================= */
export const updateProduct = async () => {
  if (!state.editingProduct) {
    alert("Vui lòng chọn sản phẩm cần cập nhật");
    return;
  }

  if (!validateForm()) return;

  try {
    await axios.put(
      `${API_URL}/${state.editingProduct.id}`,
      {
        ...state.editingProduct,
        ...getProductDataFromForm(),
      }
    );

    alert("Cập nhật thành công!");

    resetForm();

    await fetchDanhSachSP();
  } catch (error) {
    alert("Lỗi khi cập nhật sản phẩm");
  }
};

/* ================= ĐỔ DỮ LIỆU SẢN PHẨM LÊN FORM SỬA ================= */
window.editProduct = (id) => {
  const product =
    state.danhSachSP.find((item) => item.id == id);

  if (!product) return;

  state.editingProduct = product;

  dom.giftName.value = product.giftName || "Không";
  dom.giftImg.value = product.giftImg || "Không";
  dom.name.value = product.name || "";
  dom.price.value = product.originalPrice || product.price || "";
  dom.discountPercent.value = product.discountPercent || 0;
  dom.hasInstallment.checked = Boolean(product.hasInstallment);
  dom.installmentPercent.value = product.installmentPercent || "";
  dom.installmentPercentBox?.classList.toggle("hidden", !dom.hasInstallment.checked);
  dom.quantity.value = product.quantity || 0;
  dom.img.value = product.img || "";
  dom.screen.value = product.screen || "";
  dom.backCamera.value = product.backCamera || "";
  dom.frontCamera.value = product.frontCamera || "";
  dom.desc.value = product.desc || "";
  dom.type.value = product.type || "";
  dom.capacity.value = product.capacity || "";
  dom.color.value = product.color || "";

  dom.btnSave.classList.add("hidden");
  dom.btnUpdate.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

/* ================= XÓA SẢN PHẨM ================= */
window.deleteProduct = async (id) => {
  const isConfirm = await showAppConfirm({
    title: "Xóa sản phẩm",
    message: "Bạn có chắc muốn xóa sản phẩm này?",
    confirmText: "Xóa",
  });

  if (!isConfirm) return;

  try {
    await axios.delete(`${API_URL}/${id}`);

    await fetchDanhSachSP();
  } catch (error) {
    alert("Lỗi khi xóa sản phẩm");
  }
};

/* ================= KHỞI TẠO QUẢN LÝ SẢN PHẨM ================= */
export const initManageProduct = () => {
  if (!dom.productForm) return;

  /* Render danh sách hãng vào select */
  renderBrandSelect();

  /* Submit form thêm sản phẩm */
  dom.productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createProduct();
  });

  /* Cập nhật sản phẩm */
  dom.btnUpdate.addEventListener("click", updateProduct);

  /* Reset form */
  dom.btnReset.addEventListener("click", resetForm);

  /* Tìm kiếm sản phẩm */
  dom.btnSearch.addEventListener("click", filterSP);

  /* Thêm hãng mới */
  dom.btnAddType.addEventListener("click", addNewTypeOption);

  /* Xóa hãng */
  dom.btnDeleteType?.addEventListener("click", deleteTypeOption);

  dom.hasInstallment?.addEventListener("change", () => {
    dom.installmentPercentBox?.classList.toggle(
      "hidden",
      !dom.hasInstallment.checked
    );

    if (!dom.hasInstallment.checked && dom.installmentPercent) {
      dom.installmentPercent.value = "";
    }
  });

  /* Nhấn Enter để tìm kiếm */
  dom.inputKeyword.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      filterSP();
    }
  });

  /* Load danh sách sản phẩm ban đầu */
  fetchDanhSachSP();
};
