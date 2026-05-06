import { cn } from "@utils/cn";

const mapStatusClassName = {
  Published: "text-emerald-700",
  Draft: "text-slate-600",
  Review: "text-amber-700",
  PENDING: "text-amber-700",
  PAID: "text-emerald-700",
  REFUND_PENDING: "text-rose-700",
};

export const Badge = ({ children, className }) => {
  return (
    <span
      className={cn(
        "font-title inline-flex text-xs font-semibold",
        mapStatusClassName[children] || "text-slate-600",
        className,
      )}
    >
      {children}
    </span>
  );
};
