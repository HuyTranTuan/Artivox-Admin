import axiosClient from "@api/axios";

export const productService = {
  getProducts: async (params = {}) => {
    const response = await axiosClient.get("/products", { params });
    return response;
  },

  getProductBySlug: async (slug) => {
    const response = await axiosClient.get(`/products/${slug}`);
    return response;
  },

  updateProduct: async (id, data) => {
    const response = await axiosClient.patch(`/products/${id}`, data);
    return response;
  },
};