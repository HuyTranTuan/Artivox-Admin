import http from "@api/axios";

export const settingsService = {
  // Get personal settings
  getPersonalSettings: async () => {
    try {
      const response = await http.get("/settings/personal");
      return response;
    } catch (error) {
      console.warn("Failed to fetch personal settings:", error);
      return null;
    }
  },

  // Get personal settings (profile)
  getProfile: async () => {
    try {
      const user = await http.get("/auth/me");
      // map backend user structure to profile structure
      return {
        name: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
        role: user.role || "Admin",
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
      const response = await http.patch("/auth/admin/account", payload);
      return response;
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
          const response = await http.patch("/auth/admin/account", { avatar: base64 });
          resolve({ url: response.avatar });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  },

  removeAvatar: async () => {
    const response = await http.patch("/auth/admin/account", { avatar: "" });
    return response;
  },

  // Update password
  updatePassword: async ({ currentPassword, newPassword }) => {
    const response = await http.patch("/auth/admin/change-password", {
      currentPassword,
      newPassword,
    });
    return { success: true, data: response };
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await http.patch("/settings/notifications", preferences);
      return response;
    } catch (error) {
      console.warn("Failed to update notification preferences:", error);
      return null;
    }
  },

  // Get notification preferences
  getNotifications: async () => {
    try {
      const response = await http.get("/settings/notifications");
      return response;
    } catch {
      return null;
    }
  },
};
