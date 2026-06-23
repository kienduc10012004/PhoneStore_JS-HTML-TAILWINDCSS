/* ================= IMPORT MODULES ================= */
import { createElement, getElement, pageBody } from "./core.js";
import { getOrders, saveOrders } from "./order-flow.js";

/* ================= KEY LOCALSTORAGE ĐỔI TRẢ ================= */
/* ----- Key luu danh sach yeu cau doi tra cua toan bo user ----- */
const RETURN_STORAGE_KEY = "KP_RETURN_REQUESTS";

/* ================= STATE POPUP ĐỔI TRẢ ================= */
/* ----- Luu don hang va san pham dang duoc user yeu cau doi tra ----- */
let selectedOrderId = null;
let selectedItemKey = null;
let selectedItem = null;
let onAfterSubmit = null;

/* ----- Luu media user upload truoc khi submit yeu cau ----- */
let returnImages = [];
let returnVideo = null;

/* ================= LẤY DANH SÁCH ĐỔI TRẢ ================= */
/* ----- Doc danh sach yeu cau doi tra tu localStorage ----- */
export const getReturnRequests = () => {
  return JSON.parse(localStorage.getItem(RETURN_STORAGE_KEY)) || [];
};

/* ================= LƯU DANH SÁCH ĐỔI TRẢ ================= */
/* ----- Ghi lai danh sach yeu cau doi tra vao localStorage ----- */
export const saveReturnRequests = (requests) => {
  localStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(requests));
};

/* ================= TẠO KEY RIÊNG CHO SẢN PHẨM TRONG ĐƠN ================= */
/* ----- Tao key duy nhat cho tung san pham trong mot don hang ----- */
export const createReturnItemKey = (orderId, item) => {
  return `${orderId}_${item.id}_${item.selectedCapacity || ""}_${item.selectedColor || ""}`;
};

/* ================= KIỂM TRA SẢN PHẨM ĐÃ GỬI ĐỔI TRẢ CHƯA ================= */
/* ----- Kiem tra san pham trong don da co yeu cau doi tra chua ----- */
export const hasReturnRequest = (orderId, item) => {
  const itemKey = createReturnItemKey(orderId, item);

  return getReturnRequests().some((request) => {
    return request.orderId === orderId && request.itemKey === itemKey;
  });
};

/* ----- Lay yeu cau doi tra theo key san pham trong don ----- */
export const getReturnRequestByItemKey = (orderId, itemKey) => {
  return getReturnRequests().find((request) => {
    return request.orderId === orderId && request.itemKey === itemKey;
  });
};

/* ================= TẠO POPUP ĐỔI TRẢ ================= */
/* ----- Tao HTML popup doi tra mot lan duy nhat khi khoi tao ----- */
const createReturnPopup = () => {
  if (getElement("returnPopup")) return;

  pageBody.insertAdjacentHTML(
    "beforeend",
    `
    <div id="returnPopup" class="hidden fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-2xl rounded-3xl p-3">
        <div class=" max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-5">
              <h2 class="text-xl font-black">Yêu cầu đổi trả sản phẩm</h2>
              <button id="btnCloseReturnPopup" class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-500 hover:text-white font-black duration-100 cursor-pointer">
                X
              </button>
            </div>

            <div id="returnProductInfo" class="mb-5"></div>

            <div class="space-y-4">
              <div>
                <label class="font-bold">Lý do đổi trả <span class="text-red-500">*</span></label>
                <select id="returnReason" class="w-full mt-2 border rounded-xl px-4 py-3">
                  <option value="">Chọn lý do</option>
                  <option value="Sản phẩm bị lỗi">Sản phẩm bị lỗi</option>
                  <option value="Không đúng mô tả">Không đúng mô tả</option>
                  <option value="Giao sai sản phẩm">Giao sai sản phẩm</option>
                  <option value="Muốn đổi size">Muốn đổi size</option>
                  <option value="Muốn đổi màu">Muốn đổi màu</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
                <p id="returnReasonError" class="hidden text-red-500 text-sm font-bold mt-1"></p>
              </div>

              <div id="otherReasonBox" class="hidden">
                <label class="font-bold">Nhập lý do khác</label>
                <textarea id="otherReturnReason" class="w-full mt-2 border rounded-xl px-4 py-3" rows="3"></textarea>
              </div>

              <div>
                <label class="font-bold">Mô tả thêm</label>
                <textarea id="returnDescription" class="w-full mt-2 border rounded-xl px-4 py-3" rows="4" placeholder="Mô tả tình trạng sản phẩm..."></textarea>
              </div>

              <div>
                <label class="font-bold">Ảnh minh chứng tối đa 3 ảnh</label>
                <input id="returnImagesInput" type="file" accept="image/*" multiple class="w-full mt-2 border rounded-xl px-4 py-3">
                <div id="returnImagesPreview" class="grid grid-cols-3 gap-3 mt-3"></div>
              </div>

              <div>
                <label class="font-bold">Video minh chứng tối đa 1 video, dưới 20 giây</label>
                <input id="returnVideoInput" type="file" accept="video/*" class="w-full mt-2 border rounded-xl px-4 py-3">
                <div id="returnVideoPreview" class="mt-3"></div>
              </div>

              <button id="btnSubmitReturn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black">
                GỬI YÊU CẦU ĐỔI TRẢ
              </button>
            </div>
          </div>
        </div>
    </div>
    `
  );
};

/* ================= CHUYỂN FILE SANG BASE64 ================= */
/* ----- Chuyen anh/video sang base64 de luu vao localStorage ----- */
const fileToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
};

/* ================= RENDER PREVIEW ẢNH ================= */
/* ----- Hien thi danh sach anh minh chung user da chon ----- */
const renderImagePreview = () => {
  const box = getElement("returnImagesPreview");

  box.innerHTML = returnImages.map((image, index) => {
    return `
      <div class="relative border rounded-2xl p-2">
        <img src="${image.data}" class="w-full h-24 object-cover rounded-xl">
        <button
          onclick="removeReturnImage(${index})"
          class="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500 text-white font-bold"
        >
          X
        </button>
      </div>
    `;
  }).join("");
};

/* ================= XÓA ẢNH PREVIEW ================= */
/* ----- Xoa mot anh khoi danh sach preview truoc khi submit ----- */
window.removeReturnImage = (index) => {
  returnImages.splice(index, 1);
  renderImagePreview();
};

/* ================= RENDER PREVIEW VIDEO ================= */
/* ----- Hien thi video minh chung user da chon ----- */
const renderVideoPreview = () => {
  const box = getElement("returnVideoPreview");

  if (!returnVideo) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `
    <div class="relative border rounded-2xl p-3">
      <video src="${returnVideo.data}" controls class="w-full rounded-xl"></video>
      <button
        onclick="removeReturnVideo()"
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white font-bold"
      >
        X
      </button>
    </div>
  `;
};

/* ================= XÓA VIDEO PREVIEW ================= */
/* ----- Xoa video khoi preview truoc khi submit ----- */
window.removeReturnVideo = () => {
  returnVideo = null;
  getElement("returnVideoInput").value = "";
  renderVideoPreview();
};

/* ================= MỞ POPUP ĐỔI TRẢ ================= */
/* ----- Nap thong tin san pham va mo popup doi tra ----- */
export const openReturnPopup = (orderId, itemKey, callback) => {
  const orders = getOrders();
  const order = orders.find((item) => item.id === orderId);

  if (!order) return;

  selectedOrderId = orderId;
  selectedItemKey = itemKey;
  selectedItem = order.items.find((item) => {
    return createReturnItemKey(orderId, item) === itemKey;
  });

  if (!selectedItem) return;

  onAfterSubmit = callback;
  returnImages = [];
  returnVideo = null;

  getElement("returnProductInfo").innerHTML = `
    <div class="flex gap-4 items-center bg-slate-50 rounded-2xl p-4">
      <img src="${selectedItem.img}" class="w-20 h-20 object-contain bg-white rounded-xl">
      <div>
        <h3 class="font-black">${selectedItem.name}</h3>
        <p class="text-sm text-slate-500">Số lượng: ${selectedItem.soLuong}</p>
        <p class="text-sm text-blue-600 font-bold">Dung lượng: ${selectedItem.selectedCapacity || "Chưa chọn"}</p>
        <p class="text-sm text-orange-500 font-bold">Màu sắc: ${selectedItem.selectedColor || "Chưa chọn"}</p>
      </div>
    </div>
  `;

  getElement("returnReason").value = "";
  getElement("otherReturnReason").value = "";
  getElement("returnDescription").value = "";
  getElement("otherReasonBox").classList.add("hidden");

  renderImagePreview();
  renderVideoPreview();

  getElement("returnPopup").classList.remove("hidden");
};

/* ================= ĐÓNG POPUP ================= */
/* ----- Dong popup doi tra user ----- */
const closeReturnPopup = () => {
  getElement("returnPopup")?.classList.add("hidden");
};

/* ================= SUBMIT YÊU CẦU ĐỔI TRẢ ================= */
/* ----- Validate va luu yeu cau doi tra moi cua user ----- */
const submitReturnRequest = () => {
  const orders = getOrders();
  const order = orders.find((item) => item.id === selectedOrderId);

  if (!order || !selectedItem) return;

  const reasonSelect = getElement("returnReason");
  const otherReason = getElement("otherReturnReason").value.trim();
  const description = getElement("returnDescription").value.trim();

  getElement("returnReasonError").classList.add("hidden");

  if (!reasonSelect.value) {
    getElement("returnReasonError").textContent = "Vui lòng chọn lý do đổi trả";
    getElement("returnReasonError").classList.remove("hidden");
    return;
  }

  if (reasonSelect.value === "Lý do khác" && !otherReason) {
    getElement("returnReasonError").textContent = "Vui lòng nhập lý do khác";
    getElement("returnReasonError").classList.remove("hidden");
    return;
  }

  if (hasReturnRequest(selectedOrderId, selectedItem)) {
    alert("Sản phẩm này đã gửi yêu cầu đổi trả");
    return;
  }

  const requests = getReturnRequests();

  const now = new Date().toLocaleString("vi-VN");
  const requestData = {
    id: "RT" + Date.now(),
    orderId: selectedOrderId,
    itemKey: selectedItemKey,
    username: localStorage.getItem("username") || "guest",
    customer: order.customer,
    product: selectedItem,
    reason: reasonSelect.value === "Lý do khác" ? otherReason : reasonSelect.value,
    requestType: "Đổi trả",
    description: description || "Không có",
    images: returnImages,
    video: returnVideo,
    status: "Chờ duyệt",
    refundStatus: "Chưa hoàn tiền",
    stockReturned: false,
    rejectReason: "",
    createdAt: now,
    updatedAt: now
  };

  requests.push(requestData);

  const orderItem = order.items.find((item) => {
    return createReturnItemKey(selectedOrderId, item) === selectedItemKey;
  });

  if (orderItem) {
    orderItem.returnRequest = requestData;
  }

  saveReturnRequests(requests);
  saveOrders(orders);

  alert("Đã gửi yêu cầu đổi trả");

  closeReturnPopup();

  if (typeof onAfterSubmit === "function") {
    onAfterSubmit();
  }
};

/* ================= KHỞI TẠO CHỨC NĂNG ĐỔI TRẢ USER ================= */
/* ----- Tao popup, gan event upload media va gan ham mo popup global ----- */
export const initReturnFeature = (callback) => {
  createReturnPopup();

  getElement("btnCloseReturnPopup")?.addEventListener("click", closeReturnPopup);

  getElement("returnReason")?.addEventListener("change", (event) => {
    if (event.target.value === "Lý do khác") {
      getElement("otherReasonBox").classList.remove("hidden");
    } else {
      getElement("otherReasonBox").classList.add("hidden");
    }
  });

  getElement("returnImagesInput")?.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files);

    if (returnImages.length + files.length > 3) {
      alert("Chỉ được upload tối đa 3 ảnh");
      event.target.value = "";
      return;
    }

    for (let file of files) {
      const data = await fileToBase64(file);
      returnImages.push({
        name: file.name,
        type: file.type,
        data
      });
    }

    renderImagePreview();
  });

  getElement("returnVideoInput")?.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    const video = createElement("video");

    video.preload = "metadata";
    video.src = videoUrl;

    video.onloadedmetadata = async () => {
      URL.revokeObjectURL(videoUrl);

      if (video.duration > 20) {
        alert("Video phải dưới 20 giây");
        event.target.value = "";
        return;
      }

      const data = await fileToBase64(file);

      returnVideo = {
        name: file.name,
        type: file.type,
        data
      };

      renderVideoPreview();
    };
  });

  getElement("btnSubmitReturn")?.addEventListener("click", submitReturnRequest);

  window.openReturnPopup = (orderId, itemKey) => {
    openReturnPopup(orderId, itemKey, callback);
  };
};
