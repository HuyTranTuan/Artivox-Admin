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
const ArticleDetailPage = lazy(
  () => import("@pages/articles/ArticleDetailPage"),
);
const ArticlesPage = lazy(() => import("@/pages/campaigns/ArticlesPage"));
const CreateArticlePage = lazy(
  () => import("@pages/campaigns/CreateArticlePage"),
);
const EditArticlePage = lazy(() => import("@/pages/campaigns/EditArticlePage"));
const DiscountsPage = lazy(() => import("@/pages/campaigns/DiscountsPage"));
const CreateDiscountPage = lazy(
  () => import("@/pages/campaigns/CreateDiscountPage"),
);
const OrdersPage = lazy(() => import("@pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("@pages/orders/OrderDetailPage"));
const ModelsPage = lazy(() => import("@/pages/catalog/ModelsPage"));
const CreateModelPage = lazy(() => import("@/pages/catalog/CreateModelPage"));
const ModelDetailPage = lazy(() => import("@/pages/catalog/ModelDetailPage"));
const MaterialsPage = lazy(() => import("@/pages/catalog/MaterialsPage"));
const CreateMaterialPage = lazy(
  () => import("@/pages/catalog/CreateMaterialPage"),
);
const MaterialDetailPage = lazy(
  () => import("@/pages/catalog/MaterialDetailPage"),
);
const ToolsPage = lazy(() => import("@/pages/catalog/ToolsPage"));
const CreateToolPage = lazy(() => import("@/pages/catalog/CreateToolPage"));
const ToolDetailPage = lazy(() => import("@/pages/catalog/ToolDetailPage"));
const CollectionsPage = lazy(() => import("@/pages/catalog/CollectionsPage"));
const CreateCollectionPage = lazy(
  () => import("@/pages/catalog/CreateCollectionPage"),
);
const CollectionDetailPage = lazy(
  () => import("@/pages/catalog/CollectionDetailPage"),
);
const PersonalSettingsPage = lazy(
  () => import("@pages/settings/PersonalSettingsPage"),
);
const ChatPage = lazy(() => import("@pages/support/ChatPage"));
const CustomersPage = lazy(() => import("@pages/customers/CustomersPage"));
const CustomerDetailPage = lazy(
  () => import("@pages/customers/CustomerDetailPage"),
);
const NotificationsPage = lazy(
  () => import("@pages/notifications/NotificationsPage"),
);
const NotificationDetailPage = lazy(
  () => import("@pages/notifications/NotificationDetailPage"),
);
const OrderApprovalPage = lazy(() => import("@pages/orders/OrderApprovalPage"));
const StaffAiChatPage = lazy(() => import("@pages/support/StaffAiChatPage"));
const ChatAdminPage = lazy(() => import("@pages/support/ChatAdminPage"));
const SearchResultPage = lazy(() => import("@pages/search/SearchResultPage"));
const StaffPermissionsPage = lazy(
  () => import("@pages/staff/StaffPermissionsPage"),
);

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
          // Dashboard
          {
            path: "dashboard",
            element: <DashboardRedirect />,
          },
          // Search
          {
            path: "search",
            element: withLazyLoad(SearchResultPage),
          },
          // Articles
          {
            path: "articles",
            element: withLazyLoad(ArticlesPage),
          },
          {
            path: "articles/create",
            element: withLazyLoad(CreateArticlePage),
          },
          {
            path: "articles/:slug/edit",
            element: withLazyLoad(EditArticlePage),
          },
          {
            path: "articles/:slug",
            element: withLazyLoad(ArticleDetailPage),
          },
          // Discounts
          {
            path: "discounts",
            element: withLazyLoad(DiscountsPage),
          },
          {
            path: "discounts/create",
            element: withLazyLoad(CreateDiscountPage),
          },
          {
            path: "discount/:slug",
            element: withLazyLoad(CreateDiscountPage),
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
            path: "orders/:orderNumber/approval",
            element: withLazyLoad(OrderDetailPage),
          },
          {
            path: "orders/:orderNumber",
            element: withLazyLoad(OrderDetailPage),
          },
          // Catalog
          {
            path: "catalog",
            element: withLazyLoad(CollectionsPage),
          },
          {
            path: "catalog/models",
            element: withLazyLoad(ModelsPage),
          },
          {
            path: "catalog/models/create",
            element: withLazyLoad(CreateModelPage),
          },
          {
            path: "catalog/models/:slug",
            element: withLazyLoad(ModelDetailPage),
          },
          {
            path: "catalog/materials",
            element: withLazyLoad(MaterialsPage),
          },
          {
            path: "catalog/materials/create",
            element: withLazyLoad(CreateMaterialPage),
          },
          {
            path: "catalog/materials/:slug",
            element: withLazyLoad(MaterialDetailPage),
          },
          {
            path: "catalog/tools",
            element: withLazyLoad(ToolsPage),
          },
          {
            path: "catalog/tools/create",
            element: withLazyLoad(CreateToolPage),
          },
          {
            path: "catalog/tools/:slug",
            element: withLazyLoad(ToolDetailPage),
          },
          {
            path: "catalog/collections",
            element: withLazyLoad(CollectionsPage),
          },
          {
            path: "catalog/collections/create",
            element: withLazyLoad(CreateCollectionPage),
          },
          {
            path: "catalog/collections/edit/:slug",
            element: withLazyLoad(CreateCollectionPage),
          },
          {
            path: "catalog/collections/:slug",
            element: withLazyLoad(CollectionDetailPage),
          },
          // Settings
          {
            path: "settings/personal",
            element: withLazyLoad(PersonalSettingsPage),
          },
          // Support Chat
          {
            path: "support/chat",
            element: withLazyLoad(ChatPage),
          },
          // Internal Chat
          {
            path: "support/admin-chat",
            element: withLazyLoad(ChatAdminPage),
          },
          // Staff AI Chat
          {
            path: "support/ai-chat",
            element: withLazyLoad(StaffAiChatPage),
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
          // Staff Permissions
          {
            path: "staff-permissions",
            element: withLazyLoad(StaffPermissionsPage),
          },
          // Notifications
          {
            path: "notifications",
            element: withLazyLoad(NotificationsPage),
          },
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
