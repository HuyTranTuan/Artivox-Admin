import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  required = false,
  options = [],
  placeholder = "",
  rows = 3,
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {type === "textarea" ? (
        <Textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows}
          {...props}
        />
      ) : type === "select" ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "file" ? (
        <Input
          id={id}
          name={id}
          type="file"
          onChange={onChange}
          required={required}
          {...props}
        />
      ) : (
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          {...props}
        />
      )}
    </div>
  );
}
