import axiosClient from "@api/axios";

export const discountService = {
  // Fetch all discounts
  getDiscounts: async (params = {}) => {
    const { limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/discounts${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // Fetch a single discount by slug
  getDiscountBySlug: async (slug) => {
    const response = await axiosClient.get(`/discounts/${slug}`);
    return response.data.data;
  },
};
