import useTranslation from "@/hooks/useTranslation";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  Star,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { formatPrice } from "@/utils/formatUtils";
import { customerService } from "@/services/customerService";
import { orderService } from "@/services/orderService";
const orderStatusColor = {
  DELIVERED: "text-emerald-600",
  COMPLETED: "text-emerald-600",
  PROCESSING: "text-amber-600",
  SHIPPED: "text-blue-600",
  PENDING: "text-(--color-primary)",
  PAYMENT_CONFIRMED: "text-indigo-600",
  CANCELED: "text-red-600",
};

const CustomerDetailPage = () => {
  const { t } = useTranslation();

  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customerRes, ordersRes] = await Promise.all([
          customerService.getCustomerById(id),
          orderService.listOrders({ customerId: id }),
        ]);
        setCustomer(customerRes?.data || customerRes);
        setOrders(ordersRes?.data || ordersRes || []);
      } catch (error) {
        console.error("Failed to fetch customer details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500">Customer not found</div>
    );
  }

  const totalSpent = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="h-9 w-9 p-0! rounded-xl hover:bg-(--color-primary) cursor-pointer"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-title text-xl font-bold">{customer.fullName}</h1>
          <p className="text-xl">Customer #{customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl font-bold mb-3 text-white">
              {customer.fullName?.charAt(0) || customer.email?.charAt(0) || "C"}
            </div>
            <div className="font-title text-lg font-bold ">
              {customer.fullName}
            </div>
            <Badge className="mt-1">Standard</Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              {customer.email}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              {customer.phone || "N/A"}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              {customer.address || "N/A"}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              Joined{" "}
              {customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div className="font-title text-xl font-bold ">
                {orders.length}
              </div>
              <div className="text-xs ">{t("customers.columns.orders")}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="font-title text-xl font-bold ">
                {formatPrice(totalSpent)}
              </div>
              <div className="text-xs ">{t("spent")}</div>
            </div>
          </div>
        </Card>

        {/* Orders */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-title text-lg font-bold  mb-4">
            {t("dashboard.recentOrders")}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em]  border-b border-slate-300">
              <div>{t("orderId")}</div>
              <div>{t("orders.date")}</div>
              <div>{t("items")}</div>
              <div>{t("total")}</div>
              <div>{t("articles.status")}</div>
            </div>
            {orders.map((o) => (
              <div
                key={o.id}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 px-4 py-3 text-sm"
              >
                <div className="font-medium ">#{o.orderNumber || o.id}</div>
                <div>
                  {new Date(o.createdAt || o.date).toLocaleDateString()}
                </div>
                <div>{o.items?.length || o.items} </div>
                <div className="font-medium">
                  {formatPrice(o.totalAmount || o.total)}
                </div>
                <div>
                  <span
                    className={`font-medium ${orderStatusColor[o.status] || ""}`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CustomerDetailPage;
