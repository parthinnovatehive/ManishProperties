"use client";

import { useState } from "react";

export default function SuperAdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("Monthly");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Platform Analytics</h1>
          <p className="text-sm text-estate-text-sec">Advanced visualization of platform metrics, growth and engagement.</p>
        </div>
        <div>
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className="px-4 py-2 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent bg-white text-sm font-semibold outline-none"
          >
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
          </select>
        </div>
      </div>

      {/* Grid of Analytics Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Engagement Growth Chart */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-estate-navy">User Registration Funnel</h3>
              <p className="text-xs text-estate-text-sec">Cumulative user registration sign-ups ({timeframe})</p>
            </div>
            <span className="text-xs font-bold text-estate-success bg-estate-success-bg px-2.5 py-1 rounded-full">+24% MoM</span>
          </div>

          <div className="w-full h-64 relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <linearGradient id="analytics-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E5D3D" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1E5D3D" stopOpacity="0" />
              </linearGradient>

              {/* Grid lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" />

              <path
                d="M 10 180 C 100 160, 200 110, 300 90 C 400 70, 450 40, 490 20 L 490 200 L 10 200 Z"
                fill="url(#analytics-grad)"
              />
              <path
                d="M 10 180 C 100 160, 200 110, 300 90 C 400 70, 450 40, 490 20"
                fill="none"
                stroke="#1E5D3D"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="10" cy="180" r="5" fill="#1E5D3D" stroke="#fff" strokeWidth="2" />
              <circle cx="300" cy="90" r="5" fill="#1E5D3D" stroke="#fff" strokeWidth="2" />
              <circle cx="490" cy="20" r="5" fill="#1E5D3D" stroke="#fff" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[10px] font-bold text-estate-muted mt-2 px-1">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        {/* Listing Upload Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-estate-navy">Properties Listed vs Verified</h3>
              <p className="text-xs text-estate-text-sec">Comparison index between broker uploads and verifications</p>
            </div>
            <span className="text-xs font-bold text-estate-success bg-estate-success-bg px-2.5 py-1 rounded-full">92% Ratio</span>
          </div>

          <div className="w-full h-64 relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" />

              {/* Uploads line */}
              <path
                d="M 10 160 C 120 140, 220 90, 320 80 C 420 50, 460 30, 490 10"
                fill="none"
                stroke="#164A34"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Verified line */}
              <path
                d="M 10 175 C 120 155, 220 105, 320 95 C 420 62, 460 42, 490 22"
                fill="none"
                stroke="#66BB6A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-bold text-estate-muted mt-2 px-1">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
