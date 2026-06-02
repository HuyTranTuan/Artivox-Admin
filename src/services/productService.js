import axiosClient from "./axiosClient";

export const productService = {
  getProducts: async (params = {}) => {
    const response = await axiosClient.get("/products", { params });
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await axiosClient.get(`/products/${slug}`);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await axiosClient.patch(`/products/${id}`, data);
    return response.data;
  },
};
