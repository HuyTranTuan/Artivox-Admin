import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_30%)]" />
      <Outlet />
    </main>
  );
};

export default AuthLayout;
