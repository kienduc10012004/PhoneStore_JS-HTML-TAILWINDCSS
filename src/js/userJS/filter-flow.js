/* ================= IMPORT MODULES ================= */
import { el, state, getBrands, selectElements } from "./core.js";
import { renderDanhSachSP } from "./product-flow.js";

/* ================= RENDER FILTER HÃNG USER ================= */
export const renderUserBrandFilter = () => {

  /* Lấy danh sách hãng từ localStorage */
  const brands = getBrands();

  /* Render select chọn hãng */
  if (el.filterSP) {
    el.filterSP.innerHTML = `
      <option value="">Tất cả hãng</option>
    `;

    brands.forEach((brand) => {
      el.filterSP.innerHTML += `
        <option value="${brand}">
          ${brand}
        </option>
      `;
    });
  }

  /* Render quick brand button */
  if (el.quickBrandList) {
    el.quickBrandList.innerHTML = `
      <button
        data-brand=""
        class="cursor-pointer quick-brand active shrink-0 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-black"
      >
        Tất cả
      </button>
    `;

    brands.forEach((brand) => {
      el.quickBrandList.innerHTML += `
        <button
          data-brand="${brand}"
          class="cursor-pointer quick-brand shrink-0 px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 duration-200 text-xs font-black"
        >
          ${brand}
        </button>
      `;
    });
  }
};

/* ================= LỌC / TÌM KIẾM / SẮP XẾP SẢN PHẨM ================= */
export const filterSP = () => {

  /* Lấy giá trị tìm kiếm */
  const keyword = el.searchSP?.value.toLowerCase().trim() || "";

  /* Lấy hãng đang chọn */
  const type = el.filterSP?.value.toLowerCase() || "";

  /* Lấy kiểu sắp xếp */
  const sort = el.sortSP?.value || "";

  /* Copy danh sách sản phẩm gốc */
  let result = [...state.danhSachSP];

  /* Lọc theo từ khóa */
  if (keyword) result = result.filter(p => (p.name || "").toLowerCase().includes(keyword) || (p.desc || "").toLowerCase().includes(keyword) || (p.type || "").toLowerCase().includes(keyword));

  /* Lọc theo hãng */
  if (type) result = result.filter(p => (p.type || "").toLowerCase() === type);

  /* Sắp xếp giá tăng dần */
  if (sort === "asc") result.sort((a, b) => Number(a.price) - Number(b.price));

  /* Sắp xếp giá giảm dần */
  if (sort === "desc") result.sort((a, b) => Number(b.price) - Number(a.price));

  /* Reset về trang đầu tiên */
  state.currentPage = 1;

  /* Render lại danh sách sản phẩm */
  renderDanhSachSP(result);

  /* Cập nhật trạng thái active quick brand */
  updateQuickBrandActive();
};

/* ================= CẬP NHẬT ACTIVE QUICK BRAND ================= */
const updateQuickBrandActive = () => {
  selectElements(".quick-brand").forEach(btn => {

    /* Kiểm tra button nào đang được chọn */
    const active = btn.dataset.brand === (el.filterSP?.value || "");

    /* Đổi style theo trạng thái active */
    btn.className = active ? "quick-brand cursor-pointer active shrink-0 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-black" : "quick-brand cursor-pointer shrink-0 px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 text-xs font-black";
  });
};

/* ================= GẮN SỰ KIỆN FILTER ================= */
export const bindFilterEvent = () => {

  /* Tìm kiếm sản phẩm có debounce */
  el.searchSP?.addEventListener("input", () => { clearTimeout(state.timerId); state.timerId = setTimeout(filterSP, 400); });

  /* Lọc theo hãng */
  el.filterSP?.addEventListener("change", filterSP);

  /* Sắp xếp giá */
  el.sortSP?.addEventListener("change", filterSP);

  /* Xóa toàn bộ bộ lọc */
  el.btnClearFilters?.addEventListener("click", () => { el.searchSP.value = ""; el.filterSP.value = ""; el.sortSP.value = ""; state.currentPage = 1; renderDanhSachSP(state.danhSachSP); updateQuickBrandActive(); });

  /* Click quick brand để lọc nhanh */
  el.quickBrandList?.addEventListener("click", e => { const btn = e.target.closest(".quick-brand"); if (!btn) return; el.filterSP.value = btn.dataset.brand; filterSP(); });
};