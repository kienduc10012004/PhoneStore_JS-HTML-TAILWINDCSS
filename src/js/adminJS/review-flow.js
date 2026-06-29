import { API_URL, dom, formatCurrency } from "./core.js";
import { showAppConfirm } from "../shared-dialog.js";
import { getImageUrl } from "./ui-flow.js";

/* ================= STATE QUAN LY REVIEW ================= */
/* ----- Luu danh sach san pham review va san pham dang mo chi tiet ----- */
let reviewProducts = [];
let currentProductId = null;
let currentReviewPage = 1;

/* ----- Cau hinh phan trang va ID review mac dinh ----- */
const REVIEW_ITEMS_PER_PAGE = 10;
const DEFAULT_REVIEW_ID = "DEFAULT_REVIEW";

/* ================= REVIEW MAC DINH ================= */
/* ----- Tao review 5 sao cho san pham chua co danh gia ----- */
const createDefaultReview = () => {
  return {
    id: DEFAULT_REVIEW_ID,
    username: "__default_review__",
    displayName: "Kil1001",
    avatar: "K",
    stars: 5,
    title: "Đánh giá sản phẩm",
    content: "sản phẩm tốt",
    image: null,
    hidden: false,
    createdAt: "22:22:22 22/2/2022",
    updatedAt: "22:22:22 22/2/2022",
  };
};

/* ================= XU LY DU LIEU REVIEW ================= */
/* ----- Lay danh sach review goc tu san pham ----- */
const getReviews = (product) => {
  return Array.isArray(product.reviews) ? product.reviews : [];
};

/* ----- Chen review mac dinh neu san pham chua tung khoi tao review ----- */
const getReviewsWithDefault = (product) => {
  const reviews = getReviews(product);
  const hasDefaultReview = reviews.some((review) => review.id === DEFAULT_REVIEW_ID);

  if (hasDefaultReview || product.defaultReviewInitialized === true) {
    return reviews;
  }

  return [createDefaultReview(), ...reviews];
};

/* ----- Lay nhung review chua bi an ----- */
const getVisibleReviews = (product) => {
  return getReviewsWithDefault(product).filter((review) => !review.hidden);
};

/* ----- Render so sao dang chu trong chi tiet review ----- */
const renderStarsText = (stars) => {
  const value = Number(stars || 0);
  return "★".repeat(value) + "☆".repeat(5 - value);
};

/* ----- Tinh diem trung binh va tong review dang hien thi ----- */
const calculateReviewStats = (reviews) => {
  const visibleReviews = reviews.filter((review) => !review.hidden);
  const totalReviews = visibleReviews.length;
  const totalStars = visibleReviews.reduce((sum, review) => sum + Number(review.stars || 0), 0);
  const rating = totalReviews ? Number((totalStars / totalReviews).toFixed(1)) : 0;

  return { rating, totalReviews };
};

/* ----- Dem so review theo tung muc sao ----- */
const getStarCount = (product, star) => {
  return getVisibleReviews(product).filter((review) => Number(review.stars) === star).length;
};

/* ----- Tim san pham theo id trong danh sach dang quan ly ----- */
const findProduct = (productId) => {
  return reviewProducts.find((product) => String(product.id) === String(productId));
};

/* ----- Luu thay doi review len API va render lai bang quan ly ----- */
const saveProductReviews = async (product, reviews) => {
  const stats = calculateReviewStats(reviews);
  const updatedProduct = {
    ...product,
    reviews,
    defaultReviewInitialized: true,
    rating: stats.rating,
    totalReviews: stats.totalReviews,
  };

  const response = await fetch(`${API_URL}/${product.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProduct),
  });

  const savedProduct = await response.json();
  reviewProducts = reviewProducts.map((item) => {
    return String(item.id) === String(savedProduct.id) ? savedProduct : item;
  });

  renderReviewProducts();

  if (currentProductId) {
    openReviewDetail(currentProductId);
  }
};

/* ================= BANG QUAN LY REVIEW ================= */
/* ----- Render danh sach san pham kem thong ke review ----- */
const renderReviewProducts = () => {
  if (!dom.reviewTableBody) return;

  if (reviewProducts.length === 0) {
    dom.reviewTableBody.innerHTML = `
      <tr>
        <td colspan="11" class="py-10 text-center text-slate-400 font-bold">
          Chưa có dữ liệu sản phẩm
        </td>
      </tr>
    `;
    if (dom.reviewPagination) dom.reviewPagination.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(reviewProducts.length / REVIEW_ITEMS_PER_PAGE);
  if (currentReviewPage > totalPages) currentReviewPage = totalPages;

  const startIndex = (currentReviewPage - 1) * REVIEW_ITEMS_PER_PAGE;
  const currentItems = reviewProducts.slice(
    startIndex,
    startIndex + REVIEW_ITEMS_PER_PAGE
  );

  dom.reviewTableBody.innerHTML = currentItems.map((product) => {
    const stats = calculateReviewStats(getReviewsWithDefault(product));
    const rating = stats.rating;
    const totalReviews = stats.totalReviews;

    return `
      <tr class="border-b hover:bg-slate-50">
        <td class="p-4">
          <img src="${getImageUrl(product.img)}" class="w-14 h-14 object-contain bg-slate-50 rounded-xl" />
        </td>
        <td class="p-4 font-black text-indigo-600">${product.id}</td>
        <td class="p-4 font-bold">${product.name}</td>
        <td class="p-4 text-center font-black text-amber-500">${rating}</td>
        <td class="p-4 text-center font-black">${totalReviews}</td>
        <td class="p-4 text-center">${getStarCount(product, 1)}</td>
        <td class="p-4 text-center">${getStarCount(product, 2)}</td>
        <td class="p-4 text-center">${getStarCount(product, 3)}</td>
        <td class="p-4 text-center">${getStarCount(product, 4)}</td>
        <td class="p-4 text-center">${getStarCount(product, 5)}</td>
        <td class="p-4 text-center">
          <button onclick="openReviewDetail('${product.id}')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold cursor-pointer">
            Chi tiết
          </button>
        </td>
      </tr>
    `;
  }).join("");

  renderReviewPagination();
};

/* ----- Cuon ve dau bang review khi admin doi trang ----- */
const scrollToReviewTop = () => {
  dom.reviewTableBody?.closest(".bg-white")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

/* ----- Render nut phan trang danh sach san pham review ----- */
const renderReviewPagination = () => {
  if (!dom.reviewPagination) return;

  const totalPages = Math.ceil(reviewProducts.length / REVIEW_ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    dom.reviewPagination.innerHTML = "";
    return;
  }

  dom.reviewPagination.innerHTML = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const active = currentReviewPage === page
      ? "bg-indigo-600 text-white shadow-md"
      : "bg-white border hover:bg-slate-100";

    return `
      <button onclick="changeReviewPage(${page})" class="w-9 h-9 rounded-lg font-bold cursor-pointer ${active}">
        ${page}
      </button>
    `;
  }).join("");
};

/* ----- Doi trang va cuon lai dau khu vuc quan ly review ----- */
window.changeReviewPage = (page) => {
  currentReviewPage = page;
  renderReviewProducts();

  requestAnimationFrame(() => {
    scrollToReviewTop();
  });
};

/* ================= CHI TIET REVIEW ================= */
/* ----- Mo popup chi tiet va render toan bo review cua san pham ----- */
window.openReviewDetail = (productId) => {
  currentProductId = productId;
  const product = findProduct(productId);

  if (!product || !dom.reviewDetailContent || !dom.reviewDetailPopup) return;

  const reviews = getReviewsWithDefault(product);
  const stats = calculateReviewStats(reviews);

  dom.reviewDetailContent.innerHTML = `
    <div class="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 mb-5">
      <img src="${getImageUrl(product.img)}" class="w-20 h-20 object-contain bg-white rounded-xl" />
      <div>
        <h3 class="text-xl font-black">${product.name}</h3>
        <p class="font-bold text-slate-500">ID: ${product.id}</p>
        <p class="font-bold text-amber-500">Điểm TB: ${stats.rating || 0} / Tổng đánh giá: ${stats.totalReviews || 0}</p>
        <p class="font-bold text-slate-500">Giá: ${formatCurrency(product.price)}</p>
      </div>
    </div>

    ${
      reviews.length === 0
        ? `<p class="py-10 text-center text-slate-400 font-bold">Sản phẩm này chưa có đánh giá</p>`
        : `
          <div class="space-y-4 ${reviews.length > 5 ? "max-h-[65vh] overflow-y-auto pr-2" : ""}">
            ${reviews.map((review) => `
              <div class="border rounded-2xl p-4 ${review.hidden ? "bg-slate-100 opacity-75" : "bg-white"}">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex gap-3">
                    <div class="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">
                      ${review.avatar || "K"}
                    </div>
                    <div>
                      <p class="font-black">${review.displayName || review.username}</p>
                      <p class="text-xs font-bold text-slate-400">${review.updatedAt || review.createdAt}</p>
                      <p class="text-amber-400 text-sm mt-1">${renderStarsText(review.stars)}</p>
                    </div>
                  </div>

                  <span class="text-xs font-black px-3 py-1 rounded-full ${review.hidden ? "bg-slate-300 text-slate-600" : "bg-emerald-100 text-emerald-600"}">
                    ${review.hidden ? "Đang ẩn" : "Đang hiện"}
                  </span>
                </div>

                <h4 class="font-black mt-3">${review.title}</h4>
                <p class="text-sm text-slate-600 mt-1 whitespace-pre-line">${review.content}</p>
                ${review.image ? `<img src="${review.image}" class="mt-3 w-32 h-32 object-cover rounded-2xl border" />` : ""}

                <div class="flex flex-wrap gap-2 mt-4">
                  <button onclick="toggleReviewVisibility('${product.id}', '${review.id}', true)" class="bg-slate-700 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-bold cursor-pointer">
                    Ẩn
                  </button>
                  <button onclick="toggleReviewVisibility('${product.id}', '${review.id}', false)" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold cursor-pointer">
                    Hiện
                  </button>
                  <button onclick="deleteReview('${product.id}', '${review.id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold cursor-pointer">
                    Xóa
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        `
    }
  `;

  dom.reviewDetailPopup.classList.remove("hidden");
};

/* ================= THAO TAC ADMIN VOI REVIEW ================= */
/* ----- An hoac hien review ma khong xoa du lieu ----- */
window.toggleReviewVisibility = async (productId, reviewId, isHidden) => {
  const product = findProduct(productId);
  if (!product) return;

  const reviews = getReviewsWithDefault(product);
  const review = reviews.find((item) => item.id === reviewId);

  if (!review) return;

  review.hidden = isHidden;
  review.updatedAt = new Date().toLocaleString("vi-VN");

  await saveProductReviews(product, reviews);
};

/* ----- Xoa review khoi du lieu san pham va tinh lai thong ke ----- */
window.deleteReview = async (productId, reviewId) => {
  const isConfirm = await showAppConfirm({
    title: "Xóa đánh giá",
    message: "Bạn có chắc muốn xóa đánh giá này?",
    confirmText: "Xóa",
  });
  if (!isConfirm) return;

  const product = findProduct(productId);
  if (!product) return;

  const reviews = getReviewsWithDefault(product).filter((review) => review.id !== reviewId);
  await saveProductReviews(product, reviews);
};

/* ================= KHOI TAO QUAN LY REVIEW ================= */
/* ----- Tai du lieu san pham va gan su HiKu dong popup chi tiet ----- */
export const initManageReview = async () => {
  if (!dom.reviewTableBody) return;

  try {
    const response = await fetch(API_URL);
    reviewProducts = await response.json();
    renderReviewProducts();
  } catch (error) {
    alert("Không tải được dữ liệu đánh giá");
  }

  dom.btnCloseReviewDetail?.addEventListener("click", () => {
    dom.reviewDetailPopup.classList.add("hidden");
    currentProductId = null;
  });
};
