import { forwardRef, useCallback } from "react";
import { cn } from "@utils/cn";

const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'\/]/g, "");
};

export const Input = forwardRef(({ className, onChange, ...props }, ref) => {
  const handleChange = useCallback(
    (e) => {
      if (onChange) {
        const originalValue = e.target.value;
        const sanitized = sanitize(originalValue);
        if (sanitized !== originalValue) {
          Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          ).set.call(e.target, sanitized);
          e.target.value = sanitized;
        }
        onChange(e);
      }
    },
    [onChange],
  );

  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-(--color-primary)",
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
});

Input.displayName = "Input";
