import { API, getCurrentUsername, getElement } from "./core.js";
import { getImageUrl } from "./ui-flow.js";

/* ================= STATE DANH GIA USER ================= */
/* ----- Luu san pham hien tai va anh dang preview ----- */
let currentProduct = null;
let currentReviewImage = null;

/* ----- ID co dinh cua review mac dinh ----- */
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

/* ================= THONG TIN USER ================= */
/* ----- Lay ten hien thi cua tai khoan dang dang nhap ----- */
const getCurrentUserDisplayName = () => {
  return localStorage.getItem("username") || "Khách hàng";
};

/* ----- Tao avatar chu cai dau cua user ----- */
const getCurrentUserAvatar = () => {
  const name = getCurrentUserDisplayName().trim();
  return name ? name.charAt(0).toUpperCase() : "K";
};

/* ================= QUYEN DANH GIA ================= */
/* ----- Lay cac don hang da giao co chua san pham ----- */
const getProductOrders = (productId) => {
  const username = getCurrentUsername();
  const orders = JSON.parse(localStorage.getItem(`KP_ORDERS_${username}`)) || [];

  return orders.filter((order) => {
    if (order.status !== "Đã giao hàng") return false;

    return (order.items || []).some((item) => String(item.id) === String(productId));
  });
};

/* ----- Kiem tra user da mua san pham thi moi duoc danh gia ----- */
const canReviewProduct = (productId) => {
  if (localStorage.getItem("isLoggedIn") !== "true") return false;

  return getProductOrders(productId).length > 0;
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

/* ----- Loc nhung review dang duoc hien thi cho user ----- */
const getVisibleReviews = (product) => {
  return getReviewsWithDefault(product).filter((review) => !review.hidden);
};

/* ----- Tim review cua user hien tai de sua thay vi tao moi ----- */
const getMyReview = (product) => {
  const username = getCurrentUsername();
  return getReviewsWithDefault(product).find((review) => review.username === username);
};

/* ----- Tinh diem trung binh va tong review dang hien thi ----- */
const calculateReviewStats = (reviews) => {
  const visibleReviews = reviews.filter((review) => !review.hidden);
  const totalReviews = visibleReviews.length;
  const totalStars = visibleReviews.reduce((sum, review) => sum + Number(review.stars || 0), 0);
  const rating = totalReviews ? Number((totalStars / totalReviews).toFixed(1)) : 0;

  return { rating, totalReviews };
};

/* ----- Luu review len API va render lai khu vuc danh gia ----- */
const saveProductReviews = async (product, reviews) => {
  const stats = calculateReviewStats(reviews);
  const updatedProduct = {
    ...product,
    reviews,
    defaultReviewInitialized: true,
    rating: stats.rating,
    totalReviews: stats.totalReviews,
  };

  const response = await fetch(`${API}/${product.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProduct),
  });

  currentProduct = await response.json();
  renderProductReviews(currentProduct);
};

/* ================= UPLOAD ANH REVIEW ================= */
/* ----- Chuyen file anh thanh base64 de luu cung review ----- */
const fileToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
};

/* ================= HIEN THI REVIEW ================= */
/* ----- Render sao dang chu de hien trong danh sach review ----- */
const renderStarsText = (stars) => {
  const value = Number(stars || 0);
  return "★".repeat(value) + "☆".repeat(5 - value);
};

/* ----- Render preview anh va nut xoa anh da chon ----- */
const renderReviewImagePreview = () => {
  const preview = getElement("reviewImagePreview");

  if (!preview) return;

  if (!currentReviewImage) {
    preview.innerHTML = "";
    return;
  }

  preview.innerHTML = `
    <div class="relative w-32 border rounded-2xl p-2">
      <img src="${currentReviewImage}" class="w-full h-24 object-cover rounded-xl" />
      <button type="button" id="btnRemoveReviewImage" class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white font-black">X</button>
    </div>
  `;

  getElement("btnRemoveReviewImage")?.addEventListener("click", () => {
    currentReviewImage = null;
    const input = getElement("reviewImageInput");
    if (input) input.value = "";
    renderReviewImagePreview();
  });
};

/* ================= FORM DANH GIA ================= */
/* ----- Do du lieu review cu vao form khi user sua danh gia ----- */
const fillReviewForm = (review) => {
  getElement("reviewStars").value = review?.stars || "5";
  getElement("reviewTitle").value = review?.title || "";
  getElement("reviewContent").value = review?.content || "";
  currentReviewImage = review?.image || null;
  renderReviewImagePreview();
};

/* ----- Render form them/sua danh gia theo quyen mua hang ----- */
const renderReviewForm = (product) => {
  const box = getElement("reviewFormBox");
  if (!box) return;

  if (!canReviewProduct(product.id)) {
    box.innerHTML = `
      <div class="bg-slate-100 rounded-2xl p-5 font-bold text-slate-500">
        Chỉ khách hàng đã mua sản phẩm này mới được đánh giá.
      </div>
    `;
    return;
  }

  const myReview = getMyReview(product);

  box.innerHTML = `
    <form id="reviewForm" class="bg-slate-200 rounded-2xl p-5 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="font-black">${myReview ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}</h3>
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black cursor-pointer">
          ${myReview ? "Lưu chỉnh sửa" : "Gửi đánh giá"}
        </button>
      </div>

      <select id="reviewStars" class="w-full border rounded-xl px-4 py-3 font-black">
        <option value="5">★★★★★</option>
        <option value="4">★★★★☆</option>
        <option value="3">★★★☆☆</option>
        <option value="2">★★☆☆☆</option>
        <option value="1">★☆☆☆☆</option>
      </select>

      <input id="reviewTitle" class="w-full border rounded-xl px-4 py-3 outline-none" placeholder="Tiêu đề" />
      <textarea id="reviewContent" class="w-full border rounded-xl px-4 py-3 outline-none" rows="4" placeholder="Nội dung đánh giá"></textarea>

      <div>
        <label class="block text-sm font-bold mb-2">Ảnh đánh giá (tối đa 1 ảnh, không bắt buộc)</label>
        <input id="reviewImageInput" type="file" accept="image/*" class="w-full border rounded-xl px-4 py-3 bg-white" />
        <div id="reviewImagePreview" class="mt-3"></div>
      </div>
    </form>
  `;

  fillReviewForm(myReview);

  getElement("reviewImageInput")?.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    currentReviewImage = await fileToBase64(file);
    renderReviewImagePreview();
  });

  getElement("reviewForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitReview(product);
  });
};

/* ----- Gui danh gia moi hoac cap nhat danh gia da ton tai ----- */
const submitReview = async (product) => {
  const title = getElement("reviewTitle").value.trim();
  const content = getElement("reviewContent").value.trim();
  const stars = Number(getElement("reviewStars").value);

  if (!title || !content) {
    alert("Vui lòng nhập tiêu đề và nội dung đánh giá");
    return;
  }

  const username = getCurrentUsername();
  const reviews = getReviewsWithDefault(product);
  const existedReview = reviews.find((review) => review.username === username);
  

  if (existedReview) {
    existedReview.stars = stars;
    existedReview.title = title;
    existedReview.content = content;
    existedReview.image = currentReviewImage;
    existedReview.updatedAt = now;
  } else {
    reviews.push({
      id: "RV" + Date.now(),
      username,
      displayName: getCurrentUserDisplayName(),
      avatar: getCurrentUserAvatar(),
      stars,
      title,
      content,
      image: currentReviewImage,
      hidden: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  await saveProductReviews(product, reviews);
  alert(existedReview ? "Đã cập nhật đánh giá" : "Đã gửi đánh giá");
};

/* ================= DANH SACH REVIEW USER ================= */
/* ----- Render cac review dang hien thi tren trang chi tiet san pham ----- */
const renderReviewList = (product) => {
  const box = getElement("reviewListBox");
  if (!box) return;

  const visibleReviews = getVisibleReviews(product);

  if (visibleReviews.length === 0) {
    box.innerHTML = `
      <div class="bg-slate-200 rounded-2xl p-5 font-bold text-slate-400">
        Chưa có đánh giá hiển thị.
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="space-y-4 ${visibleReviews.length > 3 ? "max-h-[430px] overflow-y-auto pr-2" : ""}">
      ${visibleReviews.map((review) => `
        <div class="bg-slate-200 rounded-2xl p-5">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shrink-0">
              ${review.avatar || "K"}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <b>${review.displayName || review.username}</b>
                <span class="text-xs font-bold text-slate-400">${review.updatedAt || review.createdAt}</span>
              </div>
              <p class="text-amber-400 text-sm mt-1">${renderStarsText(review.stars)}</p>
              <h3 class="font-black mt-2">${review.title}</h3>
              <p class="text-sm text-slate-600 mt-1 whitespace-pre-line">${review.content}</p>
              ${review.image ? `<img src="${review.image}" class="mt-3 w-32 h-32 object-cover rounded-2xl border" />` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
};

/* ================= KHOI TAO KHU VUC DANH GIA ================= */
/* ----- Render thong ke, form va danh sach review cua san pham ----- */
export const renderProductReviews = (product) => {
  currentProduct = product;

  const section = getElement("productReviewSection");
  if (!section) return;

  const stats = calculateReviewStats(getReviewsWithDefault(product));

  section.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <p class="text-blue-600 text-xs font-black uppercase tracking-widest">
          Đánh giá & phản hồi
        </p>
        <h2 class="text-3xl font-black mt-1">Khách hàng nói gì?</h2>
      </div>
      <div class="text-left md:text-right">
        <p class="text-3xl font-black text-amber-500">${stats.rating || 0}/5★</p>
        <p class="text-sm font-bold text-slate-400">${stats.totalReviews} đánh giá hiển thị</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-5 gap-6">
      <div id="reviewFormBox" class="lg:col-span-2"></div>
      <div id="reviewListBox" class="lg:col-span-3"></div>
    </div>
  `;

  renderReviewForm(product);
  renderReviewList(product);
};
