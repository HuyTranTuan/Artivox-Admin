import axiosClient from "@api/axios";

export const articleApiService = {
  // Fetch all articles
  getArticles: async () => {
    const response = await axiosClient.get("/articles");
    return response.data.data;
  },

  // Fetch a single article by slug
  getArticleBySlug: async (slug) => {
    const response = await axiosClient.get(`/articles/${slug}`);
    return response.data.data;
  },
};
