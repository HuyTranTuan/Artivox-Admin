import axiosClient from "@api/axios";

const getArticles = async () => {
  const response = await axiosClient.get("/articles");
  return response;
};

const getArticleBySlug = async (slug) => {
  const response = await axiosClient.get(`/articles/${slug}`);
  return response;
};

export const articleService = {
  getArticles,
  getArticleBySlug,
  listCampaigns: getArticles,
  getCampaignBySlug: getArticleBySlug,
};
