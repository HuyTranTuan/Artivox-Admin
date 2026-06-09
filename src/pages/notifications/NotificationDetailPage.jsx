import { useTranslate } from "@/i18n/useTranslate";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
} from "lucide-react";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useState, useEffect } from "react";
import { notificationService } from "@services/notificationService";
import { chatService } from "@services/chatService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loading from "@/components/Loading";

const getNotificationIcon = (type) => {
  const { t } = useTranslate();

  switch (type) {
    case "ORDER":
    case "REFUND":
      return <AlertCircle className="h-6 w-6 text-amber-600" />;
    case "STOCK":
      return <AlertCircle className="h-6 w-6 text-orange-600" />;
    case "INFO":
    case "ARTICLE":
      return <Info className="h-6 w-6 text-blue-600" />;
    case "SUCCESS":
      return <CheckCircle className="h-6 w-6 text-emerald-600" />;
    default:
      return <Info className="h-6 w-6 text-slate-600" />;
  }
};

export const NotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      setLoading(true);
      const data = await notificationService.getNotificationById(id);
      if (data) {
        setNotification(data);
        if (!data.isRead) {
          // Auto-mark as read
          await notificationService.markAsRead(id);
          setNotification((prev) => ({
            ...prev,
            isRead: true,
            readAt: new Date().toISOString(),
          }));
        }
      }
      setLoading(false);
    };
    fetchNotification();
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        t(
          "notifications.confirmDelete",
          "Are you sure you want to delete this notification?",
        ),
      )
    ) {
      await notificationService.deleteNotification(id);
      toast.success(
        t("notifications.deleteSuccess", "Notification deleted successfully"),
      );
      navigate("/notifications");
    }
  };

  const handleClaimChat = async (roomId) => {
    setClaiming(true);
    try {
      await chatService.claimRoom(roomId);
      toast.success(
        t("notifications.claimSuccess", "Chat claimed successfully"),
      );
      navigate(`/support`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to claim chat",
      );
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <Loading text={false} height={"20"} width={"20"} />;
  }

  if (!notification) {
    return (
      <section className="space-y-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <div className="font-title text-lg font-semibold text-slate-900 mb-2">{t('notificationNotFound')}</div>
          <div className="text-sm text-slate-500 mb-6">{t('theNotificationYoureLookingForDoesntExist')}</div>
          <Button
            onClick={() => navigate(-1)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >{t('goBack')}</Button>
        </Card>
      </section>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/notifications")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">{t('catalog.back')}</span>
        </button>
        <div className="flex items-center gap-3">
          {!notification.isRead && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{t('unread')}</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-8">
        {/* Title Section */}
        <div className="flex items-start gap-4 mb-8">
          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="font-title text-3xl font-bold text-slate-900 mb-2">
              {notification.title}
            </div>
            <div className="text-slate-600">{notification.message}</div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-200">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('created')}</div>
            <div className="flex items-center gap-2 text-sm text-slate-900">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatDate(notification.createdAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('readAt')}</div>
            <div className="flex items-center gap-2 text-sm text-slate-900">
              <Clock className="h-4 w-4 text-slate-400" />
              {formatDate(notification.readAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('catalog.type')}</div>
            <div className="text-sm font-medium text-slate-900 capitalize">
              {notification.type}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {notification.metadata?.orderId && (
          <div className="pt-8 border-t border-slate-200 space-y-3">
            <Button
              onClick={() =>
                navigate(`/orders/${notification.metadata.orderId}`)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >{t('viewOrder')}</Button>
          </div>
        )}
        {notification.metadata?.articleSlug && (
          <div className="pt-8 border-t border-slate-200 space-y-3">
            <Button
              onClick={() =>
                navigate(`/articles/${notification.metadata.articleSlug}`)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >{t('viewArticle')}</Button>
          </div>
        )}
        {notification.metadata?.action === "claim_chat" &&
          notification.metadata?.roomId && (
            <div className="pt-8 border-t border-slate-200 space-y-3">
              <Button
                onClick={() => handleClaimChat(notification.metadata.roomId)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={claiming}
              >
                {claiming && <Loading />}
                Claim Support Chat
              </Button>
            </div>
          )}

        {/* Mark as Read / Archive */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
          <Button
            variant="outline"
            className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />{t('catalog.delete')}</Button>
        </div>
      </Card>
    </section>
  );
};

export default NotificationDetailPage;
