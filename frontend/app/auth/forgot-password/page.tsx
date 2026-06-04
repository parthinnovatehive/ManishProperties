import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-estate-bg px-4">
      <section className="w-full max-w-md rounded-2xl border border-estate-border bg-white p-8 shadow-estate">
        <h1 className="font-serif text-2xl font-bold text-estate-navy">Password Reset</h1>
        <p className="mt-3 text-sm leading-6 text-estate-text-sec">
          Password reset delivery is not configured yet. Contact an administrator to reset your account credentials.
        </p>
        <Link href="/auth/login" className="mt-6 inline-flex text-sm font-bold text-estate-navy hover:underline">
          Back to Sign In
        </Link>
      </section>
    </main>
  );
}
