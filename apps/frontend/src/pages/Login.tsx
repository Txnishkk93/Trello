import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import { signin } from "../api/auth";
import { ApiRequestError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await signin(email, password);
      login(token);
      navigate("/orgs");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[340px]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Boxes className="size-5 text-ink" strokeWidth={1.75} />
          <h1 className="text-md font-semibold text-ink">Sign in to Flow</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 rounded-md border border-line bg-surface p-5">
          <Field label="Email">
            <Input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <Field label="Password">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {error && <p className="text-xs text-danger">{error}</p>}

          <Button type="submit" variant="primary" loading={loading} className="mt-1 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-ink2">
          Don't have an account?{" "}
          <Link to="/signup" className="text-ink hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
