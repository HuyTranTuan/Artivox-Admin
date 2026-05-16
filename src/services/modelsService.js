import axiosClient from "@api/axios";

export const modelsService = {
  // Fetch all models with pagination
  getModels: async (params = {}) => {
    const { search, limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/catalog/models${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // Fetch a single model by slug
  getModelBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/models/${slug}`);
    return response.data.data;
  },
};
