import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { GoogleOAuthWrapper } from "@/components/auth/GoogleOAuthWrapper";
import { ComparisonGlobalWrapper } from "@/components/property/ComparisonGlobalWrapper";

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
