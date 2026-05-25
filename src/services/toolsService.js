import axiosClient from "@api/axios";

export const toolsService = {
  // Fetch all tools with pagination
  getTools: async (params = {}) => {
    const { limit = 20, skip = 0 } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (skip) query.set("skip", skip);
    const qs = query.toString();
    const response = await axiosClient.get(`/catalog/tools${qs ? `?${qs}` : ""}`);
    return response;
  },

  // Fetch a single tool by slug
  getToolBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/tools/${slug}`);
    return response;
  },

  // Create a new tool
  createTool: async (formData) => {
    const response = await axiosClient.post(`/catalog/tools`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },
};
