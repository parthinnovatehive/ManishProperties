import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { GoogleOAuthWrapper } from "@/components/auth/GoogleOAuthWrapper";
import { ComparisonGlobalWrapper } from "@/components/property/ComparisonGlobalWrapper";

export const metadata: Metadata = {
  title: "Manish Properties",
  description: "Real Estate Platform",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <GoogleOAuthWrapper>
          <AuthProvider>
            <ComparisonGlobalWrapper>{children}</ComparisonGlobalWrapper>
          </AuthProvider>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}
