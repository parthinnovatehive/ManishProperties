"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import {
  Building2,
  Home,
  Users,
  UserCheck,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  Eye,
  Mail,
  UserPlus,
  Navigation,
  Handshake,
  CheckCircle,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Award,
  Activity,
  Clock,
  Zap,
  Shield,
  Globe,
  Phone,
  MessageSquare,
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

export default function SuperAdminDashboard() {
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
  const [error, setError] = useState<string | null>(null);
  const [showAllSubareas, setShowAllSubareas] = useState(false);

const loadDashboard = async () => {
  setLoading(true);
  setError(null);
  try {
    // Fetch all data in parallel for better performance
    const [dashboardData, citiesData, subareasData] = await Promise.all([
      estateApi.superAdmin.dashboard<any>(),
      estateApi.cities.list<any>(),
      estateApi.content.subareas.list<any>(),
    ]);
    
    console.log("Dashboard Data:", dashboardData);
    console.log("Cities Data:", citiesData);
    console.log("Subareas Data:", subareasData);
    
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
    if (err && typeof err === "object" && "message" in err) {
      setError(String((err as { message: unknown }).message));
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Failed to load dashboard data.");
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadDashboard();
  }, []);

  // --- Valid KPI Calculations based on actual data ---
  const totalProperties = data.properties.length;
  const approvedProperties = data.properties.filter(
    (p) => p.status === "APPROVED"
  ).length;
  const pendingProperties = data.properties.filter(
    (p) => p.status === "PENDING" || p.moderationStatus === "PENDING"
  ).length;

  const totalAgents = data.agents.length;
  const activeAgents = data.agents.filter((a) => a.status === "active").length;

  const totalAppointments = data.appointments.length;
  const confirmedAppointments = data.appointments.filter(
    (a) => a.status === "Confirmed"
  ).length;
  const pendingAppointments = data.appointments.filter(
    (a) => a.status === "Scheduled" || a.status === "Pending"
  ).length;
  const completedAppointments = data.appointments.filter(
    (a) => a.status === "Completed"
  ).length;

  const totalUsers = data.users.length;
  const activeUsers = data.users.filter((u) => u.status === "active").length;

  const totalLeads = data.leads.length;
  const qualifiedLeads = data.leads.filter(
    (l) => l.status === "Interested" || l.status === "Qualified"
  ).length;

  const totalCities = data.cities.length;
  const totalSubareas = data.subareas.length;

  // Get unique cities and subareas that actually have properties
  const citiesWithProperties = new Set(
    data.properties.map((p) => p.city_id).filter(Boolean)
  ).size;

  const subareasWithProperties = new Set(
    data.properties.map((p) => p.sub_area_id).filter(Boolean)
  ).size;


  const totalComplaints = data.complaints.length;
  const resolvedComplaints = data.complaints.filter(
    (c) => c.status === "resolved"
  ).length;
  const pendingComplaints = data.complaints.filter(
    (c) => c.status === "pending" || c.status === "open"
  ).length;
  const rejectedComplaints = data.complaints.filter(
    (c) => c.status === "rejected"
  ).length;

  // Featured properties (if any)
  const featuredProperties = data.properties.filter(
    (p) => p.featured === true
  ).length;

  // Properties by type (valid categorization)
  const propertyTypes = data.properties.reduce((acc: any, p) => {
    const type = p.type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Appointment types
  const appointmentTypes = data.appointments.reduce((acc: any, a) => {
    const type = a.type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // City-wise distribution (valid)
  const cityAnalytics = data.cities
    .filter(city => city.status === "active") // Only active cities
    .map((city) => {
      // Find properties by city_id
      const cityProps = data.properties.filter((p) => p.city_id === city.id);
      // Find appointments for properties in this city
      const cityAppointments = data.appointments.filter((a) => {
        const prop = data.properties.find((p) => p.id === a.propertyId);
        return prop?.city_id === city.id;
      });
      return {
        id: city.id,
        name: city.name,
        properties: cityProps.length,
        appointments: cityAppointments.length,
        approvedProperties: cityProps.filter((p) => p.status === "APPROVED").length,
        pendingProperties: cityProps.filter((p) => p.status === "PENDING" || p.moderationStatus === "PENDING").length,
      };
    })
    .filter(city => city.properties > 0 || city.appointments > 0)
    .sort((a, b) => b.properties - a.properties);

  // Subarea-wise distribution with proper mapping
  const subareaAnalytics = data.subareas
    .filter(subarea => subarea.status === "active") // Only active subareas
    .map((subarea) => {
      // Find properties by sub_area_id
      const areaProps = data.properties.filter((p) => p.sub_area_id === subarea.id);
      // Find appointments for properties in this subarea
      const areaAppointments = data.appointments.filter((a) => {
        const prop = data.properties.find((p) => p.id === a.propertyId);
        return prop?.sub_area_id === subarea.id;
      });
      // Get city name for this subarea
      const city = data.cities.find((c) => c.id === subarea.city_id);
      return {
        id: subarea.id,
        name: subarea.name,
        city_id: subarea.city_id,
        city_name: city?.name || "Unknown",
        properties: areaProps.length,
        appointments: areaAppointments.length,
        approvedProperties: areaProps.filter((p) => p.status === "APPROVED").length,
        pendingProperties: areaProps.filter((p) => p.status === "PENDING" || p.moderationStatus === "PENDING").length,
      };
    })
    .filter(area => area.properties > 0 || area.appointments > 0)
    .sort((a, b) => b.properties - a.properties);


  // Agent performance based on appointments and properties
  const topAgents = data.agents
    .map((agent) => {
      const agentAppointments = data.appointments.filter(
        (a) => a.agentId === agent.id || a.agent_id === agent.id
      );
      const agentProperties = data.properties.filter(
        (p) => p.lister_id === agent.id && p.lister_type === "agent"
      );
      return {
        ...agent,
        appointments: agentAppointments.length,
        confirmedAppointments: agentAppointments.filter(
          (a) => a.status === "Confirmed"
        ).length,
        properties: agentProperties.length,
        approvedProperties: agentProperties.filter(
          (p) => p.status === "APPROVED"
        ).length,
      };
    })
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 5);

  // Subarea performance
  const topAreas = data.subareas
    .map((subarea) => {
      const areaProps = data.properties.filter(
        (p) => p.sub_area_id === subarea.id
      );
      const areaAppointments = data.appointments.filter((a) => {
        const prop = data.properties.find((p) => p.id === a.propertyId);
        return prop?.sub_area_id === subarea.id;
      });
      return {
        name: subarea.name,
        city_id: subarea.city_id,
        properties: areaProps.length,
        appointments: areaAppointments.length,
        approvedProperties: areaProps.filter((p) => p.status === "APPROVED").length,
      };
    })
    .filter((area) => area.properties > 0 || area.appointments > 0)
    .sort((a, b) => b.properties - a.properties)
    .slice(0, 5);

  // Today's activity
  const today = new Date().toISOString().split("T")[0];
  const propertiesAddedToday = data.properties.filter(
    (p) => p.createdAt && p.createdAt.split("T")[0] === today
  ).length;
  const appointmentsToday = data.appointments.filter(
    (a) => a.date && new Date(a.date).toISOString().split("T")[0] === today
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-estate-navy text-lg">Loading platform data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700 font-semibold">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-estate-navy to-estate-navy-mid rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold font-serif">Super Admin Dashboard</h1>
            <p className="text-white/80 text-sm mt-1">
              Platform Overview. Monitor properties, agents, appointments, and user engagement.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider">
              System: Operational
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Total Properties
              </p>
              <p className="text-3xl font-extrabold text-estate-navy mt-2">
                {totalProperties.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-emerald-600">✓ {approvedProperties} Approved</span>
            {pendingProperties > 0 && (
              <span className="text-amber-600">⏳ {pendingProperties} Pending</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Agents
              </p>
              <p className="text-3xl font-extrabold text-estate-navy mt-2">
                {totalAgents.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Appointments
              </p>
              <p className="text-3xl font-extrabold text-estate-navy mt-2">
                {totalAppointments.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="text-emerald-600">✓ {confirmedAppointments} Confirmed</span>
            {pendingAppointments > 0 && (
              <span className="text-amber-600">⏳ {pendingAppointments} Pending</span>
            )}
            {completedAppointments > 0 && (
              <span className="text-blue-600">✓ {completedAppointments} Completed</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Total Users
              </p>
              <p className="text-3xl font-extrabold text-estate-navy mt-2">
                {totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Cities & Areas Card */}
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Cities & Areas
              </p>
              <p className="text-3xl font-extrabold text-estate-navy mt-2">
                {totalCities}
              </p>
            </div>
            <div className="p-3 bg-cyan-50 rounded-full">
              <MapPin className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <div className="mt-2 space-y-0.5 text-xs">
            <p className="text-cyan-600">🏙️ {totalCities} Total Cities</p>
            <p className="text-cyan-600">📍 {totalSubareas} Total Subareas</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Complaints
              </p>
              <p className="text-3xl font-extrabold text-rose-600 mt-2">
                {totalComplaints}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-full">
              <MessageSquare className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="text-emerald-600">✓ {resolvedComplaints} Resolved</span>
            {pendingComplaints > 0 && (
              <span className="text-amber-600">⏳ {pendingComplaints} Pending</span>
            )}
            {rejectedComplaints > 0 && (
              <span className="text-rose-600">✕ {rejectedComplaints} Rejected</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Featured Properties
              </p>
              <p className="text-3xl font-extrabold text-amber-600 mt-2">
                {featuredProperties}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">
            ⭐ Premium Listings
          </p>
        </div>
      </div>

      {/* Property Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">
            Properties by Type
          </h2>
          <div className="space-y-3">
            {Object.entries(propertyTypes)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-estate-text">{type}</span>
                    <span className="font-bold text-estate-navy">{count as number}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{
                        width: `${totalProperties > 0 ? ((count as number) / totalProperties) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">
            Appointment Types
          </h2>
          <div className="space-y-3">
            {Object.entries(appointmentTypes)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-estate-text">{type}</span>
                    <span className="font-bold text-estate-navy">{count as number}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                      style={{
                        width: `${totalAppointments > 0 ? ((count as number) / totalAppointments) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* City-Wise Distribution with Subareas */}
      {(cityAnalytics.length > 0 || subareaAnalytics.length > 0) && (
        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-2">
            City & Subarea Distribution
          </h2>
          <p className="text-sm text-estate-text-sec mb-6">
            Properties and appointments by city and subarea
          </p>

          {/* Cities Table */}
          <div className="overflow-x-auto mb-8">
            <h3 className="text-sm font-semibold text-estate-text mb-3">Cities</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold">
                  <th className="py-3 px-4 text-left">City</th>
                  <th className="py-3 px-4 text-center">Total Properties</th>
                  <th className="py-3 px-4 text-center">Approved</th>
                  <th className="py-3 px-4 text-center">Pending</th>
                  <th className="py-3 px-4 text-center">Appointments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-estate-border">
                {cityAnalytics.map((city) => (
                  <tr key={city.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-3 px-4 font-semibold text-estate-text">
                      {city.name}
                    </td>
                    <td className="py-3 px-4 text-center">{city.properties}</td>
                    <td className="py-3 px-4 text-center text-emerald-600">
                      {city.approvedProperties}
                    </td>
                    <td className="py-3 px-4 text-center text-amber-600">
                      {city.pendingProperties}
                    </td>
                    <td className="py-3 px-4 text-center">{city.appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Performing Subareas */}
          {/* Top Performing Subareas */}
{subareaAnalytics.length > 0 && (
  <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
    <h2 className="text-xl font-bold text-estate-navy font-serif mb-2 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-emerald-500" />
      Top Performing Subareas
    </h2>
    <p className="text-sm text-estate-text-sec mb-6">
      Best performing subareas by property count
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(showAllSubareas ? subareaAnalytics : subareaAnalytics.slice(0, 6)).map((area) => (
        <div
          key={area.id}
          className="p-4 bg-gradient-to-br from-gray-50 to-white border border-estate-border rounded-2xl hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-estate-navy">{area.name}</p>
              <p className="text-xs text-estate-muted mt-1">
                {area.city_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600">
                {area.properties}
              </p>
              <p className="text-xs text-estate-muted">properties</p>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-estate-muted border-t pt-2">
            <span>✓ {area.approvedProperties} approved</span>
            <span>{area.appointments} appointments</span>
          </div>
        </div>
      ))}
    </div>

    {/* ✅ View More / View Less Button */}
    {subareaAnalytics.length > 6 && (
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowAllSubareas(!showAllSubareas)}
          className="px-6 py-2.5 text-sm font-semibold text-estate-navy border border-estate-border rounded-xl hover:bg-estate-bg transition flex items-center gap-2"
        >
          {showAllSubareas ? (
            <>
              <span>Show Less</span>
              <span className="text-xs">▲</span>
            </>
          ) : (
            <>
              <span>View All ({subareaAnalytics.length})</span>
              <span className="text-xs">▼</span>
            </>
          )}
        </button>
      </div>
    )}
  </div>
)}
        </div>
      )}

      {/* Top Performing Agents */}
      {topAgents.length > 0 && (
        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Performing Agents
          </h2>
          <p className="text-sm text-estate-text-sec mb-6">
            Leaderboard based on appointments and property listings
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold">
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Agent</th>
                  <th className="py-3 px-4 text-center">Properties</th>
                  <th className="py-3 px-4 text-center">Appointments</th>
                  <th className="py-3 px-4 text-center">Confirmed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-estate-border">
                {topAgents.map((agent, index) => (
                  <tr
                    key={agent.id}
                    className={`hover:bg-estate-bg/40 transition ${index === 0 ? "bg-amber-50/50" : ""
                      }`}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${index === 0
                          ? "bg-amber-500 text-white"
                          : index === 1
                            ? "bg-gray-300 text-gray-700"
                            : index === 2
                              ? "bg-amber-600/30 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-estate-text">
                        {agent.name || "N/A"}
                      </div>
                      <div className="text-xs text-estate-muted">{agent.email}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {agent.properties} ({agent.approvedProperties} approved)
                    </td>
                    <td className="py-3 px-4 text-center">{agent.appointments}</td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-600">
                      {agent.confirmedAppointments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Performing Areas */}
      {topAreas.length > 0 && (
        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Top Performing Areas
          </h2>
          <p className="text-sm text-estate-text-sec mb-6">
            Best performing subareas by property count
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAreas.map((area) => (
              <div
                key={area.name}
                className="p-4 bg-gradient-to-br from-gray-50 to-white border border-estate-border rounded-2xl hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-estate-navy">{area.name}</p>
                    <p className="text-xs text-estate-muted mt-1">
                      City: {area.city_id || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      {area.properties}
                    </p>
                    <p className="text-xs text-estate-muted">properties</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-estate-muted border-t pt-2">
                  <span>✓ {area.approvedProperties} approved</span>
                  <span>{area.appointments} appointments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Activity & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">


        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-full">
              <Home className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Properties Listed Today
              </p>
              <p className="text-2xl font-extrabold text-estate-navy">
                {propertiesAddedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-full">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">
                Appointments Today
              </p>
              <p className="text-2xl font-extrabold text-estate-navy">
                {appointmentsToday}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}