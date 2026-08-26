"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
  if (!googleClientId) {
    console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.");
    return (
      <GoogleOAuthProvider clientId="dummy_client_id_to_prevent_crash">
        {children}
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
