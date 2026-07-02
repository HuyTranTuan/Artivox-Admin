export const translateBackendError = (message, t) => {
  if (!message) return message;
  
  if (message === "Cart is empty") return t("errors.cartEmpty", "Cart is empty");
  if (message === "Invalid item in cart") return t("errors.invalidCartItem", "Invalid item in cart");
  if (message.startsWith("Product with ID")) return t("errors.productNotFound", "Product not found");
  if (message === "Invalid or inactive discount code") return t("errors.invalidDiscount", "Invalid or inactive discount code");
  if (message === "Discount code usage limit reached") return t("errors.discountLimitReached", "Discount code usage limit reached");
  if (message === "Discount code is not active yet") return t("errors.discountNotActive", "Discount code is not active yet");
  if (message === "Discount code has expired") return t("errors.discountExpired", "Discount code has expired");
  if (message.startsWith("Minimum order amount for this discount is ")) {
    const match = message.match(/₫([\d,]+)/);
    const amount = match ? match[1] : "";
    return t("errors.discountMinOrder", { defaultValue: message, amount });
  }
  if (message === "Order not found") return t("errors.orderNotFound", "Order not found");
  if (message === "Only pending orders can be cancelled") return t("errors.cancelPendingOnly", "Only pending orders can be cancelled");
  if (message === "Invalid status") return t("errors.invalidStatus", "Invalid status");
  if (message === "Only pending orders can be approved") return t("errors.approvePendingOnly", "Only pending orders can be approved");
  
  // Generic fallback: check if we have a direct translation, else return original
  const directTranslation = t(`errors.${message.replace(/\s+/g, '')}`, message);
  if (directTranslation !== message) {
    return directTranslation;
  }

  return message;
};
