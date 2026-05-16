import axiosClient from "@api/axios";

export const notificationService = {
  // Fetch all notifications for the current user
  getNotifications: async (limit = 20, offset = 0) => {
    try {
      const response = await axiosClient.get("/notifications", {
        params: { limit, offset },
      });
      return response.data.data || [];
    } catch (error) {
      console.warn("Failed to fetch notifications:", error);
      return [];
    }
  },

  // Fetch a single notification by ID
  getNotificationById: async (id) => {
    try {
      const response = await axiosClient.get(`/notifications/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn("Failed to fetch notification:", error);
      return null;
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await axiosClient.patch(`/notifications/${id}`, {
        read: true,
      });
      return response.data.data;
    } catch (error) {
      console.warn("Failed to mark notification as read:", error);
      return null;
    }
  },

  // Mark multiple notifications as read
  markAsReadBatch: async (ids) => {
    try {
      const response = await axiosClient.patch("/notifications/batch/read", {
        ids,
      });
      return response.data.data;
    } catch (error) {
      console.warn("Failed to mark notifications as read:", error);
      return [];
    }
  },

  // Delete a notification
  deleteNotification: async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      return true;
    } catch (error) {
      console.warn("Failed to delete notification:", error);
      return false;
    }
  },

  // Delete multiple notifications
  deleteNotificationsBatch: async (ids) => {
    try {
      await axiosClient.delete("/notifications/batch", { data: { ids } });
      return true;
    } catch (error) {
      console.warn("Failed to delete notifications:", error);
      return false;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await axiosClient.get("/notifications/unread/count");
      return response.data.data?.count || 0;
    } catch (error) {
      console.warn("Failed to fetch unread count:", error);
      return 0;
    }
  },
};
