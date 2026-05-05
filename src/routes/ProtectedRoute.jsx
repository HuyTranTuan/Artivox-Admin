import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@store/authStore";

const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate replace to="/signin" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
