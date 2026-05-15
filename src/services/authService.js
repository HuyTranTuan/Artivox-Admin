import http from "@api/axios";
import { ROLES } from "@constants/appCode";

export const authService = {
  signIn: async (payload) => {
    const user = await http.post("/auth/admin/login", { email: payload.email, password: payload.password }, null);
    if (!user) return null;
    return user;
  },

  refreshToken: async (refreshToken) => {
    return http.post("/auth/refresh-token", { refreshToken }, null);
  },

  getCurrentUser: async (payload) => {
    const me = await http.post("/auth/me", token, null);
    if (!me) return null;
    return me;
  },
};
