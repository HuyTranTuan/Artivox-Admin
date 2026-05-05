import { cn } from "@utils/cn";

export const Button = ({ className, variant = "primary", ...props }) => {
  const variantClassName = {
    primary: "bg-amber-500 text-slate-950 hover:bg-amber-400",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    secondary: "bg-slate-900 text-white hover:bg-slate-800"
  };

  return (
    <button
      className={cn(
        "font-title inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
        variantClassName[variant],
        className
      )}
      {...props}
    />
  );
};
