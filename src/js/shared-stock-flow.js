/* ================= API SAN PHAM ================= */
export const PRODUCT_API_URL =
  "https://69f8c3e5f7044aa0103e73e0.mockapi.io/api/v1/productphone";

/* ================= TRANG THAI TON KHO ================= */
export const STOCK_DEDUCTED = "Đã trừ kho";
export const STOCK_RESTORED = "Đã cộng lại kho";

/* ================= LAY / LUU SAN PHAM ================= */
export const getProducts = async () => {
  const response = await fetch(PRODUCT_API_URL);
  return await response.json();
};

export const saveProducts = async (products) => {
  for (const product of products) {
    await fetch(`${PRODUCT_API_URL}/${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
  }
};

const getProductQuantity = (product) => {
  return Number(product.quantity ?? 0);
};

export const updateProductStock = async (productId, quantity) => {
  const response = await fetch(`${PRODUCT_API_URL}/${productId}`);
  const product = await response.json();

  if (!product || !product.id) {
    throw new Error("Sản phẩm không tồn tại");
  }

  await fetch(`${PRODUCT_API_URL}/${product.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...product,
      quantity: Math.max(0, Number(quantity)),
    }),
  });
};

const assertEnoughStock = (products, order) => {
  for (const item of order.items || []) {
    const product = products.find((productItem) => productItem.id == item.id);

    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm ${item.name}`);
    }

    const currentQuantity = getProductQuantity(product);
    const orderQuantity = Number(item.soLuong || 1);

    if (currentQuantity < orderQuantity) {
      throw new Error(`Số lượng sản phẩm trong kho không đủ: ${item.name}`);
    }
  }
};

/* ================= TRU / CONG KHO THEO DON HANG ================= */
export const decreaseStockByOrder = async (order) => {
  if (order.stockStatus === STOCK_DEDUCTED) return order;

  const products = await getProducts();
  assertEnoughStock(products, order);

  for (const item of order.items || []) {
    const product = products.find((productItem) => productItem.id == item.id);
    const nextQuantity = getProductQuantity(product) - Number(item.soLuong || 1);
    await updateProductStock(product.id, nextQuantity);
  }

  order.stockStatus = STOCK_DEDUCTED;
  order.stockUpdatedAt = new Date().toLocaleString("vi-VN");
  return order;
};

export const increaseStockByOrder = async (order) => {
  if (order.stockStatus !== STOCK_DEDUCTED) return order;

  const products = await getProducts();

  for (const item of order.items || []) {
    const product = products.find((productItem) => productItem.id == item.id);

    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm ${item.name}`);
    }

    const nextQuantity = getProductQuantity(product) + Number(item.soLuong || 1);
    await updateProductStock(product.id, nextQuantity);
  }

  order.stockStatus = STOCK_RESTORED;
  order.stockUpdatedAt = new Date().toLocaleString("vi-VN");
  return order;
};

export const applyStockWhenOrderStatusChanges = async (order, newStatus) => {
  const oldStatus = order.status;
  const shouldDeduct = newStatus === "Đang giao hàng" || newStatus === "Đã giao hàng";
  const shouldRestore =
    newStatus === "Đang xử lý" ||
    newStatus === "Chờ xác nhận đặt hàng" ||
    newStatus === "Đã bị hủy";

  if (shouldDeduct && order.stockStatus !== STOCK_DEDUCTED) {
    await decreaseStockByOrder(order);
  }

  if (shouldRestore && order.stockStatus === STOCK_DEDUCTED) {
    await increaseStockByOrder(order);
  }

  order.status = newStatus;
  order.updatedAt = new Date().toLocaleString("vi-VN");

  if (newStatus === "Đã giao hàng" && oldStatus !== "Đã giao hàng") {
    order.deliveredAt = order.updatedAt;
    order.deliveredAtMs = Date.now();
  }

  return order;
};

export const cancelOrder = async (order, reason, cancelBy) => {
  if (order.stockStatus === STOCK_DEDUCTED) {
    await increaseStockByOrder(order);
  }

  order.status = "Đã bị hủy";
  order.cancelReason = reason;
  order.cancelBy = cancelBy;
  order.updatedAt = new Date().toLocaleString("vi-VN");

  return order;
};

