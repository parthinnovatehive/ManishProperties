"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/user/StatsCard";
import AppointmentCard from "@/components/user/AppointmentCard";
import SavedPropertyCard from "@/components/user/SavedPropertyCard";
import { estateApi } from "@/lib/api";
import { BarChart3, Calendar, Heart, Eye } from "lucide-react";
import type { Property } from "@/types";

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>({ name: "User", savedProperties: [] });
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [userSavedProperties, setUserSavedProperties] = useState<Property[]>([]);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await estateApi.users.me<any>();
      const [appointments, properties, complaints] = await Promise.all([
        estateApi.appointments.myList<any>(),
        estateApi.properties.list(),
        estateApi.complaints.list<any>(),
      ]);
      setUser(userProfile);
      setUserAppointments(appointments);
      const savedIds = (userProfile.savedProperties || []).map(String);
      setUserSavedProperties(properties.filter((property) => savedIds.includes(String(property.id))));
      setComplaintsCount(complaints.filter((complaint) => complaint.status !== "Resolved" && String(complaint.userId) === String(userProfile.id)).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    setFormattedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
  }, []);

  // Compute Stats
  const savedCount = userSavedProperties.length;
  const appointmentCount = userAppointments.length;
  const propertiesViewedCount = userSavedProperties.length + userAppointments.length;

  return <section className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
    {error && (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        {error}
        <button onClick={loadDashboard} className="ml-3 font-bold underline">Retry</button>
      </div>
    )}
    {loading && (
      <div className="rounded-2xl border border-estate-border bg-white p-4 text-sm font-semibold text-estate-text-sec">
        Loading dashboard data...
      </div>
    )}
    {/* Welcome Banner */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
          Welcome back, {user.name}!
        </h1>
        <p className="text-sm font-semibold text-estate-text-sec mt-1">
          Here is a summary of your saved properties, appointments, and activity.
        </p>
      </div>
      <div className="text-xs font-bold text-estate-navy bg-estate-blue-pale/80 border border-estate-border-med px-4 py-2 rounded-xl">
        Today: {formattedDate}
      </div>
    </div>

    {/* Stats Cards Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatsCard
        title="Saved Properties"
        value={savedCount}
        change="Properties"
        icon={Heart}
        iconColor="text-estate-navy"
        iconBg="bg-estate-blue-pale"
      />

      <StatsCard
        title="Appointments"
        value={appointmentCount}
        change="Scheduled"
        icon={Calendar}
        iconColor="text-emerald-700"
        iconBg="bg-emerald-50"
      />

      <StatsCard
        title="Active Complaints"
        value={complaintsCount}
        change="Open"
        icon={BarChart3}
        iconColor="text-estate-amber-dark"
        iconBg="bg-estate-amber-pale"
      />

      <StatsCard
        title="Properties Viewed"
        value={propertiesViewedCount}
        change="Total"
        icon={Eye}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
      />
    </div>


    {/* Upcoming Appointments */}
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-estate-navy tracking-tight font-serif">
        Upcoming Appointments
      </h2>

      {userAppointments.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-estate-border text-center">
          <p className="text-estate-text-sec font-semibold">No upcoming appointments scheduled.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {userAppointments.slice(0, 2).map((apt) => (
            <AppointmentCard
              key={apt.id}
              property={apt.propertyName}
              date={`${apt.date} at ${apt.time}`}
              agent={apt.agentName}
              status={apt.status}
            />
          ))}
        </div>
      )}
    </div>

    {/* Saved Properties */}
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-estate-navy tracking-tight font-serif">
        Recently Saved Properties
      </h2>

      {userSavedProperties.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-estate-border text-center">
          <p className="text-estate-text-sec font-semibold">No saved properties yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userSavedProperties.slice(0, 3).map((prop) => (
            <SavedPropertyCard
              key={prop.id}
              id={prop.id}
              title={prop.title}
              location={prop.location}
              price={prop.price}
              image={prop.img ?? prop.image ?? ""}
              type={prop.type}
            />
          ))}
        </div>
      )}
    </div>
  </section>

}
