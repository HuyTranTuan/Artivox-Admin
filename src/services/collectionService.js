import axiosClient from "@api/axios";

export const collectionService = {
  // Fetch all collections
  getCollections: async () => {
    const response = await axiosClient.get("/collections");
    return response.data.data;
  },

  // Fetch a single collection by slug
  getCollectionBySlug: async (slug) => {
    const response = await axiosClient.get(`/collections/${slug}`);
    return response.data.data;
  },
};
