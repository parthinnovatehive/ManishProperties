"use client";

import { Building2, CheckCircle, Clock, Star, Loader2 } from "lucide-react";
import { Property } from "@/types";

interface MyPropertyStatsProps {
  properties: Property[];
  loading?: boolean;
}

export function MyPropertyStats({ properties, loading }: MyPropertyStatsProps) {
  const total = properties.length;
  const active = properties.filter(
    (p) => p.status === "APPROVED" || p.status === "ACTIVE"
  ).length;
  const pending = properties.filter(
    (p) => p.status === "PENDING"
  ).length;
  const featured = properties.filter((p) => p.featured).length;

  const stats = [
    {
      label: "Total Properties",
      value: total,
      icon: Building2,
      color: "text-estate-navy",
      bg: "bg-estate-blue-pale",
    },
    {
      label: "Active Listings",
      value: active,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Featured",
      value: featured,
      icon: Star,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-estate-border/80 p-5 shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gray-200">
                <div className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-estate-border/80 p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-estate-navy block leading-tight">
                {stat.value}
              </span>
              <span className="text-[11px] font-bold text-estate-muted uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
