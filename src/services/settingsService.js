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

  // Get personal settings (profile)
  getProfile: async () => {
    try {
      const response = await axiosClient.get("/auth/me"); // assuming we have a me endpoint
      // map backend user structure to profile structure
      const user = response.data.data;
      return {
        name: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
        language: "English (US)",
        timezone: "Asia/Saigon (UTC+7)",
      };
    } catch (error) {
      console.warn("Failed to fetch profile:", error);
      return null;
    }
  },

  // Update personal settings
  updateProfile: async (data) => {
    try {
      const payload = {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };
      const response = await axiosClient.patch("/auth/admin/account", payload);
      return response.data.data;
    } catch (error) {
      console.warn("Failed to update profile:", error);
      throw error;
    }
  },

  uploadAvatar: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result;
          const response = await axiosClient.patch("/auth/admin/account", { avatar: base64 });
          resolve({ url: response.data.data.avatar });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  },

  removeAvatar: async () => {
    // Currently backend doesn't support removing avatar natively via this endpoint unless updated
    return null;
  },

  // Update password
  updatePassword: async ({ currentPassword, newPassword }) => {
    const response = await axiosClient.patch("/auth/admin/change-password", {
      currentPassword,
      newPassword,
    });
    return { success: true, data: response.data.data };
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
