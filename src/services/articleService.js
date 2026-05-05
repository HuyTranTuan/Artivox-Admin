import { http } from "@services/httpService";

const campaigns = [
  {
    id: "blog-01",
    title: "Summer Resin Launch",
    locale: "VI / EN",
    author: "Linh Tran",
    status: "Published",
    views: "12040",
    publishedAt: "2026-04-11"
  },
  {
    id: "blog-02",
    title: "Printer Calibration Guide",
    locale: "VI / EN",
    author: "Minh Vu",
    status: "Draft",
    views: "3200",
    publishedAt: "2026-04-24"
  },
  {
    id: "blog-03",
    title: "Workshop Recap: Tokyo Expo",
    locale: "EN",
    author: "Bao Nguyen",
    status: "Review",
    views: "8760",
    publishedAt: "2026-05-02"
  }
];

export const articleService = {
  listCampaigns: async () => {
    return http.get(campaigns);
  }
};
