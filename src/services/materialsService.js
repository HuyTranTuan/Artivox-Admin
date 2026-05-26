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
    return response;
  },

  // Fetch a single material by slug
  getMaterialBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/materials/${slug}`);
    return response;
  },

  // Create a new material
  createMaterial: async (formData) => {
    const response = await axiosClient.post(`/catalog/materials`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  // Update a material by slug
  updateMaterial: async (slug, formData) => {
    const response = await axiosClient.put(`/catalog/materials/${slug}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },
};
