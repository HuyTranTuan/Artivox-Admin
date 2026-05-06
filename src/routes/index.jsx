import { Navigate, createBrowserRouter } from "react-router-dom";
import AuthLayout from "@layouts/AuthLayout";
import DashboardLayout from "@layouts/DashboardLayout";
import ProtectedRoute from "@routes/ProtectedRoute";
import SignInPage from "@pages/auth/SignInPage";
import RegisterPage from "@pages/auth/RegisterPage";
import ArticleCampaignsPage from "@pages/campaigns/ArticleCampaignsPage";
import DiscountCampaignsPage from "@pages/campaigns/DiscountCampaignsPage";
import OrderApprovalPage from "@pages/orders/OrderApprovalPage";
import OrderDetailPage from "@pages/orders/OrderDetailPage";
import ModelsPage from "@pages/products/ModelsPage";
import MaterialsPage from "@pages/products/MaterialsPage";
import ToolsPage from "@pages/products/ToolsPage";
import PersonalSettingsPage from "@pages/settings/PersonalSettingsPage";
import ChatPage from "@pages/support/ChatPage";
import CustomersPage from "@pages/customers/CustomersPage";
import CustomerDetailPage from "@pages/customers/CustomerDetailPage";
import DashboardPage from "@pages/dashboard/DashboardPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "campaigns/article",
            element: <ArticleCampaignsPage />,
          },
          {
            path: "campaigns/discount",
            element: <DiscountCampaignsPage />,
          },
          {
            path: "orders/approval",
            element: <OrderApprovalPage />,
          },
          {
            path: "orders/:orderId",
            element: <OrderDetailPage />,
          },
          {
            path: "products/models",
            element: <ModelsPage />,
          },
          {
            path: "products/materials",
            element: <MaterialsPage />,
          },
          {
            path: "products/tools",
            element: <ToolsPage />,
          },
          {
            path: "settings/personal",
            element: <PersonalSettingsPage />,
          },
          {
            path: "support/chat",
            element: <ChatPage />,
          },
          {
            path: "customers",
            element: <CustomersPage />,
          },
          {
            path: "customers/:id",
            element: <CustomerDetailPage />,
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/signin",
        element: <SignInPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
]);
