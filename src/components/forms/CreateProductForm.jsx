import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { signInSchema } from "@validators/auth.schema";

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
      setError("Invalid credentials");
      return;
    }

    setError("");
    await handleSignIn(form);
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="mb-8">
        <div className="font-title text-3xl font-bold text-slate-950">Sign in</div>
        <div className="mt-2 text-sm text-slate-500">Create Model Form.</div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="font-title text-sm font-semibold text-slate-800">Email</label>
          <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="font-title text-sm font-semibold text-slate-800">Password</label>
          <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        </div>
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        <Button className="w-full" type="submit">
          Create
        </Button>
      </form>
    </Card>
  );
};
