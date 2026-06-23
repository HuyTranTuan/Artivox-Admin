import axiosClient from "@api/axios";

export const dashboardService = {
  /**
   * Fetch admin dashboard data.
   * BE returns: { status: "success", message, data: { widgets, tables, charts } }
   * Axios wraps response as { data: { status, message, data } }.
   * So response.data = BE body, response.data.data = actual payload.
   */
  getAdminDashboard: async () => {
    try {
      const response = await axiosClient.get("/admin/dashboard");
      return response?.data || response;
    } catch (error) {
      console.warn("Admin dashboard API failed:", error);
      return null;
    }
  },

  getStaffDashboard: async () => {
    try {
      const response = await axiosClient.get("/admin/staff/dashboard");
      return response?.data || response;
    } catch (error) {
      console.warn("Staff dashboard API failed:", error);
      return null;
    }
  },
};