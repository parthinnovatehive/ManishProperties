"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Building2, Lock, Mail, ShieldCheck, User, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/lib/utils/toast";

type AuthMode = "login" | "register";

export function AuthPage() {
  const router = useRouter();
  const { login, register, googleLogin, error: authHookError, loading } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<"ADMIN" | "AGENT" | "CLIENT">("CLIENT");
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  // Google Modal State
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  // Dynamically load Google GIS Client library script
  useEffect(() => {
    if (typeof window === "undefined") return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      const credentialToken = response.credential;
      if (!credentialToken) {
        showErrorToast("Google login failed. No credential token returned.");
        return;
      }

      setLocalError(null);
      const success = await googleLogin(credentialToken, role);
      if (success) {
        showSuccessToast(`Logged in with Google as ${role}!`);
        if (role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        showErrorToast("Google login failed. Checking account role compatibility.");
      }
    },
    [googleLogin, role, router, showErrorToast, showSuccessToast]
  );

  const initGoogleSignIn = useCallback(() => {
    if (typeof window === "undefined" || !(window as any).google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1069562768565-mockclientid.apps.googleusercontent.com";

    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    const buttonDiv = document.getElementById("google-signin-button");
    if (buttonDiv) {
      (window as any).google.accounts.id.renderButton(buttonDiv, {
        theme: "outline",
        size: "large",
        width: 350,
        text: "continue_with",
      });
    }
  }, [handleCredentialResponse]);

  // Track and render/re-render Google Button on view/script status changes
  useEffect(() => {
    let timer: any;
    const checkGoogle = () => {
      if ((window as any).google) {
        initGoogleSignIn();
        clearInterval(timer);
      }
    };
    timer = setInterval(checkGoogle, 500);
    checkGoogle();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [initGoogleSignIn, mode]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setLocalError(null); // Clear error when user starts typing
  };

  const handleLogin = async () => {
    if (!form.email.trim()) {
      setLocalError("Please enter your username");
      return;
    }

    if (!form.password) {
      setLocalError("Please enter your password");
      return;
    }

    setLocalError(null);
    const success = await login(form.email, form.password, role);
    if (success) {
      showSuccessToast(`Logged in successfully as ${role}!`);
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  };



  const handleRegister = async () => {
    if (!form.name.trim()) {
      setLocalError("Please enter your full name");
      return;
    }

    if (!form.email.trim()) {
      setLocalError("Please enter your username / email");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }



    setLocalError(null);
    const success = await register(form.email, form.password, role, form.name, form.phone, "");
    if (success) {
      showSuccessToast(`Account created and logged in as ${role}!`);
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  };

  const handleGoogleChoice = async (email: string, name: string) => {
    setGoogleModalOpen(false);
    // Send simulated Google ID Token for developer testing fallback
    const success = await googleLogin(`mock-${email}`, role);
    if (success) {
      showSuccessToast(`Logged in with Google (Simulated) as ${role}!`);
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } else {
      showErrorToast("Google simulated login failed. Checking account role compatibility.");
    }
  };

  const displayError = localError || authHookError;

  return (
    <div className="grid min-h-[calc(100vh-68px)] bg-white lg:grid-cols-2">
      <div className="relative hidden min-h-[520px] flex-col justify-end overflow-hidden p-12 lg:flex">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="auth-overlay absolute inset-0" />
        <div className="relative z-10">
          <div className="mb-4 font-serif text-[2.2rem] font-bold leading-tight text-white">
            Your Dream Home
            <br />
            is One Click Away
          </div>
          <p className="mb-7 max-w-md text-[15px] leading-7 text-white/75">
            Join 2 million+ Indians who found their perfect property through EstateElite&apos;s trusted platform.
          </p>
          <div className="flex gap-5">
            {[
              ["2M+", "Happy Users"],
              ["85K+", "Properties"],
              ["100%", "Verified"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-[22px] font-extrabold text-estate-amber">{value}</div>
                <div className="text-xs text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="mb-9 flex items-center gap-2.5">
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-estate-navy text-white">
              <Building2 size={20} aria-hidden="true" />
            </span>
            <span className="font-serif text-xl font-bold text-estate-navy">EstateElite</span>
          </Link>

          <div className="mb-7 flex rounded-xl bg-estate-bg p-1">
            {[
              ["login", "Sign In"],
              ["register", "Create Account"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`flex-1 rounded-[9px] px-3 py-2.5 text-sm font-bold transition ${
                  mode === value ? "bg-white text-estate-navy shadow-estate" : "text-estate-muted"
                }`}
                onClick={() => {
                  setMode(value as AuthMode);

                  setLocalError(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <h1 className="mb-1.5 text-[22px] font-extrabold text-estate-navy">{mode === "login" ? "Welcome Back" : "Join EstateElite"}</h1>
          <p className="mb-6 text-sm text-estate-text-sec">
            {mode === "login" ? "Sign in to access your dashboard and saved properties" : "Create your free account and start your property journey"}
          </p>

          {/* Role Selector Pill Tabs */}
          <div className="mb-6">
            <span className="mb-2 block text-[13px] font-semibold text-estate-text">
              Select Role <span className="text-estate-red">*</span>
            </span>
            <div className="flex rounded-xl bg-estate-bg p-1">
              {[
                ["CLIENT", "User"],
                ["AGENT", "Agent"],
                ["ADMIN", "Admin"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`flex-1 rounded-[9px] py-2 text-xs font-bold transition ${
                    role === val ? "bg-estate-navy text-white shadow-estate" : "text-estate-muted hover:text-estate-navy"
                  }`}
                  onClick={() => {
                    setRole(val as any);
                    setLocalError(null);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-2.5">
            <div className="flex flex-col gap-2 rounded-xl border border-estate-border bg-white p-3 shadow-sm">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-estate-muted text-center mb-1">
                Official Google Sign-In
              </span>
              <div className="flex justify-center w-full min-h-[44px]">
                <div id="google-signin-button" className="w-full flex justify-center"></div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="text-xs font-semibold text-estate-blue hover:underline"
              >
                Simulate Google Login (Developer Fallback)
              </button>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-estate-border" />
            <span className="text-[13px] text-estate-muted">or continue with email</span>
            <div className="h-px flex-1 bg-estate-border" />
          </div>

          {displayError && (
            <div className="mb-5 rounded-[9px] bg-red-50 p-3.5 text-sm font-medium text-red-700 border border-red-200">
              {displayError}
            </div>
          )}

          {mode === "register" && (
            <Input label="Full Name" placeholder="Arjun Sharma" value={form.name} onChange={(event) => update("name", event.target.value)} icon={<User size={15} />} required />
          )}
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            icon={<Mail size={15} />}
            required
            disabled={loading}
          />

          {mode === "register" && (
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                Phone
              </span>
              <span className="grid grid-cols-[80px_1fr] gap-2">
                <span className="rounded-lg border-[1.5px] border-estate-border px-2.5 py-2.5 text-center text-sm font-semibold text-estate-text-sec">+91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  className="focus-field rounded-lg border-[1.5px] border-estate-border px-3.5 py-2.5 text-sm text-estate-text"
                  disabled={loading}
                />
              </span>
            </label>
          )}

          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            icon={<Lock size={15} />}
            required
            disabled={loading}
          />

          {mode === "login" && (
            <div className="-mt-2 mb-5 text-right">
              <button onClick={() => showSuccessToast("Reset link sent if account exists.")} className="text-[13px] font-semibold text-estate-blue">Forgot password?</button>
            </div>
          )}





          <Button
            variant="navy"
            fullWidth
            className="mb-4 rounded-[10px] py-3.5 text-[15px]"
            onClick={() => {
              if (mode === "login") {
                handleLogin();
              } else {
                handleRegister();
              }
            }}
            disabled={loading}
          >
            {loading 
              ? "Processing..." 
              : mode === "login" 
                ? "Sign In to EstateElite" 
                : "Create Free Account"
            }
          </Button>

          {mode === "register" && (
            <p className="text-center text-xs leading-5 text-estate-muted">
              By creating an account, you agree to our <button className="text-estate-blue">Terms of Service</button> and{" "}
              <button className="text-estate-blue">Privacy Policy</button>
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-5 border-t border-estate-border pt-5">
            {[
              { icon: ShieldCheck, label: "Bank-grade security" },
              { icon: Lock, label: "100% verified" },
              { icon: Award, label: "Trusted platform" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-estate-muted">
                <Icon size={14} aria-hidden="true" className="text-estate-success" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Choose Account popup modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-estate-navy/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl border border-estate-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-estate-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-estate-navy flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#ea4335"
                    d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.68 14.92 1 12 1 7.35 1 3.39 3.67 1.41 7.56l3.77 2.93c.89-2.67 3.39-4.45 6.82-4.45z"
                  />
                  <path
                    fill="#4285f4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.98 3.75-4.89 3.75-8.63z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.18 10.49c-.23-.69-.36-1.43-.36-2.19s.13-1.5.36-2.19L1.41 3.18C.51 4.98 0 7.02 0 9.2s.51 4.22 1.41 6.02l3.77-2.93z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 18.25c3.24 0 5.97-1.08 7.96-2.93l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.43 0-5.93-1.78-6.82-4.45L1.41 12.05c1.98 3.89 5.94 6.2 10.59 6.2z"
                  />
                </svg>
                Sign in with Google
              </h2>
              <button
                onClick={() => setGoogleModalOpen(false)}
                className="rounded-lg p-1 hover:bg-estate-bg text-estate-muted hover:text-estate-navy transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-estate-text-sec mb-4">
              Choose an account to continue to <span className="font-semibold text-estate-navy">EstateElite</span>.
            </p>

            <div className="flex flex-col gap-2.5 mb-5 max-h-[220px] overflow-y-auto pr-1">
              {[
                { name: "Deepak Kumar", email: "deepak@gmail.com", avatar: "DK" },
                { name: "Rahul Sharma", email: "rahul@example.com", avatar: "RS" },
                { name: "Priya Mehta", email: "priya@example.com", avatar: "PM" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleChoice(acc.email, acc.name)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-estate-border hover:border-estate-blue hover:bg-estate-bg/50 transition text-left active:scale-[0.98]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-estate-navy text-white text-xs font-bold shrink-0">
                    {acc.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-estate-navy truncate">{acc.name}</div>
                    <div className="text-[11px] text-estate-muted truncate">{acc.email}</div>
                  </div>
                  <ChevronRight size={14} className="text-estate-muted" />
                </button>
              ))}
            </div>

            <div className="border-t border-estate-border pt-4">
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-estate-muted mb-1">OR ENTER A CUSTOM GOOGLE EMAIL</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={googleEmail}
                  onChange={(e) => {
                    setGoogleEmail(e.target.value);
                    setGoogleName(e.target.value.split("@")[0]);
                  }}
                  className="w-full rounded-lg border border-estate-border px-3 py-2 text-xs focus:outline-none focus:border-estate-blue"
                />
              </div>
              <Button
                variant="navy"
                size="sm"
                fullWidth
                disabled={!googleEmail.includes("@")}
                onClick={() => handleGoogleChoice(googleEmail, googleName || googleEmail.split("@")[0])}
              >
                Continue with custom account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
