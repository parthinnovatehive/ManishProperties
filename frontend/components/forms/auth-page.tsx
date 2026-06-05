"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getAdminData } from "@/lib/utils/token";

type AuthMode = "login" | "register";
type PublicRole = "USER" | "AGENT" | "ADMIN";

const redirectByRole: Record<string, string> = {
  USER: "/user/dashboard",
  AGENT: "/agent/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
};

function routeForStoredRole() {
  const account = getAdminData();
  const role = String(account?.role || "USER").toUpperCase().replace("-", "_");
  return redirectByRole[role] || "/user/dashboard";
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, register, error: authError, loading, clearError } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState<PublicRole>("USER");
  const [remember, setRemember] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLogin = mode === "login";
  const title = isLogin ? "Sign in to EstateElite" : "Create your EstateElite account";
  const subtitle = isLogin
    ? "Use your registered email and password to continue."
    : "Register as a buyer/owner, agent, or admin.";

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setLocalError(null);
    clearError();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!form.email.trim() || !form.password) {
      setLocalError("Email and password are required.");
      return;
    }

    if (!isLogin) {
      if (!form.name.trim() || !form.phone.trim()) {
        setLocalError("Full name and phone number are required.");
        return;
      }
      if (form.password.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
    }

    const ok = isLogin
      ? await login(form.email.trim(), form.password, remember)
      : await register(form.email.trim(), form.password, role, form.name.trim(), form.phone.trim());

    if (ok) {
      router.replace(routeForStoredRole());
    }
  };

  const displayError = localError || authError;

  return (
    <div className="grid min-h-[calc(100vh-68px)] bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden min-h-[580px] overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="auth-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Building2 size={14} />
            EstateElite
          </div>
          <h1 className="max-w-xl font-serif text-5xl font-bold leading-tight">
            One account for every real estate workflow.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/75">
            Access saved homes, agent pipelines, admin approvals, and platform controls through the Flask-backed EstateElite API.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[430px]">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-estate-navy text-white">
              <Building2 size={20} aria-hidden="true" />
            </span>
            <span className="font-serif text-xl font-bold text-estate-navy">EstateElite</span>
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-estate-navy">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-estate-text-sec">{subtitle}</p>
          </div>

          {displayError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {displayError}
            </div>
          )}

          <form onSubmit={submit}>
            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  icon={<User size={15} />}
                  required
                  disabled={loading}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  icon={<Phone size={15} />}
                  required
                  disabled={loading}
                />

                <div className="mb-4">
                  <span className="mb-2 block text-[13px] font-semibold text-estate-text">Role</span>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-estate-bg p-1">
                    {[
                      ["USER", "User"],
                      ["AGENT", "Agent"],
                      ["ADMIN", "Admin"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value as PublicRole)}
                        className={`rounded-[9px] py-2.5 text-sm font-bold transition ${
                          role === value ? "bg-estate-navy text-white shadow-estate" : "text-estate-muted hover:text-estate-navy"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              icon={<Mail size={15} />}
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              icon={<Lock size={15} />}
              required
              disabled={loading}
            />

            {!isLogin && (
              <Input
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => update("confirmPassword", event.target.value)}
                icon={<Lock size={15} />}
                required
                disabled={loading}
              />
            )}

            {isLogin && (
              <div className="-mt-1 mb-5 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-estate-text-sec">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-estate-border text-estate-navy"
                    disabled={loading}
                  />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-semibold text-estate-blue hover:underline">
                  Forgot Password?
                </Link>
              </div>
            )}

            <Button type="submit" variant="navy" fullWidth className="py-3.5 text-[15px]" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-estate-text-sec">
            {isLogin ? "New to EstateElite?" : "Already have an account?"}{" "}
            <Link href={isLogin ? "/auth/register" : "/auth/login"} className="font-bold text-estate-navy hover:underline">
              {isLogin ? "Register" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
