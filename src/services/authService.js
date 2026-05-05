import { http } from "@services/httpService";
import { ROLES } from "@constants/roles";

export const authService = {
  signIn: async (payload) => {
    return http.post({
      token: "mock-jwt-token",
      user: {
        id: "admin-01",
        name: "Artivox Admin",
        email: payload.email,
        role: ROLES.ADMIN
      }
    });
  }
};
