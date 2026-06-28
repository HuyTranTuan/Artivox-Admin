import PropTypes from "prop-types";

import { formatPrice } from "@/utils/formatUtils";
import useTranslation from "@/hooks/useTranslation";

const STATUS_COLORS = {
  COMPLETED: "bg-(--color-success)/20 text-(--color-success)",
  PENDING: "bg-(--color-primary)/20 text-(--color-primary)",
  CANCELLED: "bg-(--color-error)/20 text-(--color-error)",
  PROCESSING: "bg-(--color-processing)/20 text-(--color-processing)",
};

export default function RecentOrder({ order, index }) {
  const { t } = useTranslation();
  return (
    <div key={order.id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-(--color-primary)/10 transition">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-primary) text-(--color-primary) font-bold text-sm shrink-0">{index}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{order.customerName}</div>
        <div className="text-xs">{order.customerEmail}</div>
      </div>
      <div className="flex-1 min-w-0">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || "text-(--color-primary)"}`}>{t(`${order.status.toLowerCase()}`)}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold">{formatPrice(order.totalAmount)}</div>
        </div>
      </div>
    </div>
  );
}

RecentOrder.propTypes = {
  order: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};
