import { http } from "@services/httpService";

// Mock user settings data
const mockProfile = {
  name: "Admin User",
  email: "admin@artivox.com",
  phone: "+84 123 456 789",
  role: "Super Admin",
  bio: "Platform administrator since 2025. Managing content, users, and operations.",
  language: "English (US)",
  timezone: "Asia/Saigon (UTC+7)",
  avatar: null,
  twoFactorEnabled: false,
};

const mockNotifications = {
  email: true,
  push: true,
  orderUpdates: true,
  campaignAlerts: false,
  weeklyDigest: true,
};

export const settingsService = {
  // Fetch personal profile
  getProfile: async () => {
    return http.get(mockProfile);
  },

  // Update profile info
  updateProfile: async (payload) => {
    Object.assign(mockProfile, payload);
    return http.get(mockProfile);
  },

  // Update password
  updatePassword: async (payload) => {
    if (payload.currentPassword !== "password123") {
      return http.post({
        success: false,
        error: "Current password is incorrect",
      });
    }
    return http.post({ success: true });
  },

  // Toggle 2FA
  toggleTwoFactor: async (enabled) => {
    mockProfile.twoFactorEnabled = enabled;
    return http.post({ success: true, enabled });
  },

  // Upload avatar (simulated)
  uploadAvatar: async (file) => {
    const url = URL.createObjectURL(file);
    mockProfile.avatar = url;
    return http.post({ url });
  },

  // Remove avatar
  removeAvatar: async () => {
    mockProfile.avatar = null;
    return http.post({ success: true });
  },

  // Fetch notification preferences
  getNotifications: async () => {
    return http.get(mockNotifications);
  },

  // Update notification preferences
  updateNotifications: async (payload) => {
    Object.assign(mockNotifications, payload);
    return http.post({ success: true });
  },

  // Delete account (soft delete)
  deleteAccount: async () => {
    return http.post({ success: true });
  },
};
