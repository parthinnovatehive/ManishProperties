"use client";

import { AuthPage } from "@/components/forms/auth-page";
import { Navbar } from "@/components/layout/navbar";
import { SavedPropertiesProvider } from "@/lib/saved-properties-context";

export default function RegisterPage() {
  return (
    <SavedPropertiesProvider>
      <Navbar />
      <AuthPage mode="register" />
    </SavedPropertiesProvider>
  );
}
