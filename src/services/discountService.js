import axiosClient from "@api/axios";

export const discountService = {
  // Fetch all active discounts
  getDiscounts: async (params = {}) => {
    const { limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/discounts${qs ? `?${qs}` : ""}`);
    return response;
  },

  // Fetch all discounts for admin
  getDiscountsAdmin: async () => {
    const response = await axiosClient.get("/discounts/admin");
    return response;
  },

  // Fetch a single discount by slug
  getDiscountBySlug: async (slug) => {
    const response = await axiosClient.get(`/discounts/${slug}`);
    return response;
  },

  // Create a new discount
  createDiscount: async (data) => {
    const response = await axiosClient.post("/discounts", data);
    return response;
  },

  // Update a discount by slug
  updateDiscount: async (slug, data) => {
    const response = await axiosClient.put(`/discounts/${slug}`, data);
    return response;
  },

  // Delete a discount by slug
  deleteDiscount: async (slug) => {
    const response = await axiosClient.delete(`/discounts/${slug}`);
    return response;
  },
};
