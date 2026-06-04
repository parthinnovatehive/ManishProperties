// app/super-admin/login/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const superAdminCred = {
  email: "superadmin@estateelite.com",
  password: "SuperAdmin@123",
  role: "super-admin" as const,
};

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    const { email, role } = superAdminCred;
    login(email, role);
    router.replace("/super-admin/dashboard");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-estate-navy to-estate-blue bg-opacity-20 p-4">
      <div className="w-full max-w-lg space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 text-estate-navy">Super Admin Login</h1>
        <p className="mb-4 text-gray-600">superadmin@estateelite.com</p>
        <p className="mb-6 text-gray-600">SuperAdmin@123</p>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-estate-navy text-white rounded hover:bg-estate-navy/80 transition"
        >
          Login as Super Admin
        </button>
      </div>
    </section>
  );
}
