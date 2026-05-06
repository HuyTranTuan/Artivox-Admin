import axiosClient from "@api/axios";

export const materialsService = {
  // Fetch all materials
  getMaterials: async () => {
    const response = await axiosClient.get("/materials");
    return response.data.data;
  },

  // Fetch a single material by slug
  getMaterialBySlug: async (slug) => {
    const response = await axiosClient.get(`/materials/${slug}`);
    return response.data.data;
  },
};
