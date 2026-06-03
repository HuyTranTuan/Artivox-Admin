import useTranslation from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";
import React from "react";

export default function Loading({ text = true, width = "16", height = "16" }) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center justify-center w-full h-full`}>
      <div className="flex items-center gap-3 text-slate-500 dark:text-white">
        <Loader2
          className={`animate-spin w-${width} h-${height}`}
          width={width}
          height={height}
        />
        {text && (
          <span className="text-3xl">
            {t("settings.loading", "Loading...")}
          </span>
        )}
      </div>
    </div>
  );
}
