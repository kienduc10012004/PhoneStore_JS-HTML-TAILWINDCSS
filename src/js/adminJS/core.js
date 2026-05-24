export const API_URL = "https://69f8c3e5f7044aa0103e73e0.mockapi.io/api/v1/productphone";

export const dom = {
  productForm: document.getElementById("productForm"),
  name: document.getElementById("name"),
  price: document.getElementById("price"),
  quantity: document.getElementById("quantity"),
  img: document.getElementById("img"),
  screen: document.getElementById("screen"),
  backCamera: document.getElementById("backCamera"),
  frontCamera: document.getElementById("frontCamera"),
  desc: document.getElementById("desc"),
  type: document.getElementById("type"),
  newType: document.getElementById("newType"),
  btnAddType: document.getElementById("btnAddType"),
  btnDeleteType: document.getElementById("btnDeleteType"),
  giftName: document.getElementById("giftName"),
  giftImg: document.getElementById("giftImg"),
  btnSave: document.getElementById("btnSave"),
  btnUpdate: document.getElementById("btnUpdate"),
  btnReset: document.getElementById("btnReset"),
  inputKeyword: document.getElementById("keyword"),
  btnSearch: document.getElementById("btnSearch"),
  productTableBody: document.getElementById("productTableBody"),
  paginationContainer: document.getElementById("pagination"),
  btnlogout: document.getElementById("btnlogout"),

  totalProducts: document.getElementById("totalProducts"),
  totalBrands: document.getElementById("totalBrands"),
  highestProduct: document.getElementById("highestProduct"),
  lowestProduct: document.getElementById("lowestProduct"),
  newestProduct: document.getElementById("newestProduct"),
  brandStatsTable: document.getElementById("brandStatsTable"),
  chartByBrand: document.getElementById("chartByBrand"),
  chartAvgPrice: document.getElementById("chartAvgPrice"),

  orderTableBody: document.getElementById("orderTableBody"),
  orderKeyword: document.getElementById("orderKeyword"),
  btnSearchOrder: document.getElementById("btnSearchOrder"),

  userTableBody: document.getElementById("userTableBody"),
  userKeyword: document.getElementById("userKeyword"),
  btnSearchUser: document.getElementById("btnSearchUser"),

  adminProfileForm: document.getElementById("adminProfileForm"),
  oldPassword: document.getElementById("oldPassword"),
  newPassword: document.getElementById("newPassword"),
  confirmPassword: document.getElementById("confirmPassword"),

  btnOpenAdminMenu: document.getElementById("btnOpenAdminMenu"),
  btnCloseAdminMenu: document.getElementById("btnCloseAdminMenu"),
  adminMenuOverlay: document.getElementById("adminMenuOverlay"),
  adminMobileDrawer: document.getElementById("adminMobileDrawer"),

  
};

export const state = {
  danhSachSP: [],
  editingProduct: null,
  currentPage: 1,
  itemsPerPage: 10,
  orders: [],
  users: JSON.parse(localStorage.getItem("KP_USERS")) || []
};


export const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

export const logOutAdmin = () => {
  const confirmLogOut = confirm("Bạn có chắc muốn đăng xuất khỏi Admin?");
  if (confirmLogOut) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    window.location.href = "../index.html";
  }
};


export const BRAND_STORAGE_KEY = "KIENPHONE_BRANDS";

export const defaultBrands = [
  "iPhone",
  "Samsung",
  "OPPO",
  "Vivo",
  "Realme",
  "Asus",
  "Nokia",
];

export const getBrands = () => {
  const brands = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY));

  if (brands && brands.length > 0) {
    return brands;
  }

  localStorage.setItem(
    BRAND_STORAGE_KEY,
    JSON.stringify(defaultBrands)
  );

  return defaultBrands;
};

export const saveBrands = (brands) => {
  localStorage.setItem(
    BRAND_STORAGE_KEY,
    JSON.stringify(brands)
  );
};