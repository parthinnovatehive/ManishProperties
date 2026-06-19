"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  MapPin,
  Home,
  MessageSquare,
  Award,
  BarChart3,
  Activity,
  ChevronDown,
  RefreshCw,
  Crown,
  Target,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Trophy,
  Star,
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

interface CityStats {
  id: string;
  name: string;
  properties: number;
  approvedProperties: number;
  pendingProperties: number;
  appointments: number;
  confirmedAppointments: number;
  users: number;
  agents: number;
  complaints: number;
  resolvedComplaints: number;
  revenue: number;
  growth: number;
}

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminStatsPage() {
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
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cityStats, setCityStats] = useState<CityStats | null>(null);
  const [otherCitiesStats, setOtherCitiesStats] = useState<CityStats[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number } | null>(null);
  const [adminCity, setAdminCity] = useState<any>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  // Get admin data from localStorage (same as properties page)
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminData");
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin);
      setAdminData(admin);
      loadData(admin);
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async (admin?: AdminData) => {
  setLoading(true);
  try {
    const currentAdmin = admin || adminData;
    if (!currentAdmin) {
      setLoading(false);
      return;
    }

    // Fetch cities, subareas, properties, and appointments
    const [citiesData, subareasData, adminProperties, allAppointments] = await Promise.all([
      estateApi.cities.list<any>(),
      estateApi.content.subareas.list<any>(),
      estateApi.adminProperties.list(),
      estateApi.appointments.list<any>(),
    ]);

    // Find the current admin's city by matching admin_id
    const assignedCity = citiesData.find((city: any) => city.admin_id === currentAdmin.id);
    setAdminCity(assignedCity || null);

    if (assignedCity) {
      setSelectedCity(assignedCity.id);
    }

    const allProperties = adminProperties;

    setData({
      users: [],
      agents: [],
      properties: allProperties || [],
      appointments: allAppointments || [],
      complaints: [],
      admins: [],
      messages: [],
      leads: [],
      subareas: subareasData || [],
      cities: citiesData || [],
      settings: {},
    });

    // Calculate stats for ALL active cities
    const allCityStats = citiesData
      .filter((city: any) => city.status === "active")
      .map((city: any) => {
        const cityProps = allProperties.filter((p: any) => p.city_id === city.id);
        const cityAppointments = allAppointments.filter((a: any) => {
          const prop = allProperties.find((p: any) => p.id === a.propertyId);
          return prop?.city_id === city.id;
        });
        return {
          id: city.id,
          name: city.name,
          properties: cityProps.length,
          approvedProperties: cityProps.filter((p: any) => p.status === "APPROVED" || p.moderationStatus === "APPROVED").length,
          pendingProperties: cityProps.filter((p: any) => p.status === "PENDING" || p.moderationStatus === "PENDING").length,
          appointments: cityAppointments.length,
          confirmedAppointments: cityAppointments.filter((a: any) => a.status === "Confirmed").length,
          users: 0,
          agents: new Set(cityProps.map((p: any) => p.lister_id)).size,
          complaints: 0,
          resolvedComplaints: 0,
          revenue: cityProps
            .filter((p: any) => p.status === "APPROVED" || p.moderationStatus === "APPROVED")
            .reduce((sum: number, p: any) => sum + (p.priceNum || 0), 0),
          growth: 0,
        };
      })
      .filter((city: CityStats) => city.properties > 0 || city.id === assignedCity?.id);

    // Sort by revenue (descending) for ranking
    const sortedByRevenue = [...allCityStats].sort((a, b) => b.revenue - a.revenue);

    // Find the current city's stats
    const currentCityStats = allCityStats.find((c: CityStats) => c.id === assignedCity?.id);
    if (currentCityStats) {
      setCityStats(currentCityStats);
    }

    // Get other cities (excluding current)
    const otherCities = allCityStats
      .filter((c: CityStats) => c.id !== assignedCity?.id)
      .sort((a, b) => b.revenue - a.revenue);

    setOtherCitiesStats(otherCities);

  } catch (err) {
    console.error("Failed to load analytics data:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (selectedCity && data.properties.length > 0) {
      calculateCityStats();
    }
  }, [selectedCity, data]);

  const calculateCityStats = () => {
    // This is now handled in loadData, but keep for compatibility
  };

  // Helper function to group data by time period
  const groupByTimeframe = (items: any[], dateField: string, cityId?: string) => {
    // For appointments, we need to filter by city using propertyId
    const filtered = cityId
      ? items.filter(item => {
        // Check if it's an appointment (has propertyId) or property
        if (item.propertyId) {
          const prop = data.properties.find((p: any) => p.id === item.propertyId);
          return prop?.city_id === cityId;
        }
        // For properties, check city_id directly
        return item.city_id === cityId;
      })
      : items;

    const grouped: Record<string, number> = {};

    filtered.forEach((item) => {
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

  const getMaxValue = (data: [string, number][]) => {
    return Math.max(...data.map(([, v]) => v), 1);
  };

  // City-specific trends
  const cityPropertyTrends = groupByTimeframe(
    data.properties.filter((p: any) => p.city_id === selectedCity),
    "createdAt"
  );
  const maxCityProperties = getMaxValue(cityPropertyTrends);

  // Fix: Use all appointments data, not empty array
  const cityAppointmentTrends = groupByTimeframe(
    data.appointments,
    "date",
    selectedCity
  );
  const maxCityAppointments = getMaxValue(cityAppointmentTrends);

  // Get top performing cities for comparison
  const topCities = otherCitiesStats.slice(0, 5);

  // Calculate position of current city in rankings (based on revenue)
const cityRank = otherCitiesStats.length > 0
  ? otherCitiesStats.filter(c => c.revenue > (cityStats?.revenue || 0)).length + 1
  : 1;

  // Render line chart
  const renderLineChart = (
    data: [string, number][],
    maxValue: number,
    color: string,
    label: string
  ) => {
    const points = data.map(([label, count], i) => ({
      x: (i / (Math.max(data.length - 1, 1))) * 380 + 10,
      y: 140 - (count / maxValue) * 120,
      label,
      value: count,
    }));

    return (
      <div className="relative">
        <svg viewBox="0 0 400 180" className="w-full h-full">
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

          {data.length > 1 && (
            <polygon
              points={[
                ...points.map(p => `${p.x},${p.y}`),
                `${points[points.length - 1]?.x || 10},140`,
                `${points[0]?.x || 10},140`,
              ].join(' ')}
              fill={`${color}15`}
            />
          )}

          {data.length > 1 && (
            <polyline
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

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

          {/* X-axis labels - with proper spacing */}
          {data.map(([label, _], i) => {
            const x = (i / (Math.max(data.length - 1, 1))) * 380 + 10;
            // Split long labels to show month and year on separate lines
            const labelParts = label.split(' ');
            const month = labelParts[0] || '';
            const year = labelParts[1] || '';

            return (
              <g key={i}>
                <text
                  x={x}
                  y="155"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6B7280"
                  className="font-medium"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {month}
                </text>
                {year && (
                  <text
                    x={x}
                    y="167"
                    textAnchor="middle"
                    fontSize="7"
                    fill="#9CA3AF"
                    className="font-medium"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  >
                    {year}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg z-10">
            {hoveredPoint.label}: {hoveredPoint.value}
          </div>
        )}
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <RefreshCw className="w-8 h-8 text-estate-navy animate-spin" />
        <div className="text-estate-navy text-lg font-medium">Loading analytics...</div>
      </div>
    );
  }

  // Check if admin has an assigned city
  if (!adminCity) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="p-4 bg-amber-50 rounded-full">
          <MapPin className="w-12 h-12 text-amber-500" />
        </div>
        <div className="text-estate-navy text-lg font-medium">No City Assigned</div>
        <div className="text-estate-muted text-sm text-center max-w-md">
          You haven't been assigned to any city yet. Please contact your administrator
          to assign you to a city. Your admin ID: <span className="font-mono text-xs">{adminData?.id || 'Not found'}</span>
        </div>
        <button
          onClick={() => loadData()}
          className="mt-4 px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy/90 transition"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  if (!cityStats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <RefreshCw className="w-8 h-8 text-estate-navy animate-spin" />
        <div className="text-estate-navy text-lg font-medium">Calculating stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-estate-navy to-estate-navy-mid rounded-2xl p-6 text-white">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif">City Analytics</h1>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {adminCity?.name || cityStats.name}
            </span>
          </div>
          <p className="text-white/70 text-sm mt-1">
            Performance metrics and insights for your assigned city
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
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* City Rank & Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-2xl border border-amber-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                <Trophy className="w-4 h-4" />
                Your City Ranking
              </div>
              <div className="mt-2">
                <span className="text-4xl font-bold text-estate-navy">#{cityRank}</span>
                <span className="text-sm text-estate-muted ml-2">
                  out of {otherCitiesStats.length + 1} cities
                </span>
              </div>
              <p className="text-sm text-estate-text mt-1">
                {cityRank === 1
                  ? "🏆 You're leading the pack! Outstanding performance!"
                  : cityRank <= 3
                    ? "⭐ Great performance! You're in the top 3!"
                    : cityRank <= 5
                      ? "📈 Good position! Keep pushing for the top 5!"
                      : "💪 Room for growth! Focus on increasing listings."}
              </p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-full">
              {cityRank === 1 ? (
                <Crown className="w-8 h-8 text-amber-500" />
              ) : (
                <Target className="w-8 h-8 text-amber-500" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-2xl border border-emerald-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                <Zap className="w-4 h-4" />
                Growth Opportunity
              </div>
              <div className="mt-2">
                <span className="text-4xl font-bold text-estate-navy">
                  {topCities.length > 0 && topCities[0] ? (
                    <span>+{((topCities[0].properties - cityStats.properties) / (topCities[0].properties || 1) * 100).toFixed(0)}%</span>
                  ) : (
                    <span>0%</span>
                  )}
                </span>
                <span className="text-sm text-estate-muted ml-2">to catch up</span>
              </div>
              <p className="text-sm text-estate-text mt-1">
                {topCities.length > 0 && topCities[0] ? (
                  <>Need <strong>{topCities[0].properties - cityStats.properties}</strong> more properties to match <strong>{topCities[0].name}</strong></>
                ) : (
                  "You're the only active city! 🎉"
                )}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <ArrowUpRight className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - City Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-2 text-estate-muted text-xs">Properties</div>
          <div className="text-2xl font-bold text-estate-navy">{cityStats.properties}</div>
          <div className="text-xs text-emerald-600">{cityStats.approvedProperties} approved</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-2 text-estate-muted text-xs">Appointments</div>
          <div className="text-2xl font-bold text-estate-navy">{cityStats.appointments}</div>
          <div className="text-xs text-emerald-600">{cityStats.confirmedAppointments} confirmed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-2 text-estate-muted text-xs">Agents</div>
          <div className="text-2xl font-bold text-estate-navy">{cityStats.agents}</div>
          <div className="text-xs text-emerald-600">active in city</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-2 text-estate-muted text-xs">Complaints</div>
          <div className="text-2xl font-bold text-rose-600">{cityStats.complaints}</div>
          <div className="text-xs text-emerald-600">{cityStats.resolvedComplaints} resolved</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-2 text-estate-muted text-xs">Worth</div>
          <div className="text-2xl font-bold text-emerald-600">
            ₹{(cityStats.revenue / 10000000).toFixed(1)}Cr
          </div>
          <div className="text-xs text-estate-muted">property listed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-2 text-estate-muted text-xs">Growth</div>
          <div className={`text-2xl font-bold ${cityStats.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {cityStats.growth >= 0 ? '+' : ''}{cityStats.growth}%
          </div>
          <div className="text-xs text-estate-muted">vs last period</div>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Trend */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-estate-navy flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Property Listings Trend
              </h3>
              <p className="text-xs text-estate-muted">Properties added over {timeframe.toLowerCase()} periods</p>
            </div>
          </div>
          <div className="h-64">
            {cityPropertyTrends.length > 0 ? (
              renderLineChart(cityPropertyTrends, maxCityProperties, "#3B82F6", "Properties")
            ) : (
              <div className="flex items-center justify-center h-full text-estate-muted">No data available</div>
            )}
          </div>
        </div>

        {/* Appointment Trend */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-estate-navy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Appointment Trends
              </h3>
              <p className="text-xs text-estate-muted">Appointments scheduled over {timeframe.toLowerCase()} periods</p>
            </div>
          </div>
          <div className="h-64">
            {cityAppointmentTrends.length > 0 ? (
              renderLineChart(cityAppointmentTrends, maxCityAppointments, "#F59E0B", "Appointments")
            ) : (
              <div className="flex items-center justify-center h-full text-estate-muted">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison with Other Cities */}
      {topCities.length > 0 && (
<div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
  <div className="flex items-start justify-between mb-6">
    <div>
      <h3 className="font-bold text-estate-navy flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-purple-600" />
        City Performance Comparison
      </h3>
      <p className="text-xs text-estate-muted">Ranked by total revenue</p>
    </div>
    <div className="flex items-center gap-4 text-xs">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
        <span className="text-estate-text">Your City ({cityStats.name})</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-blue-400"></span>
        <span className="text-estate-text">Others</span>
      </span>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold">
          <th className="py-3 px-4 text-left">Rank</th>
          <th className="py-3 px-4 text-left">City</th>
          <th className="py-3 px-4 text-center">Properties</th>
          <th className="py-3 px-4 text-center">Approved</th>
          <th className="py-3 px-4 text-center">Appointments</th>
          <th className="py-3 px-4 text-center">Revenue (₹ Cr)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-estate-border">
        {/* Build a complete sorted list of all cities by revenue */}
        {(() => {
          // Combine your city and other cities
          const allCities = [cityStats, ...otherCitiesStats];
          // Sort by revenue (descending)
          const sortedCities = [...allCities].sort((a, b) => b.revenue - a.revenue);
          
          return sortedCities.map((city, index) => {
            const isYourCity = city.id === cityStats.id;
            const rank = index + 1;
            
            return (
              <tr key={city.id} className={`hover:bg-estate-bg/40 transition ${isYourCity ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : ''}`}>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${isYourCity ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    #{rank}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {isYourCity && <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
                    <span className={`font-semibold ${isYourCity ? 'text-estate-navy' : 'text-estate-text'}`}>
                      {city.name}
                    </span>
                    {isYourCity && <span className="text-xs text-emerald-600 font-medium">(Your City)</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">{city.properties}</td>
                <td className="py-3 px-4 text-center text-emerald-600">{city.approvedProperties}</td>
                <td className="py-3 px-4 text-center">{city.appointments}</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">
                  ₹{(city.revenue / 10000000).toFixed(1)}Cr
                </td>
              </tr>
            );
          });
        })()}
      </tbody>
    </table>
  </div>

  {/* Performance Insights */}
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
      <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold">
        <TrendingUp className="w-4 h-4" />
        Strength
      </div>
      <p className="text-sm text-estate-text mt-1">
        {cityStats.approvedProperties / (cityStats.properties || 1) > 0.8
          ? "High approval rate - excellent quality listings!"
          : cityStats.appointments > 10
            ? "Strong appointment volume - good engagement!"
            : "Good foundation to build upon"}
      </p>
    </div>
    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
      <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
        <Target className="w-4 h-4" />
        Opportunity
      </div>
      <p className="text-sm text-estate-text mt-1">
        {cityStats.pendingProperties > 0
          ? `${cityStats.pendingProperties} pending properties - review them for faster growth!`
          : otherCitiesStats.length > 0 && otherCitiesStats[0]?.revenue > cityStats.revenue
            ? `Need ₹${((otherCitiesStats[0].revenue - cityStats.revenue) / 10000000).toFixed(1)}Cr more revenue to match ${otherCitiesStats[0].name}!`
            : "Maintain your momentum - you're doing great!"}
      </p>
    </div>
    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
      <div className="flex items-center gap-2 text-purple-700 text-sm font-semibold">
        <Award className="w-4 h-4" />
        Achievement
      </div>
      <p className="text-sm text-estate-text mt-1">
        {cityRank === 1
          ? "🏆 Top performing city! Outstanding work!"
          : cityRank <= 3
            ? `⭐ Top ${cityRank} city - exceptional performance!`
            : `📈 Ranking #${cityRank} - keep climbing the leaderboard!`}
      </p>
    </div>
  </div>
</div>
      )}
    </div>
  );
}