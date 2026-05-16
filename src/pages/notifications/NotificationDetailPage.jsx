import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, AlertCircle, CheckCircle, Info, Trash2 } from "lucide-react";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useState } from "react";

// Mock notifications data - in real app, fetch from API
const mockNotifications = {
  1: {
    id: 1,
    title: "New refund request",
    description: "Order #AVX-201 needs approval.",
    content:
      "Customer 'Tran Anh' has requested a refund for order #AVX-201. The order contains a Dragon Sculpture Pro (Qty: 2) totaling ₫4.8M. Reason: Item damaged during shipping. Please review the attached photos and approve/deny the refund request.",
    type: "refund",
    status: "unread",
    priority: "high",
    createdAt: "2026-05-15T14:30:00Z",
    relatedOrder: "#AVX-201",
    attachments: [
      { id: 1, name: "damage_photo_1.jpg", url: "#" },
      { id: 2, name: "damage_photo_2.jpg", url: "#" },
    ],
    actions: [
      { label: "Approve Refund", variant: "default", color: "bg-emerald-600 hover:bg-emerald-700" },
      { label: "Request More Info", variant: "secondary", color: "bg-amber-600 hover:bg-amber-700" },
      { label: "Deny Refund", variant: "destructive", color: "bg-rose-600 hover:bg-rose-700" },
    ],
  },
  2: {
    id: 2,
    title: "Low stock alert",
    description: "Resin Material 08 is below threshold.",
    content:
      "Resin Material 08 (Premium UV Resin) has fallen below the minimum stock level. Current stock: 12 units. Minimum threshold: 50 units. Please reorder this item to avoid stockouts.",
    type: "stock",
    status: "read",
    priority: "medium",
    createdAt: "2026-05-14T10:15:00Z",
    relatedProduct: "Resin Material 08",
    currentStock: 12,
    minimumStock: 50,
    actions: [
      { label: "Create Purchase Order", variant: "default", color: "bg-blue-600 hover:bg-blue-700" },
      { label: "Dismiss", variant: "secondary", color: "bg-slate-600 hover:bg-slate-700" },
    ],
  },
  3: {
    id: 3,
    title: "Campaign published",
    description: "Summer Launch article is now live.",
    content:
      "The 'Summer Collection 2026 Launch' campaign has been successfully published and is now visible to customers. The campaign includes 12 featured 3D models and promotional discounts. Monitor performance metrics in the analytics dashboard.",
    type: "info",
    status: "read",
    priority: "low",
    createdAt: "2026-05-13T09:45:00Z",
    campaignName: "Summer Collection 2026 Launch",
    views: 2451,
    clicks: 342,
  },
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "refund":
      return <AlertCircle className="h-6 w-6 text-amber-600" />;
    case "stock":
      return <AlertCircle className="h-6 w-6 text-orange-600" />;
    case "info":
      return <Info className="h-6 w-6 text-blue-600" />;
    case "success":
      return <CheckCircle className="h-6 w-6 text-emerald-600" />;
    default:
      return <Info className="h-6 w-6 text-slate-600" />;
  }
};

const getNotificationBadgeColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-rose-100 text-rose-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "low":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const NotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMarked, setIsMarked] = useState(false);

  const notification = mockNotifications[id];

  if (!notification) {
    return (
      <section className="space-y-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <div className="font-title text-lg font-semibold text-slate-900 mb-2">Notification not found</div>
          <div className="text-sm text-slate-500 mb-6">The notification you're looking for doesn't exist.</div>
          <Button onClick={() => navigate(-1)} className="bg-amber-600 hover:bg-amber-700 text-white">
            Go Back
          </Button>
        </Card>
      </section>
    );
  }

  const formatDate = (dateString) => {
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
    <section className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getNotificationBadgeColor(notification.priority)}`}>
            {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
          </span>
          {notification.status === "unread" && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Unread</span>}
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-8">
        {/* Title Section */}
        <div className="flex items-start gap-4 mb-8">
          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="font-title text-3xl font-bold text-slate-900 mb-2">{notification.title}</div>
            <div className="text-slate-600">{notification.description}</div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-200">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Created</div>
            <div className="flex items-center gap-2 text-sm text-slate-900">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatDate(notification.createdAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</div>
            <div className="text-sm font-medium text-slate-900 capitalize">{notification.type}</div>
          </div>
          {notification.relatedOrder && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Order</div>
              <div className="text-sm font-medium text-amber-600 cursor-pointer hover:text-amber-700">{notification.relatedOrder}</div>
            </div>
          )}
          {notification.relatedProduct && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Product</div>
              <div className="text-sm font-medium text-slate-900">{notification.relatedProduct}</div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="py-8 space-y-6">
          <div>
            <div className="font-title text-lg font-semibold text-slate-900 mb-3">Details</div>
            <div className="text-slate-700 leading-relaxed">{notification.content}</div>
          </div>

          {/* Additional Info Based on Type */}
          {notification.currentStock !== undefined && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="font-semibold text-amber-900 mb-2">Stock Status</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-amber-700 text-xs">Current Stock</div>
                  <div className="font-bold text-amber-900">{notification.currentStock} units</div>
                </div>
                <div>
                  <div className="text-amber-700 text-xs">Minimum Threshold</div>
                  <div className="font-bold text-amber-900">{notification.minimumStock} units</div>
                </div>
              </div>
            </div>
          )}

          {notification.campaignName && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="font-semibold text-blue-900 mb-2">Campaign Performance</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-blue-700 text-xs">Views</div>
                  <div className="font-bold text-blue-900">{notification.views.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-blue-700 text-xs">Clicks</div>
                  <div className="font-bold text-blue-900">{notification.clicks.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          {notification.attachments && (
            <div>
              <div className="font-semibold text-slate-900 mb-3">Attachments</div>
              <div className="space-y-2">
                {notification.attachments.map((att) => (
                  <a key={att.id} href={att.url} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition border border-slate-200">
                    <div className="text-slate-400">📎</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{att.name}</div>
                    </div>
                    <div className="text-slate-400">→</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {notification.actions && (
          <div className="pt-8 border-t border-slate-200 space-y-3">
            <div className="font-semibold text-slate-900 mb-4">Actions</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notification.actions.map((action, idx) => (
                <button key={idx} className={`px-4 py-3 rounded-lg font-medium transition ${action.color} text-white`}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mark as Read / Archive */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
          <Button onClick={() => setIsMarked(!isMarked)} variant="outline" className="flex-1 gap-2">
            {isMarked ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Marked as read
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Mark as read
              </>
            )}
          </Button>
          <Button variant="outline" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </Card>
    </section>
  );
};
