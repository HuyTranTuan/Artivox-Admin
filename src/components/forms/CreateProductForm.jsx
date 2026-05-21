import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { useTranslation } from "@hooks/useTranslation";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { PasswordInput } from "@components/ui/password-input";

export default CreateProductForm = () => {
  const { t } = useTranslation();
  const param = useParams();

  const {
    register,
    handleSignIn,
    formState: { errors },
  } = useForm({ resolver: product.schema });

  const [form, setForm] = useState({
    email: "account@gmail.com",
    password: "123456",
  });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    const parsed = pr.safeParse(form);

    if (!parsed.success) {
      setError(t("common.invalidCredentials"));
      return;
    }

    setError("");
    await handleSignIn(form);
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="mb-8">
        <div className="font-title text-3xl font-bold text-slate-950">{t("common.signIn")}</div>
        <div className="mt-2 text-sm text-slate-500">{t("common.createModelForm")}</div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="font-title text-sm font-semibold text-slate-800">{t("common.email")}</label>
          <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="font-title text-sm font-semibold text-slate-800">{t("common.password")}</label>
          <PasswordInput value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        </div>
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        <Button className="w-full" type="submit">
          {t("common.create")}
        </Button>
      </form>
    </Card>
  );
};
