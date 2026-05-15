import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AppRouter from "@/components/AppRouter";

const App = () => {
  return (
    <>
      <RouterProvider router={AppRouter} />
      <ToastContainer />
    </>
  );
};

export default App;
