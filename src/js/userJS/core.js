/* ================= API VÀ KEY LOCALSTORAGE ================= */
export const API = "https://69f8c3e5f7044aa0103e73e0.mockapi.io/api/v1/productphone";
export const USER_STORAGE_KEY = "KIENPHONE_USERS";

/* ================= DOM HELPERS USER ================= */
export const getElement = (id) => document.getElementById(id);
export const selectElement = (selector) => document.querySelector(selector);
export const selectElements = (selector) => document.querySelectorAll(selector);
export const createElement = (tagName) => document.createElement(tagName);
export const pageBody = document.body;
export const addDocumentEvent = (eventName, handler) => {
  document.addEventListener(eventName, handler);
};

/* ================= DOM ELEMENTS ================= */
export const el = {

  /* Danh sách sản phẩm / filter */
  danhSachSP: document.getElementById("danhSachSP"),
  loading: document.getElementById("loading"),
  searchSP: document.getElementById("searchInput"),
  filterSP: document.getElementById("filterSelect"),
  sortSP: document.getElementById("sortSelect"),
  btnClearFilters: document.getElementById("btnClearFilters"),
  productCountLabel: document.getElementById("productCountLabel"),
  quickBrandList: document.getElementById("quickBrandList"),
  pagination: document.getElementById("pagination"),
  productSection: document.getElementById("san-pham"),

  /* Giỏ hàng */
  popupGioHang: document.getElementById("popupGioHang"),
  overlayGioHang: document.getElementById("overlayGioHang"),
  noiDungGioHang: document.getElementById("noiDungGioHang"),
  btnCloseGioHang: document.getElementById("btnCloseGioHang"),
  btnGioHang: document.getElementById("btnGioHang"),
  badgeGioHang: document.getElementById("badgeGioHang"),
  orderCheckLink: document.querySelectorAll(".orderCheckLink, a[href$='order-check.html']"),
  btnCartHeader: document.querySelectorAll(".btnCartHeader"),

  /* Wishlist */
  btnWishlist: document.querySelectorAll(".btnWishlist"),
  badgeWishlist: document.querySelectorAll(".badgeWishlist"),
  toastContainer: document.getElementById("toastContainer"),
  popupWishlist: document.getElementById("popupWishlist"),
  overlayWishlist: document.getElementById("overlayWishlist"),
  btnCloseWishlist: document.getElementById("btnCloseWishlist"),
  wishlistContent: document.getElementById("wishlistContent"),

  /* Carousel / sale countdown */
  carouselTrack: document.getElementById("carouselTrack"),
  btnPrevSlide: document.getElementById("btnPrevSlide"),
  btnNextSlide: document.getElementById("btnNextSlide"),
  carouselDots: document.getElementById("carouselDots"),
  saleHour: document.getElementById("saleHour"),
  saleMinute: document.getElementById("saleMinute"),
  saleSecond: document.getElementById("saleSecond"),

  /* Popup quảng cáo trang chủ */
  popupPromotion: document.querySelector(".popupPromotion"),
  popupPromotionContent: document.querySelector(".popupPromotionContent"),
  popupPromotionOverlay: document.querySelector(".popupPromotionOverlay"),
  btnClosePopupPromotion: document.querySelector(".btnClosePopupPromotion"),

  /* Chi tiết sản phẩm / ưu đãi */
  detailBox: document.getElementById("detailBox"),
  relatedProducts: document.getElementById("relatedProducts"),
  promoProducts: document.getElementById("promoProducts"),

  /* Kiểm tra đơn hàng */
  orderTableBody: document.getElementById("orderTableBody"),
  userCancelPopup: document.getElementById("userCancelPopup"),
  userCancelReasonSelect: document.getElementById("userCancelReason"),
  userCancelReasonInput: document.getElementById("userCancelReasonInput"),
  btnConfirmUserCancel: document.getElementById("btnConfirmUserCancel"),
  btnCloseUserCancel: document.getElementById("btnCloseUserCancel"),

  /* Menu mobile */
  btnmenuMobile: document.getElementById("btnmenuMobile"),
  closeMenuMobile: document.getElementById("closeMenuMobile"),
  contentMenuMobile: document.getElementById("contentMenuMobile"),

  /* Form đăng nhập */
  form: document.getElementById("loginForm"),
  username: document.getElementById("loginUsername"),
  password: document.getElementById("loginPassword"),
  usernameError: document.getElementById("loginUsernameError"),
  passwordError: document.getElementById("loginPasswordError"),

  /* Form đăng ký */
  registerForm: document.getElementById("registerForm"),
  registerPhone: document.getElementById("phone"),
  registerEmail: document.getElementById("email"),
  registerUsername: document.getElementById("username"),
  registerPassword: document.getElementById("password"),

  registerPhoneError: document.getElementById("phoneError"),
  registerEmailError: document.getElementById("emailError"),
  registerUsernameError: document.getElementById("usernameError"),
  registerPasswordError: document.getElementById("passwordError"),

  /* Trạng thái đăng nhập / profile user */
  loginBtn: document.querySelectorAll(".loginBtn"),
  userProfile: document.querySelectorAll(".userProfile"),
  usernameDisplay: document.querySelectorAll(".usernameDisplay"),
  avatarBtn: document.querySelectorAll(".avatarBtn"),
  dropdownMenu: document.querySelectorAll(".dropdownMenu"),
  btnThoat: document.querySelectorAll(".btnThoat"),
  btnDangXuat: document.querySelectorAll(".btnDangXuat"),
  usernameDisplayHover:document.querySelectorAll(".usernameDisplayHover"),

  /* Quên mật khẩu */
  forgotForm: document.getElementById("forgotForm"),
  forgotUsername: document.getElementById("forgotUsername"),
  forgotPhone: document.getElementById("forgotPhone"),
  forgotNewPassword: document.getElementById("forgotNewPassword"),
  forgotConfirmPassword: document.getElementById("forgotConfirmPassword"),
  forgotUsernameError: document.getElementById("forgotUsernameError"),
  forgotPhoneError: document.getElementById("forgotPhoneError"),
  forgotNewPasswordError: document.getElementById("forgotNewPasswordError"),
  forgotConfirmPasswordError: document.getElementById("forgotConfirmPasswordError"),

  /* Thanh toán */
  checkoutForm: document.getElementById("checkoutForm"),
  orderSummary: document.getElementById("orderSummary"),
  fullName: document.getElementById("fullName"),
  phone: document.getElementById("phone"),
  email: document.getElementById("email"),
  receiveStore: document.getElementById("receiveStore"),
  receiveDelivery: document.getElementById("receiveDelivery"),
  storeBox: document.getElementById("storeBox"),
  deliveryBox: document.getElementById("deliveryBox"),
  provinceSelect: document.getElementById("fselect_province"),
  districtSelect: document.getElementById("fselect_district"),
  addressInput: document.getElementById("address"),
  noteInput: document.getElementById("note"),

  /* popup mua hàng */
  productOptionPopup: document.getElementById("productOptionPopup"),
  productOptionOverlay: document.getElementById("productOptionOverlay"),
  btnCloseProductOptionPopup: document.getElementById("btnCloseProductOptionPopup"),
  productOptionTitle: document.getElementById("productOptionTitle"),
  productOptionContent: document.getElementById("productOptionContent"),

  /* Popup yêu cầu đăng nhập */
  popupRequireLogin: document.getElementById("popupRequireLogin"),
  overlayRequireLogin: document.getElementById("overlayRequireLogin"),
  btnCloseRequireLogin: document.getElementById("btnCloseRequireLogin"),
  btnLaterLogin: document.getElementById("btnLaterLogin"),
  btnGoLogin: document.getElementById("btnGoLogin"),
};

/* ================= LẤY USERNAME HIỆN TẠI ================= */
export const getCurrentUsername = () => {
  return localStorage.getItem("username") || "guest";
};

/* ================= TẠO KEY GIỎ HÀNG THEO USER ================= */
export const getUserCartKey = () => {
  return `GIO_HANG_USER_${getCurrentUsername()}`;
};

/* ================= TẠO KEY WISHLIST THEO USER ================= */
export const getUserWishlistKey = () => {
  return `WISHLIST_USER_${getCurrentUsername()}`;
};

/* ================= STATE CHUNG CỦA USER ================= */
export const state = {

  /* Dữ liệu sản phẩm */
  danhSachSP: [],
  activeList: [],

  /* Dữ liệu theo từng user */
  gioHang: JSON.parse(localStorage.getItem(getUserCartKey())) || [],
  wishlist: JSON.parse(localStorage.getItem(getUserWishlistKey())) || [],
  users: JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [],

  /* State hỗ trợ filter / phân trang / carousel */
  timerId: null,
  currentPage: 1,
  itemsPerPage: 8,
  currentSlide: 0,
};

/* ================= LƯU GIỎ HÀNG ================= */
export const luuGioHang = () => {
  localStorage.setItem(
    getUserCartKey(),
    JSON.stringify(state.gioHang)
  );
};

/* ================= LƯU WISHLIST ================= */
export const luuWishlist = () => {
  localStorage.setItem(
    getUserWishlistKey(),
    JSON.stringify(state.wishlist)
  );
};

/* ================= LƯU USER ================= */
export const luuUsers = () => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.users));
}

/* ================= CẬP NHẬT BADGE GIỎ HÀNG ================= */
export const capNhatSoLuongGioHang = () => {
  const total = state.gioHang.reduce((sum, item) => sum + item.soLuong, 0);

  if (total == 0) {
    el.badgeGioHang.classList.add("hidden");
  }else {
    el.badgeGioHang.classList.remove("hidden");
    el.badgeGioHang.textContent = total;
  }
};

/* ================= KIỂM TRA ĐANG Ở PAGE-USER KHÔNG ================= */
export const isInPageUser = () => location.pathname.includes("/page-user/");

/* ================= TẠO URL CHI TIẾT SẢN PHẨM ================= */
export const productDetailUrl = (id) =>
  isInPageUser()
    ? `./product-detail.html?id=${id}`
    : `./page-user/product-detail.html?id=${id}`;

/* ================= TẠO URL TRANG SẢN PHẨM ================= */
export const productsUrl = () =>
  isInPageUser()
    ? `./products.html`
    : `./page-user/products.html`;

/* ================= TẠO URL TRANG ƯU ĐÃI ================= */
export const promotionsUrl = () =>
  isInPageUser()
    ? `./promotions.html`
    : `./page-user/promotions.html`;

/* ================= TẠO URL TRANG CHÍNH SÁCH ================= */
export const policiesUrl = () =>
  isInPageUser()
    ? `./policies.html`
    : `./page-user/policies.html`;

/* ================= TẠO URL THANH TOÁN ================= */
export const checkoutUrl = () => {
  return isInPageUser()
    ? "./checkout.html"
    : "./page-user/checkout.html";
};

/* ================= KEY LƯU DANH SÁCH HÃNG ================= */
export const BRAND_STORAGE_KEY = "KIENPHONE_BRANDS";

/* ================= DANH SÁCH HÃNG MẶC ĐỊNH ================= */
export const defaultBrands = [
  "iPhone",
  "Samsung",
  "OPPO",
  "Vivo",
  "Realme",
  "Asus",
  "Nokia"
];

/* ================= LẤY DANH SÁCH HÃNG ================= */
export const getBrands = () => {
  const brands = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY));

  if (Array.isArray(brands) && brands.length > 0) {
    return brands;
  }

  localStorage.setItem(
    BRAND_STORAGE_KEY,
    JSON.stringify(defaultBrands)
  );

  return defaultBrands;
};
