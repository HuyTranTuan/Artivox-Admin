import axiosClient from "@api/axios";

export const orderService = {
  // Fetch all orders with pagination
  listOrders: async (params = {}) => {
    const { limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/orders${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // Fetch a single order by ID
  getOrderById: async (id) => {
    const response = await axiosClient.get(`/orders/${id}`);
    return response.data.data;
  },

  // Approve an order (PENDING -> PAID)
  approveOrder: async (orderId) => {
    const response = await axiosClient.patch(`/orders/${orderId}/approve`);
    return response.data;
  },

  // Reject an order (PENDING -> REFUND_PENDING)
  rejectOrder: async (orderId) => {
    const response = await axiosClient.post(`/orders/${orderId}/cancel`);
    return response.data;
  },
};
