import { el, state, luuWishlist, isInPageUser } from "./core.js";

export const getImageUrl = (img) => {
  if (!img) {
    return "";
  }

  const value = String(img).trim();

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;

  const hasExtension = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(value);
  const imagePath = hasExtension ? value : `${value}.png`;
  const fileName = imagePath.split("/").pop();
  const prefix = isInPageUser() ? "../images/" : "./images/";
  return `${prefix}${fileName}`;
};

export const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN") + " đ";
export const getOldPrice = (price) => Math.round(Number(price || 0) * 1.14);
export const getDiscountPercent = (price) => Math.round(((getOldPrice(price) - Number(price)) / getOldPrice(price)) * 100);
export const getRating = (id) => [4.6, 4.7, 4.8, 4.9, 5.0][Number(id) % 5] || 4.8;
export const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? "★" : "☆").join("");

export const showToast = (message, type = "success") => {
  if (!el.toastContainer) return;
  const color = type === "error" ? "bg-red-50 text-red-700 border-red-100" : type === "warning" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100";
  const toast = document.createElement("div");
  toast.className = `min-w-72 max-w-sm p-4 rounded-2xl border shadow-xl ${color} translate-x-8 opacity-0 transition-all duration-300`;
  toast.innerHTML = `<div class="flex gap-3"><b>${type === "error" ? "!" : "✓"}</b><p class="text-sm font-bold">${message}</p></div>`;
  el.toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.remove("translate-x-8", "opacity-0"), 20);
  setTimeout(() => { toast.classList.add("translate-x-8", "opacity-0"); setTimeout(() => toast.remove(), 300); }, 2500);
};

export const capNhatWishlist = () => {
  el.badgeWishlist.forEach((badgeWishlist) => {
     badgeWishlist.textContent = state.wishlist.length;
  })
};


window.toggleWishlist = (id) => {
  const sp = state.danhSachSP.find(p => p.id == id);
  const strId = String(id);
  if (state.wishlist.includes(strId)) {
    state.wishlist = state.wishlist.filter(x => x !== strId);
    showToast(`Đã bỏ ${sp?.name || "sản phẩm"} khỏi yêu thích`, "warning");
  } else {
    state.wishlist.push(strId);
    showToast(`Đã thêm ${sp?.name || "sản phẩm"} vào yêu thích`);
  }
  luuWishlist();
  capNhatWishlist();
};


export const initCarousel = () => {
  if (!el.carouselTrack ||!el.btnPrevSlide ||!el.btnNextSlide ||!el.carouselDots) return;

  const carouselItems = el.carouselTrack.children;
  let autoSlide = null;
  let isDragging = false;
  let startX = 0;
  let dragDistance = 0;
  // update position
  const updateCarouselPosition = () => {
    el.carouselTrack.style.transition = "transform 0.7s ease-out";
    el.carouselTrack.style.transform =
      `translateX(-${state.currentSlide * 100}%)`;
    updateDots();
  };

  // update dot
  const updateDots = () => {
    const dotItems =
      el.carouselDots.querySelectorAll(".dot-item");
    dotItems.forEach((dot) => {
      dot.classList.remove("w-8", "bg-white");
      dot.classList.add("w-3", "bg-white/40");
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

  // create dot
  const createDots = () => {
    el.carouselDots.innerHTML = "";
    for (let index = 0; index < carouselItems.length; index++) {
      const dot = document.createElement("button");
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

  // auto slide
  const startAutoSlide = () => {
    return setInterval(() => {
      state.currentSlide++;
      if (state.currentSlide > carouselItems.length - 1) {
        state.currentSlide = 0;
      }
      updateCarouselPosition();
    }, 4000);
  };

  // next slider
  const nextSlide = () => {
    state.currentSlide++;
    if (state.currentSlide > carouselItems.length - 1) {
      state.currentSlide = 0;
    }
    updateCarouselPosition();
  };

  // prev slider
  const prevSlide = () => {
    state.currentSlide--;
    if (state.currentSlide < 0) {
      state.currentSlide = carouselItems.length - 1;
    }
    updateCarouselPosition();
  };

  // start drag
  const startDrag = (event) => {
    clearInterval(autoSlide);
    isDragging = true;
    startX = event.clientX;
    dragDistance = 0;
    el.carouselTrack.style.transition = "none";
    el.carouselTrack.style.cursor = "grabbing";
  };

  // dragging
  const dragging = (event) => {
    if (!isDragging) {
      return;
    }
    dragDistance = event.clientX - startX;
    const carouselWidth = el.carouselTrack.offsetWidth;
    let dragPercent = (dragDistance / carouselWidth) * 100;

    // hiệu ứng dây thun khi đang ở slide đầu mà kéo ngược
    if (state.currentSlide === 0 && dragDistance > 0) {
      dragPercent = dragPercent * 0.25;
    }

    // hiệu ứng dây thun khi đang ở slide cuối mà kéo tiếp
    if (state.currentSlide === carouselItems.length - 1 && dragDistance < 0) {
      dragPercent = dragPercent * 0.25;
    }

    const translateValue =
      -state.currentSlide * 100 + dragPercent;
    el.carouselTrack.style.transform =
      `translateX(${translateValue}%)`;
  };

  // end drag
  const endDrag = () => {
    if (!isDragging) {
      return;
    }
    isDragging = false;
    el.carouselTrack.style.cursor = "grab";
    const minDrag = 80;

    // kéo sang trái -> slide tiếp theo
    if (dragDistance < -minDrag && state.currentSlide < carouselItems.length - 1) {
      state.currentSlide++;
    }

    // kéo sang phải -> slide trước đó
    if (dragDistance > minDrag && state.currentSlide > 0) {
      state.currentSlide--;
    }
    updateCarouselPosition();
    autoSlide = startAutoSlide();
  };

  // add event btnNextSlide and btnPrevSlide
  el.btnNextSlide.addEventListener("click", () => {
    clearInterval(autoSlide);
    nextSlide();
    autoSlide = startAutoSlide();
  });

  el.btnPrevSlide.addEventListener("click", () => {
    clearInterval(autoSlide);
    prevSlide();
    autoSlide = startAutoSlide();
  });

  // add event drag mouse
  el.carouselTrack.addEventListener("mousedown", startDrag);
  el.carouselTrack.addEventListener("mousemove", dragging);
  el.carouselTrack.addEventListener("mouseup", endDrag);
  el.carouselTrack.addEventListener("mouseleave", endDrag);
  el.carouselTrack.style.cursor = "grab";
  createDots();
  updateCarouselPosition();
  autoSlide = startAutoSlide();
};


export const initSaleCountdown = () => {
  if (!el.saleHour) return;
  const update = () => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const diff = end - now;
    el.saleHour.textContent = String(Math.floor(diff / 3600000)).padStart(2, "0");
    el.saleMinute.textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, "0");
    el.saleSecond.textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
  };
  update(); setInterval(update, 1000);
};

window.closeOrOpenMenuMobile = () => {
  el.contentMenuMobile.classList.toggle("hidden")
}

export const closeMenuMobileByWidthScreen = () => {
  window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
          el.contentMenuMobile.classList.add('hidden');
      }
  });
}