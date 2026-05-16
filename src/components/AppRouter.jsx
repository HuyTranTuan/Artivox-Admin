import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout/index.jsx";
import DashboardLayout from "@/layouts/DashoardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignInPage from "@pages/auth/SignInPage";
import DashboardPage from "@pages/dashboard/DashboardPage";
import StaffDashboardPage from "@pages/dashboard/StaffDashboardPage";
import Loading from "@components/Loading";
import { useAuth } from "@hooks/useAuth";

const RegisterPage = lazy(() => import("@pages/auth/RegisterPage"));
const ArticleDetailPage = lazy(() => import("@pages/articles/ArticleDetailPage"));
const ArticleCampaignsPage = lazy(() => import("@pages/campaigns/ArticleCampaignsPage"));
const CreateArticlePage = lazy(() => import("@pages/campaigns/CreateArticlePage"));
const DiscountCampaignsPage = lazy(() => import("@pages/campaigns/DiscountCampaignsPage"));
const OrdersPage = lazy(() => import("@pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("@pages/orders/OrderDetailPage"));
const ModelsPage = lazy(() => import("@pages/products/ModelsPage"));
const MaterialsPage = lazy(() => import("@pages/products/MaterialsPage"));
const ToolsPage = lazy(() => import("@pages/products/ToolsPage"));
const PersonalSettingsPage = lazy(() => import("@pages/settings/PersonalSettingsPage"));
const ChatPage = lazy(() => import("@pages/support/ChatPage"));
const CustomersPage = lazy(() => import("@pages/customers/CustomersPage"));
const CustomerDetailPage = lazy(() => import("@pages/customers/CustomerDetailPage"));
const NotificationDetailPage = lazy(() => import("@pages/notifications/NotificationDetailPage"));
const OrderApprovalPage = lazy(() => import("@pages/orders/OrderApprovalPage"));

const withLazyLoad = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

/** Redirects to the correct dashboard based on user role */
export const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "STAFF" || user?.role === "staff") {
    return <StaffDashboardPage />;
  }
  return <DashboardPage />;
};

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardRedirect />,
          },
          // Staff dashboard
          {
            path: "staff/dashboard",
            element: withLazyLoad(StaffDashboardPage),
          },
          // Articles (no more /campaigns/article)
          {
            path: "articles",
            element: withLazyLoad(ArticleCampaignsPage),
          },
          {
            path: "articles/create",
            element: withLazyLoad(CreateArticlePage),
          },
          {
            path: "articles/:slug",
            element: withLazyLoad(ArticleDetailPage),
          },
          // Discounts
          {
            path: "campaigns/discount",
            element: withLazyLoad(DiscountCampaignsPage),
          },
          {
            path: "campaigns/discount/:slug",
            element: withLazyLoad(DiscountCampaignsPage),
          },
          // Orders
          {
            path: "orders",
            element: withLazyLoad(OrdersPage),
          },
          {
            path: "orders/approval",
            element: withLazyLoad(OrderApprovalPage),
          },
          {
            path: "orders/:orderId",
            element: withLazyLoad(OrderDetailPage),
          },
          // Products
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
          // Settings
          {
            path: "settings/personal",
            element: withLazyLoad(PersonalSettingsPage),
          },
          // Support
          {
            path: "support/chat",
            element: withLazyLoad(ChatPage),
          },
          // Customers
          {
            path: "customers",
            element: withLazyLoad(CustomersPage),
          },
          {
            path: "customers/:id",
            element: withLazyLoad(CustomerDetailPage),
          },
          // Notifications
          {
            path: "notifications/:id",
            element: withLazyLoad(NotificationDetailPage),
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

export default AppRouter;
