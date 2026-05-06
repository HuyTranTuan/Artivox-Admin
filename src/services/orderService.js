import axiosClient from "@api/axios";

export const orderService = {
  // Fetch all orders
  listOrders: async () => {
    const response = await axiosClient.get("/orders");
    return response.data.data;
  },

  // Fetch a single order by ID
  getOrderById: async (id) => {
    const response = await axiosClient.get(`/orders/${id}`);
    return response.data.data;
  },
};
