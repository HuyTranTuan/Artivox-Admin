import { useState } from "react";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { signInSchema } from "@validators/auth.schema";
import { PasswordInput } from "../ui/password-input";
import { readStorage } from "@/utils/localStorage";
import { useTranslation } from "react-i18next";

const SignInForm = () => {
  const { handleSignIn } = useAuth();
  const { t } = useTranslation();
  const user = readStorage("artivox-auth").state.user;
  const [form, setForm] = useState({
    email: user?.email || "account@gmail.com",
    password: "",
  });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    const parsed = signInSchema.safeParse(form);

    if (!parsed.success) {
      setError("Invalid credentials");
      return;
    }

    setError("");
    await handleSignIn(form);
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="mb-8">
        <div className="font-title text-3xl font-bold text-slate-950 text-center">Sign in</div>
        <div className="mt-2 text-sm text-slate-500 text-center">{t("")}</div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="font-title text-sm font-semibold text-slate-800">Email</label>
          <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="font-title text-sm font-semibold text-slate-800">Password</label>
          <PasswordInput
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
          />
        </div>
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        <Button className="w-full" type="submit">
          Access Dashboard
        </Button>
      </form>
    </Card>
  );
};

export default SignInForm;
