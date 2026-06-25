/* ======================================================
   IMPORT MODULES / HÀM CHỨC NĂNG
====================================================== */

import { el, capNhatSoLuongGioHang, isInPageUser, state } from "./userJS/core.js";
import { bindFilterEvent, renderUserBrandFilter } from "./userJS/filter-flow.js";
import { bindPopupEvents } from "./userJS/popup-flow.js";
import { layDanhSachSP } from "./userJS/product-flow.js";
import { renderGioHang } from "./userJS/cart-flow.js";
import { initCarousel, initSaleCountdown, capNhatWishlist, closeMenuMobileByWidthScreen, hienThiTrangThaiDangNhap, initRequireLoginPopup, initBackToTop } from "./userJS/ui-flow.js";
import { initWishlistPopup } from "./userJS/wishlist-popup.js";

/* ======================================================
   KHỞI TẠO CÁC TÍNH NĂNG CHUNG CỦA WEBSITE
====================================================== */

/* Render danh sách hãng (brand) cho filter */
renderUserBrandFilter();

/* Gắn sự kiện filter sản phẩm */
bindFilterEvent();

/* Gắn sự kiện popup (popup chi tiết, popup giỏ hàng...) */
bindPopupEvents();

/* Khởi tạo carousel */
initCarousel();

/* Khởi tạo countdown sale */
initSaleCountdown();

/* Khởi tạo nút quay lại đầu trang */
initBackToTop();

/* Sự kiện mở popup giỏ hàng */
el.btnGioHang?.addEventListener("click", () => {
  renderGioHang();
});

/* Cập nhật badge số lượng giỏ hàng */
capNhatSoLuongGioHang();

/* Cập nhật badge wishlist */
capNhatWishlist();

/* Lấy danh sách sản phẩm từ API */
layDanhSachSP();

/* Khởi tạo popup wishlist */
initWishlistPopup();

/* Responsive menu mobile:
   khi resize màn hình sẽ tự đóng menu nếu cần */
closeMenuMobileByWidthScreen();

/* Khởi tạo popup kiểm tra đăng nhập đối với thao tác mua và thêm giỏ hàng */
initRequireLoginPopup();

/* Gọi hàm kiểm tra đăng nhập */
hienThiTrangThaiDangNhap();

/* ======================================================
   XỬ LÝ DROPDOWN PROFILE USER
====================================================== */

/* Mở / đóng dropdown profile */
el.avatarBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    el.dropdownMenu[index]?.classList.toggle("hidden");
  });
});

/* ======================================================
   NÚT THOÁT DROPDOWN
====================================================== */

/* Đóng dropdown khi nhấn nút "Thoát" */
el.btnThoat.forEach((button, index) => {
  button.addEventListener("click", () => {
    el.dropdownMenu[index]?.classList.add("hidden");
  });
});

/* ======================================================
   ĐĂNG XUẤT TÀI KHOẢN
====================================================== */

el.btnDangXuat.forEach((button) => {
  button.addEventListener("click", () => {

    /* Xóa thông tin đăng nhập */
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    /* Điều hướng đúng đường dẫn tùy page */
    window.location.href = isInPageUser()
      ? "../index.html"
      : "./index.html";
  });
});

/* ================= CLOSE & OPEN POPUP PROMOTION */
const PROMOTION_POPUP_LAST_SHOWN_KEY = "KP_PROMOTION_POPUP_LAST_SHOWN";
const PROMOTION_POPUP_INTERVAL = 5 * 60 * 1000;
const PROMOTION_PAGE_URL = "./page-user/promotions.html";

const canShowPopupPromotion = () => {
  const lastShown = Number(localStorage.getItem(PROMOTION_POPUP_LAST_SHOWN_KEY) || 0);
  return Date.now() - lastShown >= PROMOTION_POPUP_INTERVAL;
};

/* Open popup promotion */
const openPopupPromotion = () => {
  el.popupPromotion?.classList.remove("hidden");
  localStorage.setItem(PROMOTION_POPUP_LAST_SHOWN_KEY, String(Date.now()));

  setTimeout(() => {
    el.popupPromotionContent?.classList.remove("scale-75", "opacity-0");
    el.popupPromotionContent?.classList.add("scale-100", "opacity-100");
  }, 20);
};

window.addEventListener("load", () => {
  if (canShowPopupPromotion()) {
    openPopupPromotion();
  }
});

/* Close popup promotion */
const closePopupPromotion = () => {
  el.popupPromotionContent?.classList.remove("scale-100", "opacity-100");
  el.popupPromotionContent?.classList.add("scale-75", "opacity-0");

  setTimeout(() => {
    el.popupPromotion?.classList.add("hidden");
  }, 300);
};

el.btnClosePopupPromotion?.addEventListener("click", closePopupPromotion);
el.popupPromotionOverlay?.addEventListener("click", () => {
  window.location.href = PROMOTION_PAGE_URL;
});





 
