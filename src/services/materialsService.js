import axiosClient from "@api/axios";

export const materialsService = {
  // Fetch all materials with pagination
  getMaterials: async (params = {}) => {
    const { search = "", type, limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (type) query.set("type", type);
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/catalog/materials${qs ? `?${qs}` : ""}`);
    return response;
  },

  // Fetch a single material by slug
  getMaterialBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/materials/${slug}`);
    return response;
  },

  // Create a new material
  createMaterial: async (formData) => {
    const response = await axiosClient.post(`/catalog/materials`, formData);
    return response;
  },

  // Update a material by slug
  updateMaterial: async (slug, formData) => {
    const response = await axiosClient.put(`/catalog/materials/${slug}`, formData);
    return response;
  },

  // Delete a material by slug
  deleteMaterial: async (slug) => {
    const response = await axiosClient.delete(`/catalog/materials/${slug}`);
    return response;
  },
};
