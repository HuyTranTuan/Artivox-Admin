import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import { authService } from "@services/authService";

// Safe JWT decode: reads base64 payload from a JWT string
const decodeToken = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return false; // no exp claim → assume valid
  return Date.now() >= decoded.exp * 1000;
};

const ProtectedRoute = () => {
  const [checking, setChecking] = useState(true);
  const { token, refreshToken, signOut, refreshAuth } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      // no token at all → redirect
      if (!token) {
        setChecking(false);
        return;
      }

      // token not expired → proceed
      if (!isTokenExpired(token)) {
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
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-slate-500">Verifying session...</div>
      </div>
    );
  }

  const stored = useAuthStore.getState();
  if (!stored.token) {
    return <Navigate replace to="/signin" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
