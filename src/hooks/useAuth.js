import { useNavigate } from "react-router-dom";
import { authService } from "@services/authService";
import { useAuthStore } from "@store/authStore";

export const useAuth = () => {
  const navigate = useNavigate();
  const { signIn, signOut, refreshAuth, user, token, refreshToken } =
    useAuthStore();

  const handleSignIn = async (payload) => {
    const response = await authService.signIn(payload);
    signIn(response);
    navigate("/");
  };

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  const handleRefreshToken = async () => {
    try {
      const response = await authService.refreshToken(refreshToken);
      refreshAuth(response);
      return response.token;
    } catch {
      signOut();
      navigate("/signin");
      return null;
    }
  };

  return {
    user,
    token,
    refreshToken,
    handleSignIn,
    handleSignOut,
    handleRefreshToken,
  };
};
