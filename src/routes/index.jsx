import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout/index.jsx";
import DashboardLayout from "@/layouts/DashoardLayout";
import ProtectedRoute from "@routes/ProtectedRoute";
import SignInPage from "@pages/auth/SignInPage";
import DashboardPage from "@pages/dashboard/DashboardPage";

const RegisterPage = lazy(() => import("@pages/auth/RegisterPage"));
const ArticleCampaignsPage = lazy(
  () => import("@pages/campaigns/ArticleCampaignsPage"),
);
const CreateArticlePage = lazy(
  () => import("@pages/campaigns/CreateArticlePage"),
);
const DiscountCampaignsPage = lazy(
  () => import("@pages/campaigns/DiscountCampaignsPage"),
);
const OrdersPage = lazy(() => import("@pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("@pages/orders/OrderDetailPage"));
const ModelsPage = lazy(() => import("@pages/products/ModelsPage"));
const MaterialsPage = lazy(() => import("@pages/products/MaterialsPage"));
const ToolsPage = lazy(() => import("@pages/products/ToolsPage"));
const PersonalSettingsPage = lazy(
  () => import("@pages/settings/PersonalSettingsPage"),
);
const ChatPage = lazy(() => import("@pages/support/ChatPage"));
const CustomersPage = lazy(() => import("@pages/customers/CustomersPage"));
const CustomerDetailPage = lazy(
  () => import("@pages/customers/CustomerDetailPage"),
);

const withLazyLoad = (Component) => (
  <Suspense
    fallback={<div className="p-6 text-sm text-slate-500">Loading page...</div>}
  >
    <Component />
  </Suspense>
);

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
            element: withLazyLoad(ArticleCampaignsPage),
          },
          {
            path: "campaigns/article/:slug",
            element: withLazyLoad(ArticleCampaignsPage),
          },
          {
            path: "campaigns/article/create",
            element: withLazyLoad(CreateArticlePage),
          },
          {
            path: "campaigns/discount",
            element: withLazyLoad(DiscountCampaignsPage),
          },
          {
            path: "campaigns/discount/:slug",
            element: withLazyLoad(DiscountCampaignsPage),
          },
          {
            path: "orders",
            element: withLazyLoad(OrdersPage),
          },
          {
            path: "orders/:orderId",
            element: withLazyLoad(OrderDetailPage),
          },
          {
            path: "products/models",
            element: withLazyLoad(ModelsPage),
          },
          {
            path: "products/materials",
            element: withLazyLoad(MaterialsPage),
          },
          {
            path: "products/tools",
            element: withLazyLoad(ToolsPage),
          },
          {
            path: "settings/personal",
            element: withLazyLoad(PersonalSettingsPage),
          },
          {
            path: "support/chat",
            element: withLazyLoad(ChatPage),
          },
          {
            path: "customers",
            element: withLazyLoad(CustomersPage),
          },
          {
            path: "customers/:id",
            element: withLazyLoad(CustomerDetailPage),
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
        element: withLazyLoad(RegisterPage),
      },
    ],
  },
]);
