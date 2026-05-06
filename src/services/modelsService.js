import axiosClient from "@api/axios";

export const modelsService = {
  // Fetch all models
  getModels: async () => {
    const response = await axiosClient.get("/models");
    return response.data.data;
  },

  // Fetch a single model by slug
  getModelBySlug: async (slug) => {
    const response = await axiosClient.get(`/models/${slug}`);
    return response.data.data;
  },
};
