"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SubmitPropertyPage } from "@/components/forms/submit-property-page";
import { useAuth } from "@/lib/auth";

export default function SubmitPropertyRoute() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !role) {
      router.replace("/auth/login");
    }
  }, [loading, role, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return <SubmitPropertyPage />;
}