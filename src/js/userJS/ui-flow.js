import { el, state, luuWishlist, isInPageUser, getElement, selectElement, createElement } from "./core.js";

/* ================= HÌNH ẢNH & FORMAT DỮ LIỆU ================= */

/* Lấy đường dẫn hình ảnh */
export const getImageUrl = (img) => {
  if (!img) return "";

  const value = String(img).trim();

  /* Nếu là URL online hoặc base64 */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  /* Kiểm tra extension */
  const hasExtension =
    /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(value);

  const imagePath = hasExtension
    ? value
    : `${value}.png`;

  const fileName = imagePath.split("/").pop();

  const prefix = isInPageUser()
    ? "../images/"
    : "./images/";

  return `${prefix}${fileName}`;
};

/* Format tiền tệ */
export const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
};

/* Tính giá gốc */
export const getOldPrice = (price) => {
  return Math.round(Number(price || 0) * 1.14);
};

/* Tính phần trăm giảm giá */
export const getDiscountPercent = (price) => {
  return Math.round(
    (
      (getOldPrice(price) - Number(price)) /
      getOldPrice(price)
    ) * 100
  );
};

/* Lấy rating theo id */
export const getRating = (id) => {
  return [4.6, 4.7, 4.8, 4.9, 5.0][Number(id) % 5] || 4.8;
};

/* Render sao đánh giá */
export const renderStars = (rating) => {
  return Array.from(
    { length: 5 },
    (_, i) => (
      i < Math.floor(rating)
        ? "★"
        : "☆"
    )
  ).join("");
};

/* ================= TOAST THÔNG BÁO ================= */

/* Lấy màu toast theo loại */
const getToastColor = (type) => {
  if (type === "error") {
    return "bg-red-50 text-red-700 border-red-100";
  }

  if (type === "warning") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-100";
};

/* Hiển thị toast */
export const showToast = (
  message,
  type = "success"
) => {

  if (!el.toastContainer) return;

  const toast = createElement("div");

  const color = getToastColor(type);

  toast.className = `min-w-72 max-w-sm p-4 rounded-2xl border shadow-xl ${color} translate-x-8 opacity-0 transition-all duration-300`;

  toast.innerHTML = `
    <div class="flex gap-3">
      <b>${type === "error" ? "!" : "✓"}</b>

      <p class="text-sm font-bold">
        ${message}
      </p>
    </div>
  `;

  el.toastContainer.appendChild(toast);

  /* Animation hiện */
  setTimeout(() => {
    toast.classList.remove(
      "translate-x-8",
      "opacity-0"
    );
  }, 20);

  /* Animation ẩn */
  setTimeout(() => {

    toast.classList.add(
      "translate-x-8",
      "opacity-0"
    );

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 2500);
};

/* ================= WISHLIST ================= */

/* Ẩn badge wishlist */
const hideWishlistBadges = () => {
  el.badgeWishlist.forEach((badgeWishlist) => {
    badgeWishlist.classList.add("hidden");
  });
};

/* Hiện badge wishlist */
const showWishlistBadges = () => {
  el.badgeWishlist.forEach((badgeWishlist) => {
    badgeWishlist.classList.remove("hidden");

    badgeWishlist.textContent =
      state.wishlist.length;
  });
};

/* Cập nhật wishlist */
export const capNhatWishlist = () => {

  if (state.wishlist.length === 0) {
    hideWishlistBadges();
  }
  else {
    showWishlistBadges();
  }

};

/* Thêm / xóa wishlist */
window.toggleWishlist = (id) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  /* Chưa đăng nhập */
  if (isLoggedIn !== "true") {
    openRequireLoginPopup();
    return;
  }

  const sp = state.danhSachSP.find(
    (p) => p.id == id
  );

  const strId = String(id);

  /* Nếu đã tồn tại */
  if (state.wishlist.includes(strId)) {

    state.wishlist =
      state.wishlist.filter(
        (x) => x !== strId
      );

    showToast(
      `Đã bỏ ${sp?.name || "sản phẩm"} khỏi yêu thích`,
      "warning"
    );
  }

  /* Nếu chưa tồn tại */
  else {

    state.wishlist.push(strId);

    showToast(
      `Đã thêm ${sp?.name || "sản phẩm"} vào yêu thích`
    );
  }

  luuWishlist();

  capNhatWishlist();
};

/* ================= CAROUSEL ================= */

/* Khởi tạo carousel */
export const initCarousel = () => {

  if (
    !el.carouselTrack ||
    !el.btnPrevSlide ||
    !el.btnNextSlide ||
    !el.carouselDots
  ) {
    return;
  }

  const carouselItems =
    el.carouselTrack.children;

  /* State carousel */
  let autoSlide = null;

  let isDragging = false;

  let startX = 0;

  let dragDistance = 0;

  let activePointerId = null;

  let hasDragged = false;

  /* ================= HÀM HỖ TRỢ CAROUSEL ================= */

  /* Cập nhật dot */
  const updateDots = () => {

    const dotItems =
      el.carouselDots.querySelectorAll(".dot-item");

    dotItems.forEach((dot) => {

      dot.classList.remove(
        "w-8",
        "bg-white"
      );

      dot.classList.add(
        "w-3",
        "bg-white/40"
      );

    });

    if (dotItems[state.currentSlide]) {

      dotItems[state.currentSlide].classList.remove(
        "w-3",
        "bg-white/40"
      );

      dotItems[state.currentSlide].classList.add(
        "w-8",
        "bg-white"
      );
    }
  };

  /* Cập nhật vị trí slide */
  const updateCarouselPosition = () => {

    el.carouselTrack.style.transition =
      "transform 0.7s ease-out";

    el.carouselTrack.style.transform =
      `translateX(-${state.currentSlide * 100}%)`;

    updateDots();
  };

  /* Tự động chuyển slide */
  const startAutoSlide = () => {

    return setInterval(() => {

      state.currentSlide++;

      if (
        state.currentSlide >
        carouselItems.length - 1
      ) {
        state.currentSlide = 0;
      }

      updateCarouselPosition();

    }, 4000);
  };

  /* Tạo dot */
  const createDots = () => {

    el.carouselDots.innerHTML = "";

    for (
      let index = 0;
      index < carouselItems.length;
      index++
    ) {

      const dot =
        createElement("button");

      dot.className =
        "dot-item h-3 w-3 rounded-full bg-white/40 transition-all";

      dot.addEventListener("click", () => {

        clearInterval(autoSlide);

        state.currentSlide = index;

        updateCarouselPosition();

        autoSlide = startAutoSlide();
      });

      el.carouselDots.appendChild(dot);
    }

    updateDots();
  };

  /* ================= ĐIỀU HƯỚNG SLIDE ================= */

  /* Slide tiếp theo */
  const nextSlide = () => {

    state.currentSlide++;

    if (
      state.currentSlide >
      carouselItems.length - 1
    ) {
      state.currentSlide = 0;
    }

    updateCarouselPosition();
  };

  /* Slide trước đó */
  const prevSlide = () => {

    state.currentSlide--;

    if (state.currentSlide < 0) {
      state.currentSlide =
        carouselItems.length - 1;
    }

    updateCarouselPosition();
  };

  /* ================= KÉO CAROUSEL ================= */

  /* Bắt đầu kéo carousel */
  const startDrag = (event) => {
    if (event.button && event.button !== 0) return;
    if (event.isPrimary === false) return;

    clearInterval(autoSlide);

    isDragging = true;

    activePointerId = event.pointerId;

    hasDragged = false;

    startX = event.clientX;

    dragDistance = 0;

    el.carouselTrack.setPointerCapture(event.pointerId);

    el.carouselTrack.style.transition = "none";

    el.carouselTrack.style.cursor = "grabbing";
  };

  /* Đang kéo carousel */
  const dragging = (event) => {

    if (!isDragging) return;

    if (event.pointerId !== activePointerId) return;

    dragDistance =
      event.clientX - startX;

    if (Math.abs(dragDistance) > 8) {
      hasDragged = true;
    }

    const carouselWidth =
      el.carouselTrack.offsetWidth;

    let dragPercent =
      (dragDistance / carouselWidth) * 100;

    /* Hiệu ứng dây thun slide đầu */
    if (
      state.currentSlide === 0 &&
      dragDistance > 0
    ) {
      dragPercent *= 0.25;
    }

    /* Hiệu ứng dây thun slide cuối */
    if (
      state.currentSlide ===
        carouselItems.length - 1 &&
      dragDistance < 0
    ) {
      dragPercent *= 0.25;
    }

    const translateValue =
      -state.currentSlide * 100 +
      dragPercent;

    el.carouselTrack.style.transform =
      `translateX(${translateValue}%)`;
  };

  /* Kết thúc kéo carousel */
  const endDrag = (event) => {

    if (!isDragging) return;

    if (event.pointerId !== activePointerId) return;

    isDragging = false;

    activePointerId = null;

    if (el.carouselTrack.hasPointerCapture(event.pointerId)) {
      el.carouselTrack.releasePointerCapture(event.pointerId);
    }

    el.carouselTrack.style.cursor = "grab";

    const minDrag = 80;

    /* Kéo sang trái */
    if (
      dragDistance < -minDrag &&
      state.currentSlide <
        carouselItems.length - 1
    ) {
      state.currentSlide++;
    }

    /* Kéo sang phải */
    if (
      dragDistance > minDrag &&
      state.currentSlide > 0
    ) {
      state.currentSlide--;
    }

    updateCarouselPosition();

    autoSlide = startAutoSlide();
  };

  /* Chặn click link nếu người dùng vừa kéo carousel */
  const preventClickAfterDrag = (event) => {
    if (!hasDragged) return;

    event.preventDefault();
    event.stopPropagation();
    hasDragged = false;
  };

  /* ================= GẮN SỰ KIỆN CAROUSEL ================= */

  /* Click nút next */
  el.btnNextSlide.addEventListener(
    "click",
    () => {

      clearInterval(autoSlide);

      nextSlide();

      autoSlide = startAutoSlide();
    }
  );

  /* Click nút prev */
  el.btnPrevSlide.addEventListener(
    "click",
    () => {

      clearInterval(autoSlide);

      prevSlide();

      autoSlide = startAutoSlide();
    }
  );

  /* Event kéo carousel bằng chuột / cảm ứng */
  el.carouselTrack.addEventListener(
    "pointerdown",
    startDrag
  );

  el.carouselTrack.addEventListener(
    "pointermove",
    dragging
  );

  el.carouselTrack.addEventListener(
    "pointerup",
    endDrag
  );

  el.carouselTrack.addEventListener(
    "pointercancel",
    endDrag
  );

  el.carouselTrack.addEventListener(
    "click",
    preventClickAfterDrag,
    true
  );

  el.carouselTrack.style.cursor = "grab";
  el.carouselTrack.style.touchAction = "pan-y";

  createDots();

  updateCarouselPosition();

  autoSlide = startAutoSlide();
};

/* ================= ĐẾM NGƯỢC FLASH SALE ================= */

/* Khởi tạo countdown flash sale */
export const initSaleCountdown = () => {

  if (!el.saleHour) return;

  /* Cập nhật countdown */
  const update = () => {

    const now = new Date();

    const end = new Date();

    end.setHours(23, 59, 59, 999);

    const diff = end - now;

    el.saleHour.textContent =
      String(
        Math.floor(diff / 3600000)
      ).padStart(2, "0");

    el.saleMinute.textContent =
      String(
        Math.floor((diff / 60000) % 60)
      ).padStart(2, "0");

    el.saleSecond.textContent =
      String(
        Math.floor((diff / 1000) % 60)
      ).padStart(2, "0");
  };

  update();

  setInterval(update, 1000);
};

/* ================= MENU MOBILE ================= */

/* Đóng / mở menu mobile */
window.closeOrOpenMenuMobile = () => {
  el.contentMenuMobile.classList.toggle("hidden");
};

/* Tự động đóng menu mobile khi resize */
export const closeMenuMobileByWidthScreen = () => {

  window.addEventListener("resize", () => {

    if (window.innerWidth >= 1024) {
      el.contentMenuMobile.classList.add("hidden");
    }

  });
};

/* ================= HIỂN THỊ TRẠNG THÁI ĐĂNG NHẬP ================= */

/* Lấy các phần tử đăng nhập / profile trong header */
const getLoginElements = () => {

  return {
    loginBtnMobile:
      selectElement(".loginBtnMobile"),

    loginBtnDesktop:
      selectElement(".loginBtnDesktop"),

    userProfileMobile:
      selectElement(".userProfileMobile"),

    userProfileDesktop:
      selectElement(".userProfileDesktop"),
  };
};

/* Hiển thị profile user khi đã đăng nhập */
const showUserProfile = (username) => {

  const {
    loginBtnMobile,
    loginBtnDesktop,
    userProfileMobile,
    userProfileDesktop,
  } = getLoginElements();

  loginBtnMobile?.classList.add("hidden");

  loginBtnDesktop?.classList.add("hidden");
  loginBtnDesktop?.classList.remove("lg:flex");

  userProfileMobile?.classList.remove("hidden");

  userProfileDesktop?.classList.remove("hidden");
  userProfileDesktop?.classList.add("lg:flex");

  el.usernameDisplay.forEach((item) => {
    item.textContent = username || "User";
  });

  el.usernameDisplayHover.forEach((itemHover) => {
    itemHover.textContent = username;
  });
};

/* Hiển thị nút đăng nhập khi chưa đăng nhập */
const showLoginButtons = () => {

  const {
    loginBtnMobile,
    loginBtnDesktop,
    userProfileMobile,
    userProfileDesktop,
  } = getLoginElements();

  loginBtnMobile?.classList.remove("hidden");

  loginBtnDesktop?.classList.add("hidden");
  loginBtnDesktop?.classList.add("lg:flex");

  userProfileMobile?.classList.add("hidden");

  userProfileDesktop?.classList.add("hidden");
  userProfileDesktop?.classList.remove("lg:flex");
};

/* Kiểm tra localStorage và hiển thị đúng trạng thái đăng nhập */
export const hienThiTrangThaiDangNhap = () => {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");

  const username =
    localStorage.getItem("username");

  if (isLoggedIn === "true") {
    showUserProfile(username);
    enableAuthActions();
  }
  else {
    showLoginButtons();
    disableAuthActions();
  }
};

/* Chặn chuyển trang kiểm tra đơn hàng khi chưa đăng nhập */
const blockOrderCheckWhenLoggedOut = (event) => {
  event.preventDefault();
};

/* Disable các chức năng cần đăng nhập */
const disableAuthActions = () => {
  el.orderCheckLink.forEach((link) => {
    link.classList.add(
      "opacity-40",
      "cursor-not-allowed"
    );
    link.classList.remove("hover:text-blue-600");
    link.style.pointerEvents = "";
    link.addEventListener("click", blockOrderCheckWhenLoggedOut);
  });

  el.btnWishlist.forEach((button) => {
    button.disabled = true;
    button.classList.add(
      "opacity-40",
      "cursor-not-allowed"
    );
    button.classList.remove(
      "hover:text-rose-500",
      "hover:bg-rose-50",
      "hover:bg-rose-100",
      "hover:border-rose-500",
      "cursor-pointer"
    );
  });

  el.btnCartHeader.forEach((button) => {
    button.disabled = true;
    button.classList.add(
      "opacity-40",
      "cursor-not-allowed"
    );
    button.classList.remove("hover:bg-blue-600", "cursor-pointer");
  });
};

/* Enable các chức năng sau khi đăng nhập */
const enableAuthActions = () => {
  el.orderCheckLink.forEach((link) => {
    link.classList.remove(
      "opacity-40",
      "pointer-events-none",
      "cursor-not-allowed"
    );
    link.classList.add("hover:text-blue-600");
    link.style.pointerEvents = "";
    link.removeEventListener("click", blockOrderCheckWhenLoggedOut);
  });

  el.btnWishlist.forEach((button) => {
    button.disabled = false;
    button.classList.remove(
      "opacity-40",
      "cursor-not-allowed"
    );
    button.classList.add(
      "hover:text-rose-500",
      "cursor-pointer"
    );

    if (button.classList.contains("lg:flex")) {
      button.classList.add("hover:bg-rose-100");
    }
    else {
      button.classList.add(
        "hover:bg-rose-50",
        "hover:border-rose-500"
      );
    }
  });

  el.btnCartHeader.forEach((button) => {
    button.disabled = false;
    button.classList.remove(
      "opacity-40",
      "cursor-not-allowed"
    );
    button.classList.add(
      "hover:bg-blue-600",
      "cursor-pointer"
    );
  });
};


/* ===== POPUP YÊU CẦU ĐĂNG NHẬP ===== */

export const openRequireLoginPopup = () => {
  const popup = getElement("popupRequireLogin");

  popup?.classList.remove("hidden");
};

export const closeRequireLoginPopup = () => {
  const popup = getElement("popupRequireLogin");
  popup?.classList.add("hidden");
};

export const initRequireLoginPopup = () => {
  const btnClose = getElement("btnCloseRequireLogin");

  const btnLater = getElement("btnLaterLogin");

  const btnGoLogin = getElement("btnGoLogin");

  const overlay = getElement("overlayRequireLogin");

  btnClose?.addEventListener("click", closeRequireLoginPopup);

  btnLater?.addEventListener("click", closeRequireLoginPopup);

  overlay?.addEventListener("click", closeRequireLoginPopup);

  btnGoLogin?.addEventListener("click", () => {
    window.location.href =
      isInPageUser()
        ? "./login.html"
        : "./page-user/login.html";
  });
};
