// app/auth/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const credentials = {
  user: { email: "user@estateelite.com", password: "User@123", role: "user" as const },
  agent: { email: "agent@estateelite.com", password: "Agent@123", role: "agent" as const },
  admin: { email: "admin@estateelite.com", password: "Admin@123", role: "admin" as const },
};

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (type: keyof typeof credentials) => {
    const { email, role } = credentials[type];
    login(email, role);
    // redirect based on role
    const redirectMap: Record<string, string> = {
      user: "/user/dashboard",
      agent: "/agent/dashboard",
      admin: "/admin/dashboard",
    };
    router.replace(redirectMap[role]);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-estate-navy to-estate-blue bg-opacity-20 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold text-center text-estate-navy mb-6">EstateElite Login</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Card */}
          <div className="p-6 bg-white rounded-lg shadow-lg text-center hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold mb-4">User</h2>
            <p className="mb-2 text-gray-600">user@estateelite.com</p>
            <p className="mb-4 text-gray-600">User@123</p>
            <button
              onClick={() => handleLogin("user")}
              className="px-4 py-2 bg-estate-navy text-white rounded hover:bg-estate-navy/80 transition"
            >
              Login as User
            </button>
          </div>
          {/* Agent Card */}
          <div className="p-6 bg-white rounded-lg shadow-lg text-center hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold mb-4">Agent</h2>
            <p className="mb-2 text-gray-600">agent@estateelite.com</p>
            <p className="mb-4 text-gray-600">Agent@123</p>
            <button
              onClick={() => handleLogin("agent")}
              className="px-4 py-2 bg-estate-navy text-white rounded hover:bg-estate-navy/80 transition"
            >
              Login as Agent
            </button>
          </div>
          {/* Admin Card */}
          <div className="p-6 bg-white rounded-lg shadow-lg text-center hover:shadow-xl transition">
            <h2 className="text-2xl font-semibold mb-4">Admin</h2>
            <p className="mb-2 text-gray-600">admin@estateelite.com</p>
            <p className="mb-4 text-gray-600">Admin@123</p>
            <button
              onClick={() => handleLogin("admin")}
              className="px-4 py-2 bg-estate-navy text-white rounded hover:bg-estate-navy/80 transition"
            >
              Login as Admin
            </button>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-500">Super Admin Access</p>
          <a href="/super-admin/login" className="text-estate-navy font-medium hover:underline">
            Go to Super Admin Login
          </a>
        </div>
      </div>
    </section>
  );
}
