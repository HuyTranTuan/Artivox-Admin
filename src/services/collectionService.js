import axiosClient from "@api/axios";

export const collectionService = {
  // Fetch all collections
  getCollections: async () => {
    const response = await axiosClient.get("/catalog/collections");
    return response;
  },

  // Fetch a single collection by slug
  getCollectionBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/collections/${slug}`);
    return response;
  },
};
