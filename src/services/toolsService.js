import axiosClient from "@api/axios";

export const toolsService = {
  // Fetch all tools
  getTools: async () => {
    const response = await axiosClient.get("/tools");
    return response.data.data;
  },

  // Fetch a single tool by slug
  getToolBySlug: async (slug) => {
    const response = await axiosClient.get(`/tools/${slug}`);
    return response.data.data;
  },
};
