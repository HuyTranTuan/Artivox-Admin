import { cn } from "@utils/cn";

const mapStatusClassName = {
  Published: "bg-emerald-100 text-emerald-700",
  Draft: "bg-slate-100 text-slate-600",
  Review: "bg-amber-100 text-amber-700",
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  REFUND_PENDING: "bg-rose-100 text-rose-700"
};

export const Badge = ({ children, className }) => {
  return (
    <span
      className={cn(
        "font-title inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        mapStatusClassName[children] || "bg-slate-100 text-slate-600",
        className
      )}
    >
      {children}
    </span>
  );
};
