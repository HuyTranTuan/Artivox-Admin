import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import SignInForm from "@/components/forms/SignInForm";

const SignInPage = () => {
  const { accessToken } = useAuthStore();
  if (accessToken) return <Navigate replace to="/" />;
  return <SignInForm />;
};

export default SignInPage;
