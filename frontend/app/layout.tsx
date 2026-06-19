import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ComparisonGlobalWrapper } from "@/components/property/ComparisonGlobalWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <ComparisonGlobalWrapper>{children}</ComparisonGlobalWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
