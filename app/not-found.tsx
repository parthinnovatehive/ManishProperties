import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-serif text-4xl text-estate-navy">Page not found</h1>
      <p className="mt-3 max-w-md text-estate-text-sec">The property page you are looking for is not available in this prototype.</p>
      <Button href="/" variant="navy" className="mt-6">
        Back Home
      </Button>
      <Link href="/properties" className="mt-3 text-sm font-semibold text-estate-blue">
        Browse properties
      </Link>
    </div>
  );
}
