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
    return response;
  },

  // Fetch a single customer by slug
  getCustomerBySlug: async (slug) => {
    const response = await axiosClient.get(`/customers/${slug}`);
    return response;
  },

  // Fetch a single customer by id
  getCustomerById: async (id) => {
    const response = await axiosClient.get(`/customers/id/${id}`);
    return response;
  },

  // Update customer
  updateCustomer: async (id, data) => {
    const response = await axiosClient.patch(`/customers/${id}/update`, data);
    return response;
  },

  // Delete customer (soft)
  deleteCustomer: async (id) => {
    const response = await axiosClient.delete(`/customers/${id}`);
    return response;
  },
};