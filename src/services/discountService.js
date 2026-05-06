import axiosClient from "@api/axios";

export const discountService = {
  // Fetch all discounts
  getDiscounts: async () => {
    const response = await axiosClient.get("/discounts");
    return response.data.data;
  },

  // Fetch a single discount by slug
  getDiscountBySlug: async (slug) => {
    const response = await axiosClient.get(`/discounts/${slug}`);
    return response.data.data;
  },
};
