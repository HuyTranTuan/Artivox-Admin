import axiosClient from "@api/axios";

export const orderService = {
  // Fetch all orders with pagination
  listOrders: async (params = {}) => {
    const { limit = 20, skip = 0, status, adminId } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    if (status) query.set("status", status);
    if (adminId) query.set("adminId", adminId);
    const qs = query.toString();
    const response = await axiosClient.get(`/orders${qs ? `?${qs}` : ""}`);
    return response;
  },

  // Fetch a single order by ID
  getOrderById: async (id) => {
    const response = await axiosClient.get(`/orders/${id}`);
    return response;
  },

  // Approve an order (PENDING -> PAID)
  approveOrder: async (orderId) => {
    const response = await axiosClient.patch(`/orders/${orderId}/approve`);
    return response;
  },

  // Reject an order (PENDING -> REFUND_PENDING)
  rejectOrder: async (orderId) => {
    const response = await axiosClient.post(`/orders/${orderId}/cancel`);
    return response;
  },
};
