export const API = "https://69f8c3e5f7044aa0103e73e0.mockapi.io/api/v1/productphone";

export const USER_STORAGE_KEY = "KIENPHONE_USERS";

export const el = {
  danhSachSP: document.getElementById("danhSachSP"),
  loading: document.getElementById("loading"),
  searchSP: document.getElementById("searchInput"),
  filterSP: document.getElementById("filterSelect"),
  sortSP: document.getElementById("sortSelect"),
  btnClearFilters: document.getElementById("btnClearFilters"),
  productCountLabel: document.getElementById("productCountLabel"),
  quickBrandList: document.getElementById("quickBrandList"),

  popupGioHang: document.getElementById("popupGioHang"),
  overlayGioHang: document.getElementById("overlayGioHang"),
  noiDungGioHang: document.getElementById("noiDungGioHang"),
  btnCloseGioHang: document.getElementById("btnCloseGioHang"),
  btnGioHang: document.getElementById("btnGioHang"),
  badgeGioHang: document.getElementById("badgeGioHang"),

  btnWishlist: document.querySelectorAll(".btnWishlist"),
  badgeWishlist: document.querySelectorAll(".badgeWishlist"),
  toastContainer: document.getElementById("toastContainer"),
  popupWishlist: document.getElementById("popupWishlist"),
  overlayWishlist: document.getElementById("overlayWishlist"),
  btnCloseWishlist: document.getElementById("btnCloseWishlist"),
  wishlistContent: document.getElementById("wishlistContent"),

  carouselTrack: document.getElementById("carouselTrack"),
  btnPrevSlide: document.getElementById("btnPrevSlide"),
  btnNextSlide: document.getElementById("btnNextSlide"),
  carouselDots: document.getElementById("carouselDots"),
  saleHour: document.getElementById("saleHour"),
  saleMinute: document.getElementById("saleMinute"),
  saleSecond: document.getElementById("saleSecond"),

  detailBox: document.getElementById("detailBox"),
  relatedProducts: document.getElementById("relatedProducts"),
  promoProducts: document.getElementById("promoProducts"),

  btnmenuMobile: document.getElementById("btnmenuMobile"),
  closeMenuMobile: document.getElementById("closeMenuMobile"),
  contentMenuMobile: document.getElementById("contentMenuMobile"),

  form: document.getElementById("loginForm"),
  username: document.getElementById("loginUsername"),
  password: document.getElementById("loginPassword"),
  usernameError: document.getElementById("loginUsernameError"),
  passwordError: document.getElementById("loginPasswordError"),

  registerForm: document.getElementById("registerForm"),
  registerPhone: document.getElementById("phone"),
  registerEmail: document.getElementById("email"),
  registerUsername: document.getElementById("username"),
  registerPassword: document.getElementById("password"),

  registerPhoneError: document.getElementById("phoneError"),
  registerEmailError: document.getElementById("emailError"),
  registerUsernameError: document.getElementById("usernameError"),
  registerPasswordError: document.getElementById("passwordError"),

  loginBtn: document.querySelectorAll(".loginBtn"),
  userProfile: document.querySelectorAll(".userProfile"),
  usernameDisplay: document.querySelectorAll(".usernameDisplay"),
  avatarBtn: document.querySelectorAll(".avatarBtn"),
  dropdownMenu: document.querySelectorAll(".dropdownMenu"),
  btnThoat: document.querySelectorAll(".btnThoat"),
  btnDangXuat: document.querySelectorAll(".btnDangXuat"),
  usernameDisplayHover:document.querySelectorAll(".usernameDisplayHover"),
};

export const getCurrentUsername = () => {
  return localStorage.getItem("username") || "guest";
};

export const getUserCartKey = () => {
  return `GIO_HANG_USER_${getCurrentUsername()}`;
};

export const getUserWishlistKey = () => {
  return `WISHLIST_USER_${getCurrentUsername()}`;
};

export const state = {
  danhSachSP: [],
  activeList: [],
  gioHang: JSON.parse(localStorage.getItem(getUserCartKey())) || [],
  wishlist: JSON.parse(localStorage.getItem(getUserWishlistKey())) || [],
  users: JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [],
  timerId: null,
  currentPage: 1,
  itemsPerPage: 8,
  currentSlide: 0,
};

export const luuGioHang = () => {
  localStorage.setItem(
    getUserCartKey(),
    JSON.stringify(state.gioHang)
  );
};

export const luuWishlist = () => {
  localStorage.setItem(
    getUserWishlistKey(),
    JSON.stringify(state.wishlist)
  );
};

export const luuUsers = () => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.users));
};

export const capNhatSoLuongGioHang = () => {
  const total = state.gioHang.reduce((sum, item) => sum + item.soLuong, 0);

  if (el.badgeGioHang) {
    el.badgeGioHang.textContent = total;
  }
};

export const isInPageUser = () => location.pathname.includes("/page-user/");

export const productDetailUrl = (id) =>
  isInPageUser()
    ? `./product-detail.html?id=${id}`
    : `./page-user/product-detail.html?id=${id}`;

export const productsUrl = () =>
  isInPageUser()
    ? `./products.html`
    : `./page-user/products.html`;

export const promotionsUrl = () =>
  isInPageUser()
    ? `./promotions.html`
    : `./page-user/promotions.html`;

export const policiesUrl = () =>
  isInPageUser()
    ? `./policies.html`
    : `./page-user/policies.html`;

export const checkoutUrl = () => {
  return isInPageUser()
    ? "./checkout.html"
    : "./page-user/checkout.html";
};

export const BRAND_STORAGE_KEY = "KIENPHONE_BRANDS";

export const defaultBrands = [
  "iPhone",
  "Samsung",
  "OPPO",
  "Vivo",
  "Realme",
  "Asus",
  "Nokia"
];

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

