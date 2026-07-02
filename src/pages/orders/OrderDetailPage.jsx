import { useEffect, useState } from "react";
import useTranslation from "@/hooks/useTranslation";
import useToast from "@/hooks/useToast";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  CreditCard,
  Truck,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  XCircle,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { orderService } from "@services/orderService";
import { Loader2 } from "lucide-react";

const formatPrice = (value) => {
  if (value == null) return "—";
  return `${Number(value).toLocaleString()}`;
};

// Status flow for the approval workflow
const STATUS_FLOW = [
  "PENDING",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const STATUS_LABELS = (t) => ({
  PENDING: t("orderPlaced"),
  PAYMENT_CONFIRMED: t("paymentConfirmed"),
  PROCESSING: t("processing"),
  SHIPPED: t("shipped"),
  DELIVERED: t("delivered"),
  COMPLETED: t("completed"),
  CANCELED: t("orderCancelled"),
});

// Next status in workflow
const NEXT_STATUS = {
  PENDING: "PAYMENT_CONFIRMED",
  PAYMENT_CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: "COMPLETED",
};

const CONFIRM_BTN_LABEL = (t) => ({
  PENDING: t("markPaymentConfirmed"),
  PAYMENT_CONFIRMED: t("markProcessing"),
  PROCESSING: t("markShipped"),
  SHIPPED: t("markDelivered"),
  DELIVERED: t("markCompleted"),
});

const statusConfig = {
  PENDING: {
    color: " border-slate-200",
    icon: Clock,
  },
  PAYMENT_CONFIRMED: {
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  PROCESSING: {
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: AlertCircle,
  },
  SHIPPED: { color: "text-blue-600 bg-blue-50 border-blue-200", icon: Truck },
  DELIVERED: {
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  COMPLETED: {
    color: "text-emerald-700 bg-emerald-100 border-emerald-300",
    icon: CheckCircle,
  },
  CANCELED: {
    color: "text-rose-600 bg-rose-50 border-rose-200",
    icon: XCircle,
  },
};

const OrderDetailPage = () => {
  const { t } = useTranslation();
  const { toastTopRight } = useToast();
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if we're in approval mode
  const isApprovalMode = location.pathname.endsWith("/approval");

  const [order, setOrder] = useState(null);
  const [rawStatus, setRawStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderByNumber(orderNumber);
      if (data) {
        setRawStatus(data.status);
        setOrder({
          id: data.orderNumber || `#${data.id}`,
          customer: data.customer?.fullName || data.customer?.name || "Unknown",
          email: data.customer?.email || "Unknown",
          phone: data.customer?.phone || "Unknown",
          amount: data.totalAmount,
          status: data.status,
          createdAt: new Date(data.createdAt).toLocaleDateString(),
          shippedAt: ["SHIPPED", "DELIVERED", "COMPLETED"].includes(data.status)
            ? new Date(data.updatedAt || data.createdAt).toLocaleDateString()
            : null,
          deliveredAt: ["DELIVERED", "COMPLETED"].includes(data.status)
            ? new Date(data.updatedAt || data.createdAt).toLocaleDateString()
            : null,
          address: data.shippingAddress || "Unknown",
          paymentMethod: data.paymentMethod || "Unknown",
          paymentStatus: data.paymentStatus || "UNKNOWN",
          note: data.note || "Unknown",
          items:
            data.items?.map((item) => ({
              name: item.product?.name || "Unknown",
              sku: item.product?.sku || "Unknown",
              qty: item.quantity,
              price:
                item.product?.discountedPrice > 0
                  ? item.product.discountedPrice
                  : item.product?.basePrice,
            })) || [],
          shippingMethod: "Standard",
          trackingNumber: null,
          totalWeight: "”",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) fetchOrder();
  }, [orderNumber]);

  const handleConfirm = async () => {
    const next = NEXT_STATUS[rawStatus];
    if (!next) return;
    try {
      setUpdating(true);
      const updated = await orderService.updateOrderStatus(orderNumber, next);
      setRawStatus(updated.status);
      setOrder((prev) => ({ ...prev, status: updated.status }));
      toastTopRight(
        "success",
        t("catalog.updateSuccess", "Order status updated successfully"),
      );
    } catch (e) {
      console.error(e);
      toastTopRight(
        "error",
        t("catalog.updateError", "Failed to update order status"),
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setUpdating(true);
      await orderService.updateOrderPaymentStatus(orderNumber, "PAID");
      setOrder((prev) => ({ ...prev, paymentStatus: "PAID" }));
      toastTopRight(
        "success",
        t("paymentMarkedPaid", "Payment marked as paid"),
      );
    } catch (e) {
      console.error(e);
      toastTopRight(
        "error",
        t("paymentUpdateError", "Failed to update payment status"),
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    try {
      setUpdating(true);
      await fetchOrder();
      toastTopRight(
        "success",
        t("catalog.updateSuccess", "Order update processed"),
      );
      navigate(-1);
    } catch (e) {
      console.error(e);
      toastTopRight(
        "error",
        t("catalog.updateError", "Failed to process order update"),
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="space-y-6">
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          {t("catalog.back")}
        </Button>
        <Card className="p-8 text-center">
          <div className="font-title text-xl font-bold mb-2">
            {t("orderNotFound")}
          </div>
          <div className="text-sm">No order found: {orderNumber}</div>
        </Card>
      </section>
    );
  }

  const StatusIcon = statusConfig[rawStatus]?.icon || Clock;
  const statusStyle = statusConfig[rawStatus]?.color;

  const timelineSteps = [
    { key: "PENDING", label: t("orderPlaced"), icon: CreditCard },
    {
      key: "PAYMENT_CONFIRMED",
      label: t("paymentConfirmed"),
      icon: CheckCircle,
    },
    { key: "PROCESSING", label: t("processing"), icon: Package },
    { key: "SHIPPED", label: t("shipped"), icon: Truck },
    { key: "DELIVERED", label: t("delivered"), icon: Package },
  ];

  const currentIdx = STATUS_FLOW.indexOf(rawStatus);
  const isDone = rawStatus === "COMPLETED" || rawStatus === "CANCELED";
  const canAdvance = isApprovalMode && !isDone && NEXT_STATUS[rawStatus];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          className="hover:bg-(--color-primary) cursor-pointer p-0! h-8 w-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-title text-2xl font-bold">{order.id}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm">
              {t("catalog.createdAt", "Order created")} {order.createdAt}
            </span>
          </div>
        </div>
        <span
          className={`ml-auto text-sm font-semibold px-4 py-1.5 rounded-full border flex items-center gap-1.5 ${statusStyle}`}
        >
          <StatusIcon className="h-4 w-4" />
          {STATUS_LABELS(t)[rawStatus] || rawStatus}
        </span>

        {/* Approval action buttons */}
        {isApprovalMode && (
          <div className="flex gap-2 ml-2">
            <Button
              variant="destructive"
              className="h-9 w-21 p-0! hover:bg-(--color-error) hover:text-white gap-2 cursor-pointer"
              onClick={() => navigate(-1)}
              disabled={updating}
            >
              <XCircle className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
            {canAdvance && (
              <Button
                className="h-9 w-50 p-0! hover:bg-(--color-primary) hover:text-white gap-2 cursor-pointer"
                onClick={handleConfirm}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {CONFIRM_BTN_LABEL(t)[rawStatus]}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="font-title text-base font-bold ">
            {t("orderTimeline")}
          </h2>
        </div>
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {timelineSteps.map((step, i) => {
            const StepIcon = step.icon;
            const stepIdx = STATUS_FLOW.indexOf(step.key);
            const done = rawStatus === "COMPLETED" || stepIdx <= currentIdx;
            const isCurrent = stepIdx === currentIdx && !isDone;
            return (
              <div key={step.key} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 transition-all ${
                      done
                        ? "bg-emerald-500 text-white shadow-md"
                        : isCurrent
                          ? "bg-amber-400 text-white shadow ring-2 ring-amber-200"
                          : "border-2 border-dashed border-slate-300"
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div
                    className={`mt-2 text-center px-2 ${done || isCurrent ? "" : "text-slate-400"}`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {step.label}
                    </div>
                  </div>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mt-5 mx-1 ${done && stepIdx < currentIdx ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Customer Info + Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-title text-base font-bold">
                {t("customerInformation")}
              </div>
              <div className="text-xs ">{t("contactAndShippingDetails")}</div>
            </div>
          </div>
          <div className="space-y-5">
            {[
              {
                icon: User,
                label: t("settings.fullName"),
                value: order.customer,
              },
              { icon: Mail, label: t("common.email"), value: order.email },
              { icon: Phone, label: t("common.phone"), value: order.phone },
              {
                icon: MapPin,
                label: t("shippingAddress"),
                value: order.address,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl   shrink-0 mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {label}
                  </div>
                  <div className="text-sm  font-medium mt-0.5">{value}</div>
                </div>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl   shrink-0 mt-0.5">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {t("shippingMethod")}
                  </div>
                  <div className="text-sm  font-medium mt-0.5">
                    {order.shippingMethod}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="font-title text-base font-bold ">
                {t("orderDetails")}
              </div>
              <div className="text-xs ">
                {t("productAndPaymentInformation")}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("orderId")}
                </div>
                <div className="text-xs font-mono font-bold ">{order.id}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("paymentMethod")}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {order.paymentMethod}
                  </Badge>
                  {order.paymentMethod === "COD" &&
                    order.paymentStatus !== "PAID" && (
                      <Button
                        size="sm"
                        onClick={handleMarkAsPaid}
                        disabled={updating}
                        className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {updating ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {t("markAsPaid", "Mark as Paid")}
                      </Button>
                    )}
                  {order.paymentStatus === "PAID" && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300 text-xs">
                      {t("paid", "Paid")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Items table */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                {t("orderItems")}
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 bg-slate-50 px-4 py-2 text-[10px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <div>{t("catalog.product")}</div>
                  <div>{t("sku")}</div>
                  <div>{t("qty")}</div>
                  <div className="text-right">{t("catalog.price")}</div>
                </div>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 text-sm border-b border-slate-100 last:border-b-0 items-center"
                  >
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-xs font-mono">{item.sku}</div>
                    <div className="">x{item.qty}</div>
                    <div className="text-right font-medium">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div className="text-xs uppercase tracking-wider font-semibold">
                {t("subtotal")}
              </div>
              <div className="text-sm">{formatPrice(order.amount)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider font-semibold">
                {t("shipping")}
              </div>
              <div className="text-sm">{t("free")}</div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div className="font-title text-base font-bold ">
                {t("total")}
              </div>
              <div className="font-title text-xl font-bold text-amber-600">
                {formatPrice(order.amount)}
              </div>
            </div>

            {/* Note */}
            {order.note && (
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 mt-2">
                <FileText className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold">
                    {t("note")}
                  </div>
                  <div className="text-xs text-slate-700 italic mt-0.5">
                    {order.note}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default OrderDetailPage;
