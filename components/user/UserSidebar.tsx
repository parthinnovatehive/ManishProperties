"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/user/dashboard",
  },
  {
    title: "Appointments",
    href: "/user/appointments",
  },
  {
    title: "Saved Properties",
    href: "/user/saved-properties",
  },
  {
    title: "Complaints",
    href: "/user/complaints",
  },
  {
    title: "Profile",
    href: "/user/profile",
  },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-700">
          EstateElite
        </h1>
        <p className="text-sm text-gray-500">
          User Panel
        </p>
      </div>

      <nav className="px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === item.href
                ? "bg-green-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}