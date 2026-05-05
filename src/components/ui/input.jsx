import { cn } from "@utils/cn";

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-400",
        className
      )}
      {...props}
    />
  );
};
