/* ================= API SẢN PHẨM ================= */
export const API_URL =
  "https://69f8c3e5f7044aa0103e73e0.mockapi.io/api/v1/productphone";

/* ================= DOM HELPERS ADMIN ================= */
export const getElement = (id) => document.getElementById(id);
export const selectElement = (selector) => document.querySelector(selector);
export const selectElements = (selector) => document.querySelectorAll(selector);
export const createElement = (tagName) => document.createElement(tagName);

/* ================= DOM ELEMENTS ADMIN ================= */
export const dom = {
  /* Form sản phẩm */
  productForm: document.getElementById("productForm"),
  name: document.getElementById("name"),
  price: document.getElementById("price"),
  discountPercent: document.getElementById("discountPercent"),
  hasInstallment: document.getElementById("hasInstallment"),
  installmentPercent: document.getElementById("installmentPercent"),
  installmentPercentBox: document.getElementById("installmentPercentBox"),
  quantity: document.getElementById("quantity"),
  img: document.getElementById("img"),
  screen: document.getElementById("screen"),
  backCamera: document.getElementById("backCamera"),
  frontCamera: document.getElementById("frontCamera"),
  desc: document.getElementById("desc"),
  type: document.getElementById("type"),
  capacity: document.getElementById("capacity"),
  color: document.getElementById("color"),

  /* Quản lý hãng */
  newType: document.getElementById("newType"),
  btnAddType: document.getElementById("btnAddType"),
  btnDeleteType: document.getElementById("btnDeleteType"),

  /* Quà tặng ưu đãi */
  giftName: document.getElementById("giftName"),
  giftImg: document.getElementById("giftImg"),

  /* Button form sản phẩm */
  btnSave: document.getElementById("btnSave"),
  btnUpdate: document.getElementById("btnUpdate"),
  btnReset: document.getElementById("btnReset"),

  /* Tìm kiếm sản phẩm */
  inputKeyword: document.getElementById("keyword"),
  btnSearch: document.getElementById("btnSearch"),

  /* Bảng sản phẩm */
  productTableBody: document.getElementById("productTableBody"),
  paginationContainer: document.getElementById("pagination"),

  /* Đăng xuất admin */
  btnlogout: document.getElementById("btnlogout"),

  /* Dashboard tổng quan */
  totalProducts: document.getElementById("totalProducts"),
  totalBrands: document.getElementById("totalBrands"),
  highestProduct: document.getElementById("highestProduct"),
  lowestProduct: document.getElementById("lowestProduct"),
  newestProduct: document.getElementById("newestProduct"),
  brandStatsTable: document.getElementById("brandStatsTable"),
  chartByBrand: document.getElementById("chartByBrand"),
  chartAvgPrice: document.getElementById("chartAvgPrice"),

  /* Quản lý đơn hàng */
  orderTableBody: document.getElementById("orderTableBody"),
  orderKeyword: document.getElementById("orderKeyword"),
  btnSearchOrder: document.getElementById("btnSearchOrder"),

  /* Quản lý người dùng */
  userTableBody: document.getElementById("userTableBody"),
  userKeyword: document.getElementById("userKeyword"),
  btnSearchUser: document.getElementById("btnSearchUser"),

  /* Profile admin */
  adminProfileForm: document.getElementById("adminProfileForm"),
  oldPassword: document.getElementById("oldPassword"),
  newPassword: document.getElementById("newPassword"),
  confirmPassword: document.getElementById("confirmPassword"),

  /* Menu admin mobile */
  btnOpenAdminMenu: document.getElementById("btnOpenAdminMenu"),
  btnCloseAdminMenu: document.getElementById("btnCloseAdminMenu"),
  adminMenuOverlay: document.getElementById("adminMenuOverlay"),
  adminMobileDrawer: document.getElementById("adminMobileDrawer"),

  /* ================= DOM POPUP XÁC THỰC ADMIN ================= */
  adminPasswordPopup: document.getElementById("adminPasswordPopup"),
  adminPasswordOverlay: document.getElementById("adminPasswordOverlay"),
  popupAdminUsername: document.getElementById("popupAdminUsername"),
  popupAdminPassword: document.getElementById("popupAdminPassword"),
  btnConfirmShowPassword: document.getElementById("btnConfirmShowPassword"),
  btnClosePasswordPopup: document.getElementById("btnClosePasswordPopup"),

  /* ================= RETURN ORDER ================= */
  returnTableBody: document.getElementById("returnTableBody"),
  returnDetailPopup: document.getElementById("returnDetailPopup"),
  returnDetailContent: document.getElementById("returnDetailContent"),
  btnCloseReturnDetail: document.getElementById("btnCloseReturnDetail"),

  /* loading */
  adminLoading: document.getElementById("adminLoading"),

  /* ================= ORDER DETAIL ================= */
  orderDetailBox: document.getElementById("orderDetailBox"),
  adminCancelPopup: document.getElementById("adminCancelPopup"),
  adminCancelReason: document.getElementById("adminCancelReason"),
  btnConfirmAdminCancel: document.getElementById("btnConfirmAdminCancel"),
  btnCloseAdminCancel: document.getElementById("btnCloseAdminCancel"),

  /* ====== Xuất Excel ====== */
  btnExportExcel: document.getElementById("btnExportExcel"),

  /* ================= REVIEW PRODUCT ================= */
  reviewTableBody: document.getElementById("reviewTableBody"),
  reviewPagination: document.getElementById("reviewPagination"),
  reviewDetailPopup: document.getElementById("reviewDetailPopup"),
  reviewDetailContent: document.getElementById("reviewDetailContent"),
  btnCloseReviewDetail: document.getElementById("btnCloseReviewDetail"),

  /* Element phát sinh / chi tiết thao tác */
  btnDeleteOrderDetail: document.getElementById("btnDeleteOrderDetail"),
  adminOrderStatus: document.getElementById("adminOrderStatus"),
  adminCancelOtherReason: document.getElementById("adminCancelOtherReason"),
  btnProfileLogout: document.getElementById("btnProfileLogout"),
  adminReturnStatus: document.getElementById("adminReturnStatus"),
  rejectReasonBox: document.getElementById("rejectReasonBox"),
  adminRefundStatus: document.getElementById("adminRefundStatus"),
  adminRejectReason: document.getElementById("adminRejectReason"),
};

/* ================= STATE ADMIN ================= */
export const state = {
  danhSachSP: [],
  editingProduct: null,
  currentPage: 1,
  itemsPerPage: 10,
  orders: [],
  users: JSON.parse(localStorage.getItem("KP_USERS")) || [],
};

/* ================= URL PARAMS ORDER DETAIL ================= */
export const params = new URLSearchParams(window.location.search);

export const orderId = params.get("id");
export const username = params.get("user");

/* ================= KIỂM TRA ĐANG Ở PAGE-USER KHÔNG ================= */
export const isInPageAdmin = () => location.pathname.includes("/page-admin/");

/* ================= FORMAT TIỀN TỆ ================= */
export const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

/* ================= ĐĂNG XUẤT ADMIN ================= */
export const logOutAdmin = () => {
  const confirmLogOut = confirm("Bạn có chắc muốn đăng xuất khỏi Admin?");

  if (confirmLogOut) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");

    window.location.href = "../index.html";
  }
};

/* ================= KEY LƯU DANH SÁCH HÃNG ================= */
export const BRAND_STORAGE_KEY = "HiKuPHONE_BRANDS";

/* ================= DANH SÁCH HÃNG MẶC ĐỊNH ================= */
export const defaultBrands = [
  "iPhone",
  "Samsung",
  "OPPO",
  "Vivo",
  "Realme",
  "Asus",
  "Nokia",
];

/* ================= LẤY DANH SÁCH HÃNG ================= */
export const getBrands = () => {
  const brands = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY));

  if (brands && brands.length > 0) {
    return brands;
  }

  localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(defaultBrands));

  return defaultBrands;
};

/* ================= LƯU DANH SÁCH HÃNG ================= */
export const saveBrands = (brands) => {
  localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brands));
};
