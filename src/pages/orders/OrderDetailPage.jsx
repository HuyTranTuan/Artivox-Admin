import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, User, Calendar, CreditCard, Truck } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";

const ordersData = {
  "ORD-1847": { id: "#ORD-1847", customer: "Nguyen Minh", email: "nguyen.minh@example.com", phone: "+84 901234567", model: "Dragon Sculpture Pro", amount: "₫2,400,000", status: "Delivered", createdAt: "May 5, 2026", shippedAt: "May 6, 2026", deliveredAt: "May 8, 2026", address: "123 Le Loi, District 1, Ho Chi Minh City", paymentMethod: "Credit Card", qty: 1, note: "Gift wrapping requested." },
  "ORD-1846": { id: "#ORD-1846", customer: "Tran Anh", email: "tran.anh@example.com", phone: "+84 909876543", model: "Mech Robot Alpha", amount: "₫1,800,000", status: "Processing", createdAt: "May 4, 2026", shippedAt: null, deliveredAt: null, address: "456 Hai Ba Trung, District 3, Ho Chi Minh City", paymentMethod: "Bank Transfer", qty: 2, note: "" },
  "ORD-1845": { id: "#ORD-1845", customer: "Le Hieu", email: "le.hieu@example.com", phone: "+84 912345678", model: "Architectural Villa", amount: "₫3,200,000", status: "Shipped", createdAt: "May 3, 2026", shippedAt: "May 4, 2026", deliveredAt: null, address: "789 Nguyen Hue, District 1, Ho Chi Minh City", paymentMethod: "Credit Card", qty: 1, note: "Fragile — handle with care." },
  "ORD-1844": { id: "#ORD-1844", customer: "Pham Duc", email: "pham.duc@example.com", phone: "+84 923456789", model: "Fantasy Sword Set", amount: "₫1,200,000", status: "Pending", createdAt: "May 2, 2026", shippedAt: null, deliveredAt: null, address: "321 Tran Hung Dao, District 5, Ho Chi Minh City", paymentMethod: "COD", qty: 3, note: "" },
  "ORD-1843": { id: "#ORD-1843", customer: "Hoang Tuan", email: "hoang.tuan@example.com", phone: "+84 934567890", model: "Miniature Castle", amount: "₫2,800,000", status: "Delivered", createdAt: "May 1, 2026", shippedAt: "May 2, 2026", deliveredAt: "May 4, 2026", address: "654 Vo Van Tan, District 3, Ho Chi Minh City", paymentMethod: "Credit Card", qty: 1, note: "" },
};

const statusStyles = {
  Delivered: "text-emerald-600 bg-emerald-50",
  Processing: "text-amber-600 bg-amber-50",
  Shipped: "text-blue-600 bg-blue-50",
  Pending: "text-slate-600 bg-slate-100",
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = ordersData[orderId];

  if (!order) {
    return (
      <section className="space-y-6">
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="p-8 text-center">
          <div className="font-title text-xl font-bold text-slate-900 mb-2">Order not found</div>
          <div className="text-sm text-slate-500">No order found for ID: {orderId}</div>
        </Card>
      </section>
    );
  }

  const timeline = [
    { label: "Order Placed", date: order.createdAt, done: true, icon: CreditCard },
    { label: "Shipped", date: order.shippedAt, done: !!order.shippedAt, icon: Truck },
    { label: "Delivered", date: order.deliveredAt, done: !!order.deliveredAt, icon: Package },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="font-title text-2xl font-bold text-slate-900">{order.id}</h1>
          <div className="text-sm text-slate-500">Created {order.createdAt}</div>
        </div>
        <span className={`ml-auto text-sm font-semibold px-3 py-1 rounded-lg ${statusStyles[order.status]}`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <User className="h-5 w-5" />
            </div>
            <div className="font-title text-base font-bold text-slate-900">Customer</div>
          </div>
          <div className="space-y-3 text-sm">
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Name</div><div className="text-slate-900 font-medium">{order.customer}</div></div>
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Email</div><div className="text-slate-700">{order.email}</div></div>
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Phone</div><div className="text-slate-700">{order.phone}</div></div>
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Address</div><div className="text-slate-700">{order.address}</div></div>
          </div>
        </Card>

        {/* Order Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Package className="h-5 w-5" />
            </div>
            <div className="font-title text-base font-bold text-slate-900">Order Details</div>
          </div>
          <div className="space-y-3 text-sm">
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Product</div><div className="text-slate-900 font-medium">{order.model}</div></div>
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Quantity</div><div className="text-slate-700">{order.qty}</div></div>
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Amount</div><div className="font-title text-lg font-bold text-slate-900">{order.amount}</div></div>
            <div><div className="text-xs text-slate-400 uppercase mb-0.5">Payment</div><Badge>{order.paymentMethod}</Badge></div>
            {order.note && <div><div className="text-xs text-slate-400 uppercase mb-0.5">Note</div><div className="text-slate-700 italic">{order.note}</div></div>}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="font-title text-base font-bold text-slate-900">Timeline</div>
          </div>
          <div className="space-y-6">
            {timeline.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 ${step.done ? "bg-emerald-300" : "bg-slate-200"}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className={`text-sm font-semibold ${step.done ? "text-slate-900" : "text-slate-400"}`}>{step.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{step.date || "—"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default OrderDetailPage;
