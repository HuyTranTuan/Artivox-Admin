import { http } from "@services/httpService";

const orders = [
  {
    id: "ORD-1001",
    customer: "Tran Gia Huy",
    amount: 3400000,
    status: "PENDING"
  },
  {
    id: "ORD-1002",
    customer: "Nguyen Thu Ha",
    amount: 1280000,
    status: "PAID"
  },
  {
    id: "ORD-1003",
    customer: "Le Quoc Viet",
    amount: 2100000,
    status: "REFUND_PENDING"
  }
];

export const orderService = {
  listOrders: async () => {
    return http.get(orders);
  }
};
