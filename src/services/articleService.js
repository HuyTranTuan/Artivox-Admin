import axiosClient from "@api/axios";

const getArticles = async () => {
  const response = await axiosClient.get("/articles");
  return response || [];
};

const getArticleBySlug = async (slug) => {
  const response = await axiosClient.get(`/articles/${slug}`);
  return response?.data?.data || response?.data || response;
};

const deleteArticle = async (slug) => {
  const response = await axiosClient.delete(`/articles/${slug}`);
  return response?.data || response;
};

const approveArticle = async (id) => {
  const response = await axiosClient.patch(`/articles/${id}/approve`);
  return response?.data || response;
};

const createArticle = async (formData) => {
  const response = await axiosClient.post("/articles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response?.data || response;
};

const updateArticle = async (slug, formData) => {
  const response = await axiosClient.put(`/articles/${slug}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response?.data || response;
};

export const articleService = {
  getArticles,
  getArticleBySlug,
  deleteArticle,
  approveArticle,
  createArticle,
  updateArticle,
  listCampaigns: getArticles,
  getCampaignBySlug: getArticleBySlug,
};
