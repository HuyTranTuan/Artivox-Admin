import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@store/authStore";
import { authService } from "@services/authService";
import { isTokenExpired } from "@/utils/token";
import VerifyingSession from "@components/VerifyingSession";

const ProtectedRoute = () => {
  const [checking, setChecking] = useState(true);
  const { accessToken, refreshToken, signOut, refreshAuth } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      // no token at all → redirect
      if (!accessToken) {
        setChecking(false);
        return;
      }

      // token not expired → proceed
      if (!isTokenExpired(accessToken)) {
        setChecking(false);
        return;
      }

      // token expired → try refresh
      if (!refreshToken) {
        signOut();
        setChecking(false);
        return;
      }

      try {
        const response = await authService.refreshToken(refreshToken);
        refreshAuth(response);
      } catch {
        signOut();
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, []);

  if (checking) {
    return <VerifyingSession />;
  }

  const stored = useAuthStore.getState();
  if (!stored.accessToken) {
    return <Navigate replace to="/signin" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
