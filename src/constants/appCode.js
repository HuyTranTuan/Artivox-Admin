const APP_CODE = {
  ORDER_STATUSES: {
    PENDING: "PENDING",
    PAID: "PAID",
    CANCELLED: "CANCELLED",
    REFUND_PENDING: "REFUND_PENDING",
    REFUNDED: "REFUNDED",
  },
  PRODUCT_TYPES: [
    { label: "Models", value: "MODEL" },
    { label: "Materials", value: "MATERIAL" },
    { label: "Tools", value: "TOOL" },
  ],
  ROLES: {
    ADMIN: "ADMIN",
    STAFF: "STAFF",
  },
};

const ORDER_STATUSES = APP_CODE.ORDER_STATUSES;
const PRODUCT_TYPES = APP_CODE.PRODUCT_TYPES;
const ROLES = APP_CODE.ROLES;

export { ORDER_STATUSES, PRODUCT_TYPES, ROLES };
export default APP_CODE;
