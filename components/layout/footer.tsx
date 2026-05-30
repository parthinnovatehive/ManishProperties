"use client";

import Link from "next/link";
import { Building2, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const columns = [
  {
    title: "Quick Links",
    items: [
      ["Home", "/"],
      ["Buy Property", "/properties"],
      ["Rent Property", "/properties?status=For%20Rent"],
      ["New Projects", "/properties"],
      ["Commercial", "/properties?type=Commercial"],
      ["List Property", "/submit-property"],
    ],
  },
  {
    title: "Top Cities",
    items: [
      ["Mumbai", "/properties?city=Mumbai"],
      ["Bangalore", "/properties?city=Bangalore"],
      ["Delhi NCR", "/properties"],
      ["Pune", "/properties?city=Pune"],
      ["Hyderabad", "/properties?city=Hyderabad"],
      ["Chennai", "/properties"],
    ],
  },
  {
    title: "Company",
    items: [
      ["About Us", "/"],
      ["Careers", "/"],
      ["Press", "/"],
      ["Blog", "/"],
      ["Contact", "/"],
      ["Privacy Policy", "/"],
    ],
  },
];

const socials = [Facebook, Twitter, Instagram, Linkedin, Youtube];

export function Footer() {
  return (
    <footer className="bg-estate-navy pt-14 text-white">
      <div className="container-wide">
        <div className="grid gap-10 pb-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-white/15">
                <Building2 size={18} aria-hidden="true" />
              </span>
              <span className="font-serif text-xl font-bold">EstateElite</span>
            </div>
            <p className="mb-5 max-w-md text-sm leading-7 text-white/65">
              India&apos;s most trusted real estate platform. Find, compare, and transact properties with complete transparency and confidence.
            </p>
            <div className="flex gap-2.5">
              {socials.map((Icon, index) => (
                <span key={index} className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-white/10 text-white/80">
                  <Icon size={15} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em] text-white/50">{column.title}</div>
              <div className="grid gap-2.5">
                {column.items.map(([label, href]) => (
                  <Link key={label} href={href} className="text-sm text-white/70 transition hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 EstateElite Pvt. Ltd. All rights reserved. | RERA Registered</div>
          <div className="flex gap-5">
            {["Terms", "Privacy", "Cookies"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
