"use client";

import { properties } from "@/data/properties";
import { agents } from "@/data/agents";
import { users } from "@/data/users";

export default function AdminStatsPage() {
  const totalProperties = properties.length;
  const totalAgents = agents.length;
  const totalUsers = users.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-estate-navy font-serif">Platform Statistics</h1>
        <p className="text-sm text-estate-text-sec">Interactive visual summary of EstateElite platform performance and growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <h3 className="text-xs font-bold text-estate-muted uppercase tracking-wider">Broker Growth Rate</h3>
          <div className="text-2xl font-bold text-estate-navy mt-2">+14.2% MoM</div>
          <div className="w-full h-24 mt-4">
            <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
              <path
                d="M 0 50 C 40 45, 80 30, 120 20 C 160 10, 180 5, 200 2"
                fill="none"
                stroke="#1E5D3D"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <h3 className="text-xs font-bold text-estate-muted uppercase tracking-wider">User Acquisition</h3>
          <div className="text-2xl font-bold text-estate-navy mt-2">+28.5% YoY</div>
          <div className="w-full h-24 mt-4">
            <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
              <path
                d="M 0 55 C 30 40, 60 48, 100 25 C 140 10, 170 12, 200 5"
                fill="none"
                stroke="#66BB6A"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <h3 className="text-xs font-bold text-estate-muted uppercase tracking-wider">Listing Uploads</h3>
          <div className="text-2xl font-bold text-estate-navy mt-2">124 Listings (Q2)</div>
          <div className="w-full h-24 mt-4">
            <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
              <path
                d="M 0 45 C 50 35, 100 50, 150 20 C 180 5, 190 8, 200 3"
                fill="none"
                stroke="#3E7B45"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
