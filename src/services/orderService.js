import axiosClient from "@api/axios";

export const orderService = {
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

  getOrderById: async (id) => {
    const response = await axiosClient.get(`/orders/${id}`);
    return response;
  },

  getOrderByNumber: async (orderNumber) => {
    const response = await axiosClient.get(`/orders/number/${orderNumber}`);
    return response;
  },

  updateOrderStatus: async (orderNumber, status) => {
    const response = await axiosClient.patch(`/orders/number/${orderNumber}/status`, { status });
    return response;
  },

  approveOrder: async (orderId) => {
    const response = await axiosClient.patch(`/orders/${orderId}/approve`);
    return response;
  },

  rejectOrder: async (orderId) => {
    const response = await axiosClient.post(`/orders/${orderId}/cancel`);
    return response;
  },
};
