import axiosClient from "@api/axios";

export const materialsService = {
  // Fetch all materials with pagination
  getMaterials: async (params = {}) => {
    const { type, limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (type) query.set("type", type);
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/catalog/materials${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // Fetch a single material by slug
  getMaterialBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/materials/${slug}`);
    return response.data.data;
  },
};
