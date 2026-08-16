import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import { signup } from "../api/auth";
import { ApiRequestError } from "../api/client";
import { useToast } from "../context/ToastContext";

export function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(username, email, password);
      push("success", "Account created — sign in to continue.");
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't create account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[340px]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Boxes className="size-5 text-ink" strokeWidth={1.75} />
          <h1 className="text-md font-semibold text-ink">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 rounded-md border border-line bg-surface p-5">
          <Field label="Username">
            <Input required autoFocus value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jsmith" />
          </Field>
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <Field label="Password" hint="At least 6 characters">
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {error && <p className="text-xs text-danger">{error}</p>}

          <Button type="submit" variant="primary" loading={loading} className="mt-1 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-ink2">
          Already have an account?{" "}
          <Link to="/login" className="text-ink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
