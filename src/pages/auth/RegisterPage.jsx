import { useTranslate } from "@/i18n/useTranslate";
import { Card } from "@components/ui/card";

const RegisterPage = () => {
  const { t } = useTranslate();

  return (
    <Card className="w-full max-w-md p-8">
      <div className="font-title text-3xl font-bold text-slate-950">{t('auth.register')}</div>
      <div className="mt-3 text-sm text-slate-500">{t('reservedForAdminOnboardingFlow')}</div>
    </Card>
  );
};

export default RegisterPage;
