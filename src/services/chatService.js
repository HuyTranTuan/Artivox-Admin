import http from "@api/axios";

export const chatService = {
  getRooms: async () => {
    return http.get(`/chat/rooms?t=${Date.now()}`);
  },

  getMessages: async (roomId) => {
    return http.get(`/chat/rooms/${roomId}/messages`, null);
  },

  sendMessage: async (roomId, data) => {
    return http.post(`/chat/rooms/${roomId}/messages`, data, null);
  },

  claimRoom: async (roomId) => {
    return http.post(`/chat/rooms/${roomId}/claim`, {}, null);
  },

  markAsRead: async (roomId) => {
    return http.patch(`/chat/rooms/${roomId}/read`, {}, null);
  },

  // --- Internal Chat (Admin/Staff to Admin/Staff) ---
  getInternalUsers: async () => {
    return http.get(`/chat/internal-users?t=${Date.now()}`);
  },

  getInternalRooms: async () => {
    return http.get(`/chat/internal-rooms?t=${Date.now()}`);
  },

  getOrCreateInternalRoom: async (participantId) => {
    return http.post(`/chat/internal-rooms`, { participantId }, null);
  },

  getInternalMessages: async (roomId) => {
    return http.get(`/chat/internal-rooms/${roomId}/messages`, null);
  },

  sendInternalMessage: async (roomId, data) => {
    return http.post(`/chat/internal-rooms/${roomId}/messages`, data, null);
  },

  markInternalAsRead: async (roomId) => {
    return http.patch(`/chat/internal-rooms/${roomId}/read`, {}, null);
  },
};
