"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { estateApi } from "@/lib/api";

interface City {
  id: string;
  name: string;
  count?: number;
}

const quickLinks = [
  ["Buy Property", "/properties?status=For%20Sale"],
  ["Rent Property", "/properties?status=For%20Rent"],
  ["New Projects", "/properties"],
  ["Commercial", "/properties?type=Commercial"],
  ["List Property", "/submit-property"],
];

const socials: { icon: typeof Facebook; href: string; label: string }[] = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];

export function Footer() {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    estateApi.content.cities<City>().then(setCities).catch(() => {});
  }, []);

  return (
    <footer className="bg-estate-navy pt-14 text-white">
      <div className="container-wide">
        <div className="grid gap-10 pb-12 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <Image 
                src="/logo.png" 
                alt="Manish Properties Logo" 
                width={240} 
                height={55}
                className="rounded-lg object-cover"
              />
            </div>
            <p className="mb-5 max-w-md text-sm leading-7 text-white/65">
              India&apos;s most trusted real estate platform. Find, compare, and transact properties with complete transparency and confidence.
            </p>
            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20"
                >
                  <Icon size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em] text-white/50">Quick Links</div>
            <div className="grid gap-2.5">
              {quickLinks.map(([label, href]) => (
                <Link key={label as string} href={href as string} className="text-sm text-white/70 transition hover:text-white">
                  {label as string}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em] text-white/50">Top Cities</div>
            <div className="grid gap-2.5">
              {cities.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 w-24 bg-white/10 animate-pulse rounded" />
                  ))
                : cities.map((city) => (
                    <Link
                      key={city.id}
                      href={`/properties?city=${encodeURIComponent(city.name)}`}
                      className="text-sm text-white/70 transition hover:text-white"
                    >
                      {city.name}
                    </Link>
                  ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 Manish Properties Pvt. Ltd. All rights reserved. | RERA Registered</div>
        </div>
      </div>
    </footer>
  );
}
