import { http } from "@services/httpService";
import { ROLES } from "@constants/appCode";

export const authService = {
  signIn: async (payload) => {
    return http.post({
      token: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "admin-01",
        name: "Artivox Admin",
        email: payload.email,
        role: ROLES.ADMIN,
      },
    });
  },

  refreshToken: async (refreshToken) => {
    return http.post({
      token: "mock-jwt-token-refreshed",
      refreshToken: "mock-refresh-token-rotated",
    });
  },

  getCurrentUser: async (payload) => {
    return "";
  },
};
