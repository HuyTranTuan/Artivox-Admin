import { useEffect, useState } from "react";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { orderService } from "@services/orderService";
import { formatPrice } from "@utils/formatPrice";

const OrderApprovalPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      const data = await orderService.listOrders();

      if (mounted) {
        setOrders(data);
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="font-title text-2xl font-bold text-slate-950">Order approval</div>
      <div className="mt-2 text-sm text-slate-500">Lifecycle: PENDING - PAID - REFUND_PENDING</div>

      <div className="mt-6 space-y-3">
        {orders.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <div className="font-title font-semibold text-slate-900">{item.id}</div>
              <div className="mt-1 text-sm text-slate-500">{item.customer}</div>
            </div>
            <div className="font-title text-sm font-semibold text-slate-900">
              {formatPrice(item.amount)}
            </div>
            <Badge>{item.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default OrderApprovalPage;
