import { useTranslation } from "@hooks/useTranslation";

export default function VerifyingSession() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-sm text-slate-500">{t("verifyingSession")}</div>
    </div>
  );
}