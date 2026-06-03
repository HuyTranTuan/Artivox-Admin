import { useNavigate } from "react-router-dom";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { notificationService } from "@services/notificationService";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Bell, ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "react-toastify";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const {
    data: notifications,
    loading,
    error,
    page: currentPage,
    totalPages,
    totalItems,
    setPage,
    nextPage,
    prevPage,
    refetch,
  } = usePaginatedApi(
    async ({ limit, skip }) => await notificationService.getNotifications(limit, skip),
    { defaultLimit: 20, pageParam: "page" }
  );

  const [marking, setMarking] = useState(false);

  const handleMarkAllRead = async () => {
    setMarking(true);
    // Since backend has markAllAsRead endpoint but frontend service might not match perfectly.
    // Let's check if the service has markAsReadBatch or we can just send patch to /notifications/batch/read
    await notificationService.markAsReadBatch(notifications.map(n => n.id));
    toast.success(t("notifications.markAllSuccess", "All marked as read"));
    refetch();
    setMarking(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-title text-2xl font-bold text-slate-950">
                {t("notifications.title", "Notifications")}
              </h1>
              <p className="text-sm text-slate-500">
                {t("notifications.subtitle", "View and manage your notifications.")}
              </p>
            </div>
          </div>
          <div>
             <Button onClick={handleMarkAllRead} disabled={marking || notifications.length === 0} variant="outline" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {t("notifications.markAllAsRead", "Mark All as Read")}
             </Button>
          </div>
        </div>

        <div className="min-w-full">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    {t("common.loading", "Loading...")}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    {t("notifications.noNotifications", "No notifications found.")}
                  </div>
                ) : (
                  notifications.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex gap-4 border-b border-slate-200 px-4 py-4 text-sm transition cursor-pointer ${
                        item.isRead ? "bg-white text-slate-600 hover:bg-slate-50" : "bg-blue-50/50 text-slate-900 hover:bg-blue-50 font-medium"
                      }`}
                      onClick={() => navigate(`/notifications/${item.id}`)}
                    >
                      <div className="mt-1">
                        {!item.isRead ? (
                           <div className="h-2 w-2 bg-blue-600 rounded-full mt-1.5" />
                        ) : (
                           <div className="h-2 w-2" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">{item.title}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(item.createdAt)}
                            </span>
                        </div>
                        <div className="text-sm text-slate-600 line-clamp-2">
                            {item.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
          <div className="text-sm text-slate-600">
            {t("common.pageOf", {
              page: currentPage,
              total: totalPages,
              count: totalItems,
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" /> {t("common.previous", "Previous")}
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                let page;
                if (totalPages <= 5) page = index + 1;
                else if (currentPage <= 3) page = index + 1;
                else if (currentPage >= totalPages - 2)
                  page = totalPages - 4 + index;
                else page = currentPage - 2 + index;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0!"
                    onClick={() => setPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages || loading}
            >
              {t("common.next", "Next")} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default NotificationsPage;
