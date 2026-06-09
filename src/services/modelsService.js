import axiosClient from "@api/axios";

export const modelsService = {
  // Fetch all models with pagination
  getModels: async ({ search = "", limit = 20, skip = 0 }) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const queryString = query.toString();
    const response = await axiosClient.get(`/catalog/models${queryString ? `?${queryString}` : ""}`);
    return response;
  },

  // Fetch a single model by slug
  getModelBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/models/${slug}`);
    return response;
  },

  // Create a new model
  createModel: async (formData) => {
    const response = await axiosClient.post(`/catalog/models`, formData);
    return response;
  },

  // Update a model by slug
  updateModel: async (slug, formData) => {
    const response = await axiosClient.put(`/catalog/models/${slug}`, formData);
    return response;
  },

  // Delete a model by slug
  deleteModel: async (slug) => {
    const response = await axiosClient.delete(`/catalog/models/${slug}`);
    return response;
  },
};
