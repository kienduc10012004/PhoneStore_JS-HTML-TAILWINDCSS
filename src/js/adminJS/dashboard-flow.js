/* ================= IMPORT MODULES ================= */
import { API_URL, dom, state, formatCurrency, getBrands } from "./core.js";
import { showAdminLoading, hideAdminLoading } from "./ui-flow.js";

/* ================= GOM NHÓM SẢN PHẨM THEO HÃNG ================= */
/* ----- Tao object thong ke so luong va tong gia theo tung hang ----- */
const groupProductsByBrand = (products) => {
  const result = {};
  const brands = getBrands();

  /* Khởi tạo dữ liệu thống kê cho từng hãng */
  brands.forEach((brand) => {
    result[brand] = {
      count: 0,
      totalPrice: 0
    };
  });

  /* Thống kê số lượng và tổng giá theo hãng */
  products.forEach((product) => {
    const brand = product.type || "Khác";

    if (!result[brand]) {
      result[brand] = {
        count: 0,
        totalPrice: 0
      };
    }

    result[brand].count++;
    result[brand].totalPrice += Number(product.price || 0);
  });

  return result;
};

/* ================= RENDER THANH BIỂU ĐỒ ĐƠN GIẢN ================= */
/* ----- Render bieu do thanh bang HTML de hien thi thong ke dashboard ----- */
const renderSimpleBar = (
  container,
  labels,
  values,
  suffix = ""
) => {
  if (!container) return;

  const maxValue = Math.max(...values, 1);

  container.innerHTML = labels.map((label, index) => {
    const percent = Math.round(
      (values[index] / maxValue) * 100
    );

    return `
      <div class="mb-4">
        <div class="flex justify-between text-sm font-bold mb-1">
          <span>${label}</span>
          <span>${values[index].toLocaleString("vi-VN")}${suffix}</span>
        </div>

        <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-indigo-600 rounded-full"
            style="width:${percent}%"
          ></div>
        </div>
      </div>
    `;
  }).join("");
};

/* ================= KHỞI TẠO DASHBOARD ================= */
/* ----- Tai du lieu san pham va render toan bo thong ke dashboard ----- */
export const initDashboard = async () => {
  if (!dom.totalProducts) return;

  showAdminLoading();

  /* ================= LẤY DANH SÁCH SẢN PHẨM TỪ API ================= */
  try {
    const response = await axios.get(API_URL);

    state.danhSachSP = Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    alert("Không tải được dữ liệu dashboard");

    state.danhSachSP = [];
  } finally {
    hideAdminLoading();
  }

  /* ----- Danh sach san pham sau khi tai tu API ----- */
  const products = state.danhSachSP;

  /* ================= THỐNG KÊ THEO HÃNG ================= */
  /* ----- Gom san pham theo hang de tinh so luong va gia trung binh ----- */
  const brandStats =
    groupProductsByBrand(products);

  const brands =
    Object.keys(brandStats);

  /* ================= TÌM SẢN PHẨM ĐẶC BIỆT ================= */
  /* ----- Tim san pham gia cao nhat, thap nhat va moi nhat ----- */
  const highest = [...products].sort((a, b) => {
    return Number(b.price) - Number(a.price);
  })[0];

  const lowest = [...products].sort((a, b) => {
    return Number(a.price) - Number(b.price);
  })[0];

  const newest =
    products[products.length - 1];

  /* ================= HIỂN THỊ THỐNG KÊ TỔNG QUAN ================= */
  /* ----- Gan cac gia tri thong ke tong quan vao card dashboard ----- */
  dom.totalProducts.textContent =
    products.length;

  dom.totalBrands.textContent =
    brands.length;

  dom.highestProduct.textContent =
    highest
      ? `${highest.name} - ${formatCurrency(highest.price)}`
      : "Chưa có";

  dom.lowestProduct.textContent =
    lowest
      ? `${lowest.name} - ${formatCurrency(lowest.price)}`
      : "Chưa có";

  dom.newestProduct.textContent =
    newest
      ? newest.name
      : "Chưa có";

  /* ================= RENDER BẢNG THỐNG KÊ HÃNG ================= */
  /* ----- Render bang so luong va gia trung binh cua tung hang ----- */
  dom.brandStatsTable.innerHTML =
    brands.map((brand) => {
      const count =
        brandStats[brand].count;

      const avgPrice =
        count === 0
          ? 0
          : brandStats[brand].totalPrice / count;

      return `
        <tr class="border-b hover:bg-slate-50">
          <td class="p-4 font-bold">
            ${brand}
          </td>

          <td class="p-4 text-center">
            ${count}
          </td>

          <td class="p-4 text-right text-emerald-600 font-bold">
            ${formatCurrency(avgPrice)}
          </td>
        </tr>
      `;
    }).join("");

  /* ================= BIỂU ĐỒ SỐ LƯỢNG SẢN PHẨM THEO HÃNG ================= */
  /* ----- Render bieu do so luong san pham theo hang ----- */
  renderSimpleBar(
    dom.chartByBrand,
    brands,
    brands.map((brand) => {
      return brandStats[brand].count;
    }),
    " sản phẩm"
  );

  /* ================= BIỂU ĐỒ GIÁ TRUNG BÌNH THEO HÃNG ================= */
  /* ----- Render bieu do gia trung binh theo hang ----- */
  renderSimpleBar(
    dom.chartAvgPrice,
    brands,
    brands.map((brand) => {
      return Math.round(
        brandStats[brand].totalPrice /
        brandStats[brand].count
      );
    }),
    " đ"
  );
};
