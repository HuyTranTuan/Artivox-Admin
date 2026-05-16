import axiosClient from "@api/axios";

export const dashboardService = {
  getDashboardData: async (userRole = "admin") => {
    try {
      const endpoint = userRole === "staff" ? "/staff/dashboard" : "/admin/dashboard";
      const response = await axiosClient.get(endpoint);
      return response.data.data;
    } catch (error) {
      console.warn("Dashboard API failed, using mock data:", error);
      return null;
    }
  },

  getAdminDashboard: async () => {
    try {
      const response = await axiosClient.get("/admin/dashboard");
      return response.data.data;
    } catch (error) {
      console.warn("Admin dashboard API failed:", error);
      return null;
    }
  },

  getStaffDashboard: async () => {
    try {
      const response = await axiosClient.get("/staff/dashboard");
      return response.data.data;
    } catch (error) {
      console.warn("Staff dashboard API failed:", error);
      return null;
    }
  },
};
