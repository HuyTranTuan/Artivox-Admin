import axiosClient from "@api/axios";

export const collectionService = {
  // Fetch all collections
  getCollections: async (params) => {
    const response = await axiosClient.get("/catalog/collections", { params });
    return response;
  },

  // Fetch a single collection by slug
  getCollectionBySlug: async (slug) => {
    const response = await axiosClient.get(`/catalog/collections/${slug}`);
    return response;
  },

  // Create a new collection
  createCollection: async (formData) => {
    const response = await axiosClient.post("/catalog/collections", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  // Update a collection by slug
  updateCollection: async (slug, formData) => {
    const response = await axiosClient.put(`/catalog/collections/${slug}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  },

  // Add a product to a collection
  addProductToCollection: async (collectionId, productSlug) => {
    const response = await axiosClient.post(`/catalog/collections/${collectionId}/products`, {
      productSlug,
    });
    return response;
  },

  // Delete a collection by slug
  deleteCollection: async (slug) => {
    const response = await axiosClient.delete(`/catalog/collections/${slug}`);
    return response;
  },
};
