import axiosClient from "@api/axios";

const getArticles = async () => {
  const response = await axiosClient.get("/articles");
  return response.data.data;
};

const getArticleBySlug = async (slug) => {
  const response = await axiosClient.get(`/articles/${slug}`);
  return response.data.data;
};

export const articleService = {
  getArticles,
  getArticleBySlug,
  listCampaigns: getArticles,
  getCampaignBySlug: getArticleBySlug,
};
