/* ============================================ IMPORT MODULES / HÀM CHỨC NĂNG ============================================ */

// import { API, state, luuWishlist, el } from "./core.js";

import { API, state, luuWishlist, el, getUserWishlistKey } from "./core.js";
import { getImageUrl, formatCurrency, capNhatWishlist } from "./ui-flow.js";

/* ============================================ KHỞI TẠO POPUP WISHLIST ============================================ */

export const initWishlistPopup = () => {

  /* Kiểm tra các DOM cần thiết có tồn tại không */
  if (!el.popupWishlist || !el.overlayWishlist || !el.btnCloseWishlist || !el.btnWishlist || !el.wishlistContent) return;

  /* LẤY DANH SÁCH SẢN PHẨM NẾU CHƯA CÓ */
  const layDanhSachSanPhamNeuCan = async () => {
    if (state.danhSachSP.length > 0) {
      return;
    }

    try {
      const res = await axios.get(API);
      state.danhSachSP = Array.isArray(res.data)
        ? res.data
        : [];
    } catch (error) {
      state.danhSachSP = [];
    }
  };


  /* RENDER DANH SÁCH SẢN PHẨM YÊU THÍCH */
  const renderWishlist = async () => {
    /* Đảm bảo có danh sách sản phẩm để đối chiếu id wishlist */
    await layDanhSachSanPhamNeuCan();

    /* Lấy danh sách id sản phẩm yêu thích theo từng tài khoản */
    const wishlistIds = JSON.parse(localStorage.getItem(getUserWishlistKey())) || [];

    /* Đồng bộ wishlist từ localStorage vào state */
    state.wishlist = wishlistIds;

    /* Cập nhật số lượng badge wishlist */
    capNhatWishlist();

    /* TRƯỜNG HỢP CHƯA CÓ SẢN PHẨM YÊU THÍCH */
    if (wishlistIds.length === 0) {
      el.wishlistContent.innerHTML = `
        <div class="text-center py-12">
          <div class="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-4"> <i class="fa-solid fa-heart"></i> </div>
          <h3 class="text-xl font-black text-slate-800">
            Chưa có sản phẩm yêu thích
          </h3>
          <p class="text-sm text-slate-400 mt-2">
            Hãy bấm nút trái tim trên sản phẩm để thêm vào danh sách yêu thích.
          </p>
        </div>
      `;
      return;
    }

    /* TÌM THÔNG TIN SẢN PHẨM THEO ID WISHLIST */
    const products = wishlistIds.map((id) => {
      return state.danhSachSP.find((product) => product.id == id);
    }).filter(Boolean);

    /* TRƯỜNG HỢP ID WISHLIST CÓ NHƯNG KHÔNG TÌM THẤY SẢN PHẨM */
    if (products.length === 0) {
      el.wishlistContent.innerHTML = `
        <p class="text-center text-slate-400 font-bold py-10">
          Không tìm thấy sản phẩm yêu thích trong dữ liệu hiện tại.
        </p>
      `;
      return;
    }

    /* HIỂN THỊ DANH SÁCH SẢN PHẨM YÊU THÍCH */
    el.wishlistContent.innerHTML = products.map((product) => {
      return `
        <div class="flex items-center gap-4 border border-slate-100 rounded-2xl p-4">
          <div class="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
            <img src="${getImageUrl(product.img)}" class="w-16 h-16 object-contain" alt="${product.name}"/>
          </div>

          <div class="flex-1">
            <h3 class="font-black text-slate-900 line-clamp-2">
              ${product.name}
            </h3>
            <p class="text-blue-600 font-black mt-1">
              ${formatCurrency(product.price)}
            </p>
          </div>

          <button class="btnRemoveWishlist px-4 py-2 rounded-xl bg-red-500 cursor-pointer duration-100 hover:bg-red-600 text-white font-bold" data-id="${product.id}">
            Xóa
          </button>
        </div>
      `;
    }).join("");


    /* XÓA SẢN PHẨM KHỎI WISHLIST */
    const removeButtons = el.wishlistContent.querySelectorAll(".btnRemoveWishlist");

    removeButtons.forEach((button) => {
      button.addEventListener("click", () => {

        /* Lấy id sản phẩm cần xóa */
        const productId = button.dataset.id;

        /* Xóa id sản phẩm khỏi state wishlist */
        state.wishlist = state.wishlist.filter((id) => {
          return id != productId;
        });

        /* Lưu wishlist mới vào localStorage */
        luuWishlist();

        /* Cập nhật badge wishlist */
        capNhatWishlist();

        /* Render lại popup wishlist */
        renderWishlist();
      });
    });
  };

  /* MỞ POPUP WISHLIST */
  el.btnWishlist.forEach((btn) => {
    btn.addEventListener("click", () => {
      el.popupWishlist.classList.remove("hidden");
      renderWishlist();
    });
  });

  /* ĐÓNG POPUP WISHLIST KHI CLICK OVERLAY */
  overlayWishlist.addEventListener("click", () => {
    popupWishlist.classList.add("hidden");
  });

  /* ĐÓNG POPUP WISHLIST KHI CLICK NÚT X */
  btnCloseWishlist.addEventListener("click", () => {
    popupWishlist.classList.add("hidden");
  });
};