import { cn } from "@utils/cn";

export const Button = ({ className, variant = "primary", ...props }) => {
  const variantClassName = {
    primary: "bg-amber-500 hover:bg-amber-400",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    secondary: "bg-slate-900 hover:bg-slate-800 text-white",
    destructive: "bg-rose-600 hover:bg-rose-500",
    "outline-orange":
      "bg-white text-orange-500 border border-orange-400 hover:bg-orange-500 hover:text-white",
  };

  return (
    <button
      className={cn(
        "font-title inline-flex items-center justify-center rounded-xl text-sm font-semibold transition cursor-pointer",
        variantClassName[variant],
        className,
      )}
      {...props}
    />
  );
};
