import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, CreditCard, Star } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";

const mockCustomer = (id) => ({
  id, name: `Nguyen Minh ${id}`, email: `customer${id}@example.com`,
  phone: `+84 90000000${id}`, status: ["Active","Inactive","Suspended"][id%3],
  tier: ["Standard","Premium","VIP"][id%3], address: "123 Nguyen Hue, District 1, HCMC",
  totalOrders: 24, totalSpent: 12500000, joinedAt: "2025-08-15",
  orders: Array.from({length:8},(_,i)=>({
    id: 1000+i, date: new Date(Date.now()-i*7*24*60*60*1000).toLocaleDateString(),
    total: Math.floor(Math.random()*5000000)+200000, status:["Delivered","Processing","Shipped","Pending"][i%4], items: Math.floor(Math.random()*5)+1,
  })),
});

const orderStatusColor = { Delivered:"text-emerald-600", Processing:"text-amber-600", Shipped:"text-blue-600", Pending:"text-slate-500" };

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer] = useState(mockCustomer(Number(id)));
  const fmt = (v) => new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(v);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg" onClick={()=>navigate("/customers")}><ArrowLeft className="h-5 w-5"/></Button>
        <div>
          <h1 className="font-title text-2xl font-bold text-slate-950">{customer.name}</h1>
          <p className="text-sm text-slate-500">Customer #{customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
              {customer.name.charAt(0)}
            </div>
            <div className="font-title text-lg font-bold text-slate-900">{customer.name}</div>
            <Badge className="mt-1">{customer.tier}</Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600"><Mail className="h-4 w-4 text-slate-400 shrink-0"/>{customer.email}</div>
            <div className="flex items-center gap-3 text-sm text-slate-600"><Phone className="h-4 w-4 text-slate-400 shrink-0"/>{customer.phone}</div>
            <div className="flex items-center gap-3 text-sm text-slate-600"><MapPin className="h-4 w-4 text-slate-400 shrink-0"/>{customer.address}</div>
            <div className="flex items-center gap-3 text-sm text-slate-600"><Calendar className="h-4 w-4 text-slate-400 shrink-0"/>Joined {customer.joinedAt}</div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center">
            <div><div className="flex items-center justify-center gap-1 text-slate-400 mb-1"><ShoppingBag className="h-4 w-4"/></div><div className="font-title text-xl font-bold text-slate-900">{customer.totalOrders}</div><div className="text-xs text-slate-500">Orders</div></div>
            <div><div className="flex items-center justify-center gap-1 text-slate-400 mb-1"><CreditCard className="h-4 w-4"/></div><div className="font-title text-xl font-bold text-slate-900">{fmt(customer.totalSpent)}</div><div className="text-xs text-slate-500">Spent</div></div>
          </div>
        </Card>

        {/* Orders */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-title text-lg font-bold text-slate-900 mb-4">Recent Orders</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500 border-b border-slate-300">
              <div>Order ID</div><div>Date</div><div>Items</div><div>Total</div><div>Status</div>
            </div>
            {customer.orders.map((o)=>(
              <div key={o.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
                <div className="font-medium text-slate-900">#{o.id}</div>
                <div>{o.date}</div>
                <div>{o.items} items</div>
                <div className="font-medium">{fmt(o.total)}</div>
                <div><span className={`font-medium ${orderStatusColor[o.status]}`}>{o.status}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CustomerDetailPage;
