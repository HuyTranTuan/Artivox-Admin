import PropTypes from "prop-types";

import useTranslation from "@/hooks/useTranslation";

const STATUS_COLORS = {
  COMPLETED: "bg-(--color-success)/20 text-(--color-success)",
  PENDING: "bg-(--color-primary)/20 text-(--color-primary)",
  CANCELLED: "bg-(--color-error)/20 text-(--color-error)",
  PROCESSING: "bg-(--color-processing)/20 text-(--color-processing)",
};

export default function OrderStatus({ status, count, orders }) {
  const { t } = useTranslation();

  return (
    <div key={status} className="flex items-center gap-3">
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || "text-(--color-primary)"}`}>{t(`${status.toLocaleLowerCase()}`)}</span>
      <div className="flex-1 bg-(--color-primary)/20 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-(--color-primary)"
          style={{
            width: `${Math.min((count / (orders || 1)) * 100, 100)}%`,
          }}
        />
      </div>
      <span className="text-sm font-semibold w-6 text-right">{count}</span>
    </div>
  );
}

OrderStatus.propTypes = {
  status: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
};
