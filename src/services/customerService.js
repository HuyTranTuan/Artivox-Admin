import axiosClient from "@api/axios";

export const customerService = {
  // Fetch all customers (admin route)
  getCustomers: async () => {
    const response = await axiosClient.get("/admin/customers");
    return response.data.data;
  },

  // Fetch a single customer by slug (admin route)
  getCustomerBySlug: async (slug) => {
    const response = await axiosClient.get(`/admin/customers/${slug}`);
    return response.data.data;
  },
};
