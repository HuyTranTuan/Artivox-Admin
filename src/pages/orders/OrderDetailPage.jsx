import { useEffect, useState } from "react";
import useTranslation from "@/hooks/useTranslation";
import { useParams, useNavigate } from "react-router-dom";
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
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { orderService } from "@services/orderService";
import { Loader2 } from "lucide-react";

// removed static ordersData

const formatPrice = (value) => {
  if (value == null) return "—";
  return `₫${Number(value).toLocaleString()}`;
};

const statusConfig = {
  Delivered: {
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  Processing: {
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: AlertCircle,
  },
  Shipped: { color: "text-blue-600 bg-blue-50 border-blue-200", icon: Truck },
  Pending: {
    color: "text-slate-600 bg-slate-100 border-slate-200",
    icon: Clock,
  },
};

const OrderDetailPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        if (data) {
          setOrder({
            id: data.orderNumber || `#${data.id}`,
            customer: data.customer?.fullName || data.customer?.name || "—",
            email: data.customer?.email || "—",
            phone: data.customer?.phone || "—",
            amount: data.totalAmount,
            status: data.status,
            createdAt: new Date(data.createdAt).toLocaleDateString(),
            shippedAt: data.status === "SHIPPED" || data.status === "COMPLETED" ? new Date(data.updatedAt || data.createdAt).toLocaleDateString() : null,
            deliveredAt: data.status === "COMPLETED" ? new Date(data.updatedAt || data.createdAt).toLocaleDateString() : null,
            address: data.shippingAddress || "—",
            paymentMethod: data.paymentMethod || "—",
            note: data.note || "",
            items: data.items?.map(item => ({
              name: item.product?.name || "—",
              sku: item.product?.sku || "—",
              qty: item.quantity,
              price: item.product?.discountedPrice > 0 ? item.product.discountedPrice : item.product?.basePrice
            })) || [],
            shippingMethod: "Standard",
            trackingNumber: null,
            totalWeight: "—",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

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
          <div className="font-title text-xl font-bold text-slate-900 mb-2">
            {t("orderNotFound")}
          </div>
          <div className="text-sm text-slate-500">
            No order found for ID: {orderId}
          </div>
        </Card>
      </section>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const statusStyle =
    statusConfig[order.status]?.color || "text-slate-600 bg-slate-100";

  const timeline = [
    {
      label: "Order Placed",
      date: order.createdAt,
      done: true,
      icon: CreditCard,
      description: "Order has been placed successfully",
    },
    {
      label: "Payment Confirmed",
      date: order.createdAt,
      done: order.status !== "Pending",
      icon: CheckCircle,
      description: "Payment verified via " + order.paymentMethod,
    },
    {
      label: "Processing",
      date:
        order.status === "Processing"
          ? order.createdAt
          : order.shippedAt
            ? order.createdAt
            : null,
      done: order.status !== "Pending",
      icon: Package,
      description: "Order is being prepared",
    },
    {
      label: "Shipped",
      date: order.shippedAt,
      done: !!order.shippedAt,
      icon: Truck,
      description: order.trackingNumber
        ? `Tracking: ${order.trackingNumber}`
        : "Awaiting shipment",
    },
    {
      label: "Delivered",
      date: order.deliveredAt,
      done: !!order.deliveredAt,
      icon: Package,
      description: order.deliveredAt
        ? "Package delivered successfully"
        : "In transit",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          {t("catalog.back")}
        </Button>
        <div>
          <h1 className="font-title text-2xl font-bold text-slate-900">
            {order.id}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-sm text-slate-500">
              Created {order.createdAt}
            </span>
          </div>
        </div>
        <span
          className={`ml-auto text-sm font-semibold px-4 py-1.5 rounded-full border flex items-center gap-1.5 ${statusStyle}`}
        >
          <StatusIcon className="h-4 w-4" />
          {order.status}
        </span>
      </div>

      {/* Timeline - Full width at top */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="font-title text-base font-bold text-slate-900">
            {t("orderTimeline")}
          </h2>
        </div>
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {timeline.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div key={step.label} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${step.done ? "bg-emerald-500 text-white shadow-md" : "bg-slate-100 text-slate-400 border-2 border-dashed border-slate-300"}`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div
                    className={`mt-2 text-center px-2 ${step.done ? "text-slate-900" : "text-slate-400"}`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {step.label}
                    </div>
                    <div className="text-[10px] mt-0.5 text-slate-500">
                      {step.date || "—"}
                    </div>
                    <div className="text-[9px] mt-0.5 text-slate-400 max-w-[120px] leading-tight">
                      {step.description}
                    </div>
                  </div>
                </div>
                {i < timeline.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mt-5 mx-1 ${step.done ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Customer Info (left) + Order Details (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-title text-base font-bold text-slate-900">
                {t("customerInformation")}
              </div>
              <div className="text-xs text-slate-500">
                {t("contactAndShippingDetails")}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("settings.fullName")}
                </div>
                <div className="text-sm text-slate-900 font-medium mt-0.5">
                  {order.customer}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("common.email")}
                </div>
                <div className="text-sm text-slate-700 mt-0.5">
                  {order.email}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                <Phone className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("common.phone")}
                </div>
                <div className="text-sm text-slate-700 mt-0.5">
                  {order.phone}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("shippingAddress")}
                </div>
                <div className="text-sm text-slate-700 mt-0.5">
                  {order.address}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {t("shippingMethod")}
                  </div>
                  <div className="text-sm text-slate-900 font-medium mt-0.5">
                    {order.shippingMethod}
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-slate-500">Tracking: </span>
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-blue-600">
                        {order.trackingNumber}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="font-title text-base font-bold text-slate-900">
                {t("orderDetails")}
              </div>
              <div className="text-xs text-slate-500">
                {t("productAndPaymentInformation")}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {/* Order summary */}
            <div className="rounded-xl bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("orderId")}
                </div>
                <div className="text-xs font-mono font-bold text-slate-900">
                  {order.id}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("paymentMethod")}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {order.paymentMethod}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {t("totalWeight")}
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  {order.totalWeight}
                </div>
              </div>
            </div>

            {/* Items table */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                {t("orderItems")}
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 bg-slate-50 px-4 py-2 text-[10px] uppercase tracking-wider font-bold text-slate-600 border-b border-slate-200">
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
                    <div className="font-medium text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {item.sku}
                    </div>
                    <div className="text-slate-700">x{item.qty}</div>
                    <div className="text-right font-medium text-slate-900">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {t("subtotal")}
              </div>
              <div className="text-sm text-slate-700">
                {formatPrice(order.amount)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {t("shipping")}
              </div>
              <div className="text-sm text-slate-700">{t("free")}</div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div className="font-title text-base font-bold text-slate-900">
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
