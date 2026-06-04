import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-estate-bg px-4">
      <section className="w-full max-w-lg rounded-2xl border border-estate-border bg-white p-8 text-center shadow-estate">
        <h1 className="font-serif text-3xl font-bold text-estate-navy">Unauthorized</h1>
        <p className="mt-3 text-sm leading-6 text-estate-text-sec">
          Your account does not have permission to access that dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-xl border border-estate-border px-4 py-2 text-sm font-bold text-estate-navy hover:bg-estate-bg">
            Go Home
          </Link>
          <Link href="/auth/login" className="rounded-xl bg-estate-navy px-4 py-2 text-sm font-bold text-white hover:bg-estate-navy-mid">
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
