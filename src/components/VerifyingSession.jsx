import { useTranslate } from "@/i18n/useTranslate";
import React from "react";

export default function VerifyingSession() {
  const { t } = useTranslate();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-sm text-slate-500">{t('verifyingSession')}</div>
    </div>
  );
}
