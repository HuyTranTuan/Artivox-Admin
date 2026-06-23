import http from "@api/axios";

export const discountService = {
  // Fetch all active discounts
  getDiscounts: async (params = {}) => {
    const { limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await http.get(`/discounts${qs ? `?${qs}` : ""}`);
    return response;
  },

  // Fetch all discounts for admin
  getDiscountsAdmin: async (params = {}) => {
    const { limit = 20, skip = 0, search } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    if (search) query.set("search", search);
    const qs = query.toString();
    const response = await http.get(`/discounts/admin${qs ? `?${qs}` : ""}`);
    return response;
  },

  // Fetch a single discount by slug
  getDiscountBySlug: async (slug) => {
    const response = await http.get(`/discounts/${slug}`);
    return response;
  },

  // Create a new discount
  createDiscount: async (data) => {
    const response = await http.post("/discounts", data);
    return response;
  },

  // Update a discount by slug
  updateDiscount: async (slug, data) => {
    const response = await http.put(`/discounts/${slug}`, data);
    return response;
  },

  // Delete a discount by slug
  deleteDiscount: async (slug) => {
    const response = await http.del(`/discounts/${slug}`);
    return response;
  },
};