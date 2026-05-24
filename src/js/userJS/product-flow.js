import { API, el, state, luuGioHang, capNhatSoLuongGioHang, productDetailUrl, isInPageUser } from "./core.js";
import { formatCurrency, getOldPrice, getDiscountPercent, getRating, renderStars, showToast, getImageUrl } from "./ui-flow.js";

const getQuantity = (product) => {
  return Number(product.quantity ?? 10);
};

window.themVaoGioHang = (id) => {
  const sp = state.danhSachSP.find(p => p.id == id);
  if (!sp) return;

  const quantity = getQuantity(sp);

  if (quantity <= 0) {
    alert(`Sản phẩm ${sp.name} đã hết hàng!`);
    return;
  }

  const exist = state.gioHang.find(i => i.id == id);

  if (exist) {
    if (exist.soLuong + 1 > quantity) {
      alert(`Sản phẩm: ${sp.name} ko đủ số lượng!`);
      return;
    }

    exist.soLuong++;
  } else {
    state.gioHang.push({ ...sp, soLuong: 1 });
  }

  luuGioHang();
  capNhatSoLuongGioHang();
  showToast(`Đã thêm ${sp.name} vào giỏ hàng`);
};

export const renderDanhSachSP = (list) => {
  if (!el.danhSachSP) return;
  state.activeList = [...list];
  const totalPages = Math.ceil(list.length / state.itemsPerPage);
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const currentItems = list.slice(start, start + state.itemsPerPage);
  if (el.productCountLabel) el.productCountLabel.textContent = `Hiển thị ${currentItems.length}/${list.length} sản phẩm`;
  if (!list.length) {
    el.danhSachSP.innerHTML = `
    <div class="col-span-full py-20 text-center bg-white rounded-[2rem] border">
      <h3 class="text-xl font-black">Không tìm thấy sản phẩm</h3>
      <p class="text-slate-400 mt-2">Hãy thử từ khóa khác.</p>
    </div>`;
    renderPagination(0); return;
  }
  el.danhSachSP.innerHTML = currentItems.map(p => {
    const rating = getRating(p.id), oldPrice = getOldPrice(p.price), discount = getDiscountPercent(p.price), isWish = state.wishlist.includes(String(p.id));
    const quantity = getQuantity(p);
    const isOutOfStock = quantity <= 0;

    const hasGift = p.giftName && p.giftImg && String(p.giftName).trim().toLowerCase() !== "không" &&
    String(p.giftImg).trim().toLowerCase() !== "không";

    return `
      <div class="group bg-white rounded-[2rem] p-5 border border-slate-200 border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 relative overflow-hidden">
        <!-- Link bọc toàn bộ thẻ -->
        <a href="${productDetailUrl(p.id)}" class="block">
          
          <!-- Badge giảm giá -->
          <div class="absolute top-4 left-4 z-10 bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full">
            -${discount}%
          </div>

          <!-- Hình ảnh sản phẩm -->
          <div class="bg-slate-50 rounded-[1.5rem] p-6 mb-5 flex justify-center overflow-hidden h-56">
            <img src="${getImageUrl(p.img)}" class="h-44 object-contain group-hover:scale-110 transition-all duration-500 drop-shadow-xl" alt="${p.name}">
          </div>

          

          <!-- Thông tin sản phẩm -->
          <span class="text-[11px] font-black text-blue-600 uppercase tracking-widest">${p.type}</span>
          <h3 class="font-black text-slate-800 mt-1 line-clamp-2 min-h-12 group-hover:text-blue-600 transition-colors">
            ${p.name}
          </h3>

          

          <!-- Đánh giá -->
          <div class="flex items-center gap-2 my-3">
            <span class="text-amber-400 text-xs tracking-wider">${renderStars(rating)}</span>
            <span class="text-xs text-slate-400 font-bold">${rating}</span>
            ${
              hasGift
                ? `
                  <!-- Gift Section -->
                      <p class="shadow shadow-orange-400 p-1 rounded-lg text-[8px] hover:bg-orange-50 duration-100 font-black text-orange-500 uppercase">
                        Có quà tặng
                      </p>
                `
                : ""
            }
          </div>

          <!-- Giá tiền -->
          <p class="text-red-500 font-black text-xl">${formatCurrency(p.price)}</p>
          <div class="flex items-center gap-2 mt-1">
            <p class="text-slate-400 line-through text-sm font-bold">${formatCurrency(oldPrice)}</p>
            <p class="text-emerald-600 text-xs font-black">Trả góp 0%</p>
          </div>
          
        </a>

        <!-- Nút Wishlist -->
        <button 
          onclick="event.stopPropagation(); toggleWishlist('${p.id}')" 
          class="cursor-pointer absolute top-4 right-4 z-10 w-10 h-10 rounded-full ${isWish ? "bg-rose-500 text-white" : "bg-white text-slate-400"} hover:bg-rose-500 hover:text-white shadow-md font-black transition"
        >
          <i class="fa-solid fa-heart text-sm"></i>
        </button>


        <!-- Nút hành động -->
        ${
          isOutOfStock
            ? `
              <div class="mt-4 py-3 rounded-2xl bg-slate-200 text-slate-500 text-center text-xs font-black cursor-not-allowed">
                HẾT HÀNG
              </div>
            `
            : `
              <div class="grid grid-cols-2 gap-2 mt-4">
                <a href="${isInPageUser() ? `./checkout.html?id=${p.id}` : `./page-user/checkout.html?id=${p.id}`}" class="text-center bg-slate-100 cursor-pointer text-slate-700 font-black py-3 rounded-2xl text-xs hover:bg-slate-200">
                  Mua
                </a>
                <button onclick="themVaoGioHang('${p.id}')" class="bg-blue-600 text-white cursor-pointer font-black py-3 rounded-2xl text-xs hover:bg-blue-700 shadow-lg shadow-blue-100">
                  Thêm giỏ
                </button>
              </div>
            `
        }
      </div>
    `;
  }).join("");
  renderPagination(totalPages);
};

const renderPagination = (total) => {
  let box = document.getElementById("pagination");
  if (!box && el.danhSachSP) { box = document.createElement("div"); box.id = "pagination"; box.className = "flex justify-center gap-2 mt-12 flex-wrap"; el.danhSachSP.after(box); }
  if (!box) return;
  if (total <= 1) { box.innerHTML = ""; return; }
  box.innerHTML = Array.from({ length: total }, (_, i) => `<button onclick="changePage(${i + 1})" class="w-11 h-11 rounded-2xl font-black transition-all cursor-pointer ${i + 1 === state.currentPage ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"}">${i + 1}</button>`).join("");
};

window.changePage = (p) => { state.currentPage = p; renderDanhSachSP(state.activeList); document.getElementById("san-pham")?.scrollIntoView({ behavior: "smooth" }); };

export const layDanhSachSP = async () => {
  el.loading?.classList.remove("hidden");
  if (el.danhSachSP) el.danhSachSP.innerHTML = "";
  try {
    const res = await axios.get(API);
    state.danhSachSP = Array.isArray(res.data) ? res.data : [];
    state.activeList = [...state.danhSachSP];
    renderDanhSachSP(state.danhSachSP);
    capNhatSoLuongGioHang();
  } catch (e) {
    if (el.danhSachSP) el.danhSachSP.innerHTML = `<div class="col-span-full py-20 text-center text-red-500 font-black">Lỗi kết nối API!</div>`;
  } finally {
    el.loading?.classList.add("hidden");
  }
};