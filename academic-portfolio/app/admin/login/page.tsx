import { loginAction } from "../actions";
import { ShieldCheck } from "lucide-react";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-md py-10">
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Admin sign in</h1>
            <p className="text-xs" style={{ color: "var(--text-soft)" }}>
              Single-user portfolio. Password set via ADMIN_PASSWORD env var.
            </p>
          </div>
        </div>

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" className="input" autoFocus />
          </div>
          {searchParams.error && (
            <p className="text-sm" style={{ color: "#dc2626" }}>
              Incorrect password.
            </p>
          )}
          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
