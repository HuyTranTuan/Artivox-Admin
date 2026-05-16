import axiosClient from "@api/axios";

export const settingsService = {
  // Get personal settings
  getPersonalSettings: async () => {
    try {
      const response = await axiosClient.get("/settings/personal");
      return response.data.data;
    } catch (error) {
      console.warn("Failed to fetch personal settings:", error);
      return null;
    }
  },

  // Update personal settings
  updatePersonalSettings: async (data) => {
    try {
      const response = await axiosClient.patch("/settings/personal", data);
      return response.data.data;
    } catch (error) {
      console.warn("Failed to update personal settings:", error);
      return null;
    }
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosClient.patch("/settings/password", {
        currentPassword,
        newPassword,
      });
      return response.data.data;
    } catch (error) {
      console.warn("Failed to update password:", error);
      return null;
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await axiosClient.patch("/settings/notifications", preferences);
      return response.data.data;
    } catch (error) {
      console.warn("Failed to update notification preferences:", error);
      return null;
    }
  },
};
