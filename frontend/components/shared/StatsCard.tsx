// components/shared/StatsCard.tsx
"use client";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  bgColor?: string; // Tailwind bg class e.g., "bg-blue-500"
}

export default function StatsCard({ title, value, icon, bgColor = "bg-estate-navy" }: StatsCardProps) {
  return (
    <div className={`p-4 rounded-xl shadow-md text-white ${bgColor} hover:scale-105 transition transform`}> 
      <div className="flex items-center">
        <div className="mr-3 text-3xl">{icon}</div>
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
