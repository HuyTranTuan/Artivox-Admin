import axiosClient from "@api/axios";

export const customerService = {
  // Fetch all customers
  listCustomers: async (params = {}) => {
    const { limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/customers${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // Fetch a single customer by slug
  getCustomerBySlug: async (slug) => {
    const response = await axiosClient.get(`/customers/${slug}`);
    return response.data.data;
  },
};
