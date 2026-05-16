import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AppRouter from "@/components/AppRouter";
import { useUiStore } from "@/store/uiStore";

const App = () => {
  const { theme } = useUiStore();

  useEffect(() => {
    // Apply theme on mount and when theme changes
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  }, [theme]);

  return (
    <>
      <RouterProvider router={AppRouter} />
      <ToastContainer />
    </>
  );
};

export default App;
