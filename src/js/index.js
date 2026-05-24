import { el, capNhatSoLuongGioHang, isInPageUser, state, } from "./userJS/core.js";
import { bindFilterEvent, renderUserBrandFilter  } from "./userJS/filter-flow.js";
import { bindPopupEvents } from "./userJS/popup-flow.js";
import { layDanhSachSP } from "./userJS/product-flow.js";
import { renderGioHang } from "./userJS/cart-flow.js";
import { initCarousel, initSaleCountdown, capNhatWishlist, closeMenuMobileByWidthScreen } from "./userJS/ui-flow.js";
import { initWishlistPopup } from "./userJS/wishlist-popup.js";

renderUserBrandFilter();
bindFilterEvent();
bindPopupEvents();
initCarousel();
initSaleCountdown();
el.btnGioHang?.addEventListener("click", () => renderGioHang());
capNhatSoLuongGioHang();
capNhatWishlist();
layDanhSachSP();
initWishlistPopup();
closeMenuMobileByWidthScreen();


const hienThiTrangThaiDangNhap = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const username = localStorage.getItem("username");

  const loginBtnMobile = document.querySelector(".loginBtnMobile");
  const loginBtnDesktop = document.querySelector(".loginBtnDesktop");
  const userProfileMobile = document.querySelector(".userProfileMobile");
  const userProfileDesktop = document.querySelector(".userProfileDesktop");

  if (isLoggedIn === "true") {
    loginBtnMobile?.classList.add("hidden");
    loginBtnDesktop?.classList.add("hidden");

    userProfileMobile?.classList.remove("hidden");

    userProfileDesktop?.classList.add("hidden");
    userProfileDesktop?.classList.add("lg:flex");

    el.usernameDisplay.forEach((item) => {
      item.textContent = username || "User";
    });
    
    el.usernameDisplayHover.forEach((itemHover) => {
      itemHover.textContent = username;
    })
  } else {
    loginBtnMobile?.classList.remove("hidden");

    loginBtnDesktop?.classList.remove("hidden");
    loginBtnDesktop?.classList.add("hidden");
    loginBtnDesktop?.classList.add("lg:flex");

    userProfileMobile?.classList.add("hidden");
    userProfileDesktop?.classList.add("hidden");
  }
};
hienThiTrangThaiDangNhap();

el.avatarBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    el.dropdownMenu[index]?.classList.toggle("hidden");
  });
});

el.btnThoat.forEach((button, index) => {
  button.addEventListener("click", () => {
    el.dropdownMenu[index]?.classList.add("hidden");
  });
});

el.btnDangXuat.forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = isInPageUser()
    ? "../index.html"
    : "./index.html";
  });
});

