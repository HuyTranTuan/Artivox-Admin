import { useNavigate } from "react-router-dom";
import { authService } from "@services/authService";
import { useAuthStore } from "@store/authStore";

export const useAuth = () => {
  const navigate = useNavigate();
  const { signIn, signOut, user, token } = useAuthStore();

  const handleSignIn = async (payload) => {
    const response = await authService.signIn(payload);
    signIn(response);
    navigate("/");
  };

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  return {
    user,
    token,
    handleSignIn,
    handleSignOut
  };
};
