import { cn } from "@utils/cn";

export const Card = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "card-shadow rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur",
        className
      )}
      {...props}
    />
  );
};
