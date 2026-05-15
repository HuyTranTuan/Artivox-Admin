import { useUI } from "@/hooks/useUI";
import React from "react";

export default function ThemeProvider(children) {
  const { theme } = useUI;
  return <div>{() => children}</div>;
}
