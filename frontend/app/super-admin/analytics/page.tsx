"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Activity,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

interface DashboardData {
  users: any[];
  agents: any[];
  properties: any[];
  appointments: any[];
  complaints: any[];
  admins: any[];
  messages: any[];
  leads: any[];
  subareas: any[];
  cities: any[];
  settings: any;
}

export default function SuperAdminAnalyticsPage() {
  const [data, setData] = useState<DashboardData>({
    users: [],
    agents: [],
    properties: [],
    appointments: [],
    complaints: [],
    admins: [],
    messages: [],
    leads: [],
    subareas: [],
    cities: [],
    settings: {},
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("Monthly");
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardData, citiesData, subareasData] = await Promise.all([
        estateApi.superAdmin.dashboard<any>(),
        estateApi.cities.list<any>(),
        estateApi.content.subareas.list<any>(),
      ]);

      setData({
        users: dashboardData.users || [],
        agents: dashboardData.agents || [],
        properties: dashboardData.properties || [],
        appointments: dashboardData.appointments || [],
        complaints: dashboardData.complaints || [],
        admins: dashboardData.admins || [],
        messages: dashboardData.messages || [],
        leads: dashboardData.leads || [],
        subareas: subareasData || [],
        cities: citiesData || [],
        settings: dashboardData.settings || {},
      });
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper function to group data by time period
  const groupByTimeframe = (items: any[], dateField: string) => {
    const grouped: Record<string, number> = {};

    items.forEach((item) => {
      if (!item[dateField]) return;
      const date = new Date(item[dateField]);
      if (isNaN(date.getTime())) return;

      let key = "";

      if (timeframe === "Weekly") {
        const week = Math.ceil(date.getDate() / 7);
        key = `W${week} ${date.toLocaleString('default', { month: 'short' })}`;
      } else if (timeframe === "Monthly") {
        key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else if (timeframe === "Quarterly") {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${quarter} ${date.getFullYear()}`;
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped);
  };

  // Helper to get percentage change
  const getPercentageChange = (data: [string, number][]) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1]?.[1] || 0;
    const previous = data[data.length - 2]?.[1] || 1;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Get max value for chart scaling
  const getMaxValue = (data: [string, number][]) => {
    return Math.max(...data.map(([, v]) => v), 1);
  };

  // 1. User Registration Growth
  const userGrowth = groupByTimeframe(data.users, "updatedAt");
  const maxUsers = getMaxValue(userGrowth);
  const userChange = getPercentageChange(userGrowth);

  // 2. Property Listing Trends
  const propertyTrends = groupByTimeframe(data.properties, "createdAt");
  const maxProperties = getMaxValue(propertyTrends);
  const propertyChange = getPercentageChange(propertyTrends);

  // 3. Appointment Trends
  const appointmentTrends = groupByTimeframe(data.appointments, "date");
  const maxAppointments = getMaxValue(appointmentTrends);
  const appointmentChange = getPercentageChange(appointmentTrends);

  // 4. Complaint Trends
  const complaintTrends = groupByTimeframe(data.complaints, "createdAt");
  const maxComplaints = getMaxValue(complaintTrends);

  // 5. User vs Agent Growth Comparison
  const userAgentData = () => {
    const usersByMonth = groupByTimeframe(data.users, "updatedAt");
    const agentsByMonth = groupByTimeframe(data.agents, "updatedAt");
    const allMonths = [...new Set([...usersByMonth.map(([m]) => m), ...agentsByMonth.map(([m]) => m)])];

    return allMonths.map(month => {
      const userCount = usersByMonth.find(([m]) => m === month)?.[1] || 0;
      const agentCount = agentsByMonth.find(([m]) => m === month)?.[1] || 0;
      return { month, users: userCount, agents: agentCount };
    });
  };
  const userAgentComparison = userAgentData();
  const maxUserAgent = Math.max(
    ...userAgentComparison.flatMap(d => [d.users, d.agents]),
    1
  );

  // 6. Appointments Over Time (filtered by selected timeframe)
  const getTimeframeStart = () => {
    const now = new Date();
    let start = new Date(now);
    if (timeframe === "Weekly") {
      start.setDate(now.getDate() - now.getDay());
    } else if (timeframe === "Monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === "Quarterly") {
      const quarter = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarter, 1);
    }
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const filteredAppointments = data.appointments.filter((a) => {
    if (!a.date) return false;
    return new Date(a.date) >= getTimeframeStart();
  });

  const appointmentTimeTrends = groupByTimeframe(filteredAppointments, "date");
  const maxAppointmentTimeTrend = getMaxValue(appointmentTimeTrends);

  // Render chart with tooltip - FIXED
const renderLineChart = (
  data: [string, number][],
  maxValue: number,
  color: string,
  label: string
) => {
  const hasData = data.length > 0;
  const chartWidth = 380;
  const chartHeight = 140;
  const padding = 10;
  const bottomPadding = 20;

  if (!hasData || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-estate-muted">
        No data available
      </div>
    );
  }

  const maxDataValue = Math.max(maxValue, 1);
  const points = data.map(([label, count], i) => ({
    x: padding + (i / (Math.max(data.length - 1, 1))) * chartWidth,
    y: chartHeight - (count / maxDataValue) * (chartHeight - padding),
    label,
    value: count,
  }));

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + bottomPadding + 10}`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 30, 60, 90, 120].map((y) => (
          <line
            key={y}
            x1={padding}
            y1={chartHeight - (y / 120) * (chartHeight - padding)}
            x2={chartWidth + padding}
            y2={chartHeight - (y / 120) * (chartHeight - padding)}
            stroke="#f3f4f6"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        {data.length > 1 && points.length > 1 && (
          <polygon
            points={[
              ...points.map(p => `${p.x},${p.y}`),
              `${points[points.length - 1]?.x || padding},${chartHeight}`,
              `${points[0]?.x || padding},${chartHeight}`,
            ].join(' ')}
            fill={`${color}15`}
          />
        )}

        {/* Line */}
        {data.length > 1 && points.length > 1 && (
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all"
              onMouseEnter={() => setHoveredPoint({ label: p.label, value: p.value })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}

        {/* X-axis labels */}
        {data.map(([label, _], i) => {
          const x = padding + (i / (Math.max(data.length - 1, 1))) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={chartHeight + 14}
              textAnchor="middle"
              fontSize="8"
              fill="#9CA3AF"
              className="font-medium"
            >
              {label}
            </text>
          );
        })}

        {/* Y-axis labels */}
        <text x={padding - 2} y={padding + 4} fontSize="8" fill="#9CA3AF" className="font-medium">
          {maxDataValue}
        </text>
        <text x={padding - 2} y={chartHeight + 4} fontSize="8" fill="#9CA3AF" className="font-medium">
          0
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg z-10">
          {hoveredPoint.label}: {hoveredPoint.value}
        </div>
      )}
    </div>
  );
};

  const renderBarChart = (
    data: [string, number][],
    maxValue: number,
    color: string,
    label: string
  ) => {
    return (
      <svg viewBox="0 0 400 150" className="w-full h-full">
        {/* Grid lines */}
        {[0, 30, 60, 90, 120].map((y) => (
          <line
            key={y}
            x1="10"
            y1={140 - y}
            x2="390"
            y2={140 - y}
            stroke="#f3f4f6"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Bars */}
        {data.map(([_, count], i) => {
          const x = (i / (Math.max(data.length - 1, 1))) * 380 + 10;
          const height = (count / maxValue) * 120;
          return (
            <g key={i}>
              <rect
                x={x - 10}
                y={140 - height}
                width="20"
                height={height}
                fill={color}
                rx="3"
                opacity="0.8"
                className="hover:opacity-100 transition-opacity"
              />
              {count > 0 && (
                <text
                  x={x}
                  y={135 - height}
                  textAnchor="middle"
                  fontSize="9"
                  fill={color}
                  fontWeight="bold"
                >
                  {count}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map(([label, _], i) => {
          const x = (i / (Math.max(data.length - 1, 1))) * 380 + 10;
          return (
            <text
              key={i}
              x={x}
              y="148"
              textAnchor="middle"
              fontSize="8"
              fill="#9CA3AF"
              className="font-medium"
            >
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <RefreshCw className="w-8 h-8 text-estate-navy animate-spin" />
        <div className="text-estate-navy text-lg font-medium">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-estate-navy to-estate-navy-mid rounded-2xl p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold font-serif">Platform Analytics</h1>
          <p className="text-white/70 text-sm mt-1">
            Time-based trends and growth metrics across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold outline-none hover:bg-white/20 transition cursor-pointer"
            >
              <option value="Weekly" className="text-gray-900">Weekly</option>
              <option value="Monthly" className="text-gray-900">Monthly</option>
              <option value="Quarterly" className="text-gray-900">Quarterly</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trend Charts - 4 Core Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Trend */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-estate-navy flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                User Registration Trend
              </h3>
              <p className="text-xs text-estate-muted">New users over {timeframe.toLowerCase()} periods</p>
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${userChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {userChange >= 0 ? '↑' : '↓'} {Math.abs(userChange)}%
            </div>
          </div>
          <div className="h-52">
            {userGrowth.length > 0 ? (
              renderLineChart(userGrowth, maxUsers, "#10B981", "Users")
            ) : (
              <div className="flex items-center justify-center h-full text-estate-muted">No data available</div>
            )}
          </div>
        </div>

        {/* Property Listing Trend */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-estate-navy flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Property Listing Trend
              </h3>
              <p className="text-xs text-estate-muted">Properties added over {timeframe.toLowerCase()} periods</p>
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${propertyChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {propertyChange >= 0 ? '↑' : '↓'} {Math.abs(propertyChange)}%
            </div>
          </div>
          <div className="h-52">
            {propertyTrends.length > 0 ? (
              renderBarChart(propertyTrends, maxProperties, "#3B82F6", "Properties")
            ) : (
              <div className="flex items-center justify-center h-full text-estate-muted">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row - Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trend */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-estate-navy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Appointment Trend
              </h3>
              <p className="text-xs text-estate-muted">Appointments scheduled over {timeframe.toLowerCase()} periods</p>
            </div>
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${appointmentChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {appointmentChange >= 0 ? '↑' : '↓'} {Math.abs(appointmentChange)}%
            </div>
          </div>
          <div className="h-52">
            {appointmentTrends.length > 0 ? (
              renderLineChart(appointmentTrends, maxAppointments, "#F59E0B", "Appointments")
            ) : (
              <div className="flex items-center justify-center h-full text-estate-muted">No data available</div>
            )}
          </div>
        </div>

        {/* Complaint Trend */}
        {complaintTrends.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-estate-navy flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-500" />
                  Complaint Trends
                </h3>
                <p className="text-xs text-estate-muted">Complaints received over {timeframe.toLowerCase()} periods</p>
              </div>
            </div>
            <div className="h-52">
              {complaintTrends.length > 0 ? (
                renderLineChart(complaintTrends, maxComplaints, "#EF4444", "Complaints")
              ) : (
                <div className="flex items-center justify-center h-full text-estate-muted">No data available</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Users vs Agents Comparison */}
      {userAgentComparison.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-estate-navy flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Users vs Agents Growth
              </h3>
              <p className="text-xs text-estate-muted">Comparative growth of users and agents over {timeframe.toLowerCase()} periods</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-600"></span>
                <span className="text-estate-text">Users</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-500 border-t-2 border-dashed border-amber-500"></span>
                <span className="text-estate-text">Agents</span>
              </span>
            </div>
          </div>
          <div className="h-52">
            <svg viewBox="0 0 500 150" className="w-full h-full">
              {/* Grid lines */}
              {[0, 30, 60, 90, 120].map((y) => (
                <line
                  key={y}
                  x1="10"
                  y1={140 - y}
                  x2="490"
                  y2={140 - y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Users line */}
              {userAgentComparison.length > 1 && (
                <>
                  <polyline
                    points={userAgentComparison.map((d, i) =>
                      `${(i / (userAgentComparison.length - 1)) * 480 + 10} ${140 - (d.users / maxUserAgent) * 120}`
                    ).join(' ')}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {userAgentComparison.map((d, i) => (
                    <circle
                      key={`user-${i}`}
                      cx={(i / (userAgentComparison.length - 1)) * 480 + 10}
                      cy={140 - (d.users / maxUserAgent) * 120}
                      r="4"
                      fill="#10B981"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </>
              )}

              {/* Agents line */}
              {userAgentComparison.length > 1 && (
                <>
                  <polyline
                    points={userAgentComparison.map((d, i) =>
                      `${(i / (userAgentComparison.length - 1)) * 480 + 10} ${140 - (d.agents / maxUserAgent) * 120}`
                    ).join(' ')}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {userAgentComparison.map((d, i) => (
                    <circle
                      key={`agent-${i}`}
                      cx={(i / (userAgentComparison.length - 1)) * 480 + 10}
                      cy={140 - (d.agents / maxUserAgent) * 120}
                      r="4"
                      fill="#F59E0B"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </>
              )}

              {/* X-axis labels */}
              {userAgentComparison.map((d, i) => {
                const x = (i / (Math.max(userAgentComparison.length - 1, 1))) * 480 + 10;
                return (
                  <text
                    key={i}
                    x={x}
                    y="148"
                    textAnchor="middle"
                    fontSize="8"
                    fill="#9CA3AF"
                    className="font-medium"
                  >
                    {d.month}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Appointments Over Time */}
      {/* <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-estate-navy flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Appointments Over Time
            </h3>
            <p className="text-xs text-estate-muted">Appointment trend for the {timeframe.toLowerCase()} period</p>
          </div>
          <div className="text-xs text-estate-muted">
            Total: {filteredAppointments.length} appointments this {timeframe.toLowerCase()}
          </div>
        </div>
        <div className="h-52">
          {appointmentTimeTrends.length > 0 ? (
            renderLineChart(appointmentTimeTrends, maxAppointmentTimeTrend, "#6366F1", "Appointments")
          ) : (
            <div className="flex items-center justify-center h-full text-estate-muted">No data available</div>
          )}
        </div>
      </div> */}
    </div>
  );
}