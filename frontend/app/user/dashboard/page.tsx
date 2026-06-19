"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCard from "@/components/user/StatsCard";
import SavedPropertyCard from "@/components/user/SavedPropertyCard";
import { estateApi } from "@/lib/api";
import { getAdminData } from "@/lib/utils/token";
import { BarChart3, Calendar, Heart, Eye, Clock, User, Phone, MapPin, ExternalLink, Video, Star, Loader2 } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import type { Property } from "@/types";

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>({ name: "User", savedProperties: [] });
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [userSavedProperties, setUserSavedProperties] = useState<Property[]>([]);
  const [propertyImages, setPropertyImages] = useState<Map<string, string>>(new Map());
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [ratedAppointments, setRatedAppointments] = useState<Set<string>>(new Set());
  const [ratingTarget, setRatingTarget] = useState<any>(null);
  const [userRating, setUserRating] = useState(0);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

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
      // Fetch property images for appointments
      const imgMap = new Map<string, string>();
      for (const apt of appointments) {
        if (apt.propertyId && !imgMap.has(String(apt.propertyId))) {
          try {
            const prop = await estateApi.properties.detail(apt.propertyId);
            const src = prop.image || (prop.images && prop.images[0]) || "";
            imgMap.set(String(apt.propertyId), src);
          } catch { /* ignore */ }
        }
      }
      setPropertyImages(imgMap);
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
    const account = getAdminData();
    if (account?.id) {
      estateApi.users.me<any>().then(user => {
        const ratings = user.agentRatings || {};
        setRatedAppointments(new Set(Object.keys(ratings)));
      }).catch(() => {});
    }
  }, []);

  // Compute Stats
  const savedCount = userSavedProperties.length;
  const appointmentCount = userAppointments.length;
  const propertiesViewedCount = userSavedProperties.length + userAppointments.length;

  const completedAppointments = userAppointments.filter((apt) => apt.status === "Completed");

  const handleRateAgent = async () => {
    if (!ratingTarget || userRating === 0) return;
    setIsRatingSubmitting(true);
    try {
      const account = getAdminData();
      if (!account?.id) {
        setIsRatingSubmitting(false);
        return;
      }
      const user = await estateApi.users.me<any>();
      const existingRatings = user.agentRatings || {};
      await estateApi.users.update(account.id, {
        agentRatings: {
          ...existingRatings,
          [ratingTarget.id]: {
            agentName: ratingTarget.agentName,
            agentEmail: ratingTarget.agentEmail,
            rating: userRating,
            propertyName: ratingTarget.propertyName,
            timestamp: new Date().toISOString(),
          },
        },
      } as any);
      setRatedAppointments(prev => new Set(prev).add(ratingTarget.id));
      setRatingTarget(null);
      setUserRating(0);
    } catch (error) {
      console.error("Error rating agent:", error);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = userAppointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status === "Confirmed";
  });

  const missedAppointments = userAppointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today && apt.status === "Confirmed";
  });

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

      {upcomingAppointments.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-estate-border text-center">
          <p className="text-estate-text-sec font-semibold">No upcoming appointments scheduled.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {upcomingAppointments.slice(0, 2).map((apt) => {
            const aptImg = propertyImages.get(String(apt.propertyId)) || "https://placehold.co/400x300?text=No+Image";
            return (
              <div key={apt.id} className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden hover:shadow-lg transition">
                <div className="flex h-full">
                  <div className="w-28 sm:w-36 flex-shrink-0">
                    <img
                      src={aptImg}
                      alt={apt.propertyName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image"; }}
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {apt.status}
                        </span>
                        {apt.type && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            {apt.type}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-estate-navy truncate">{apt.propertyName}</h3>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                        <Calendar className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                        <span>{apt.date} at {apt.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                        <User className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                        <span className="truncate">{apt.agentName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {apt.agentPhone && (
                        <a
                          href={`tel:${apt.agentPhone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Agent
                        </a>
                      )}
                      {apt.propertyId && (
                        <Link
                          href={`/properties/${apt.propertyId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-estate-navy text-white text-xs font-bold rounded-lg hover:bg-estate-navy-mid transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Missed Appointments */}
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-estate-navy tracking-tight font-serif">
        Missed Appointments
      </h2>

      {missedAppointments.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-estate-border text-center">
          <p className="text-estate-text-sec font-semibold">No missed appointments.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {missedAppointments.slice(0, 3).map((apt) => {
            const aptImg = propertyImages.get(String(apt.propertyId)) || "https://placehold.co/400x300?text=No+Image";
            return (
              <div key={apt.id} className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden hover:shadow-lg transition">
                <div className="flex h-full">
                  <div className="w-28 sm:w-36 flex-shrink-0">
                    <img
                      src={aptImg}
                      alt={apt.propertyName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image"; }}
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          Missed
                        </span>
                        {apt.type && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            {apt.type}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-estate-navy truncate">{apt.propertyName}</h3>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                        <Calendar className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                        <span>{apt.date} at {apt.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                        <User className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                        <span className="truncate">{apt.agentName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {apt.agentPhone && (
                        <a
                          href={`tel:${apt.agentPhone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Agent
                        </a>
                      )}
                      {apt.propertyId && (
                        <Link
                          href={`/properties/${apt.propertyId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-estate-navy text-white text-xs font-bold rounded-lg hover:bg-estate-navy-mid transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Recently Completed */}
    {completedAppointments.length > 0 && (
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-estate-navy tracking-tight font-serif">
          Recently Completed
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {completedAppointments.slice(0, 3).map((apt) => {
            const aptImg = propertyImages.get(String(apt.propertyId)) || "https://placehold.co/400x300?text=No+Image";
            return (
              <div key={apt.id} className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden hover:shadow-lg transition">
                <div className="flex h-full">
                  <div className="w-28 sm:w-36 flex-shrink-0">
                    <img
                      src={aptImg}
                      alt={apt.propertyName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image"; }}
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          Completed
                        </span>
                      </div>
                      <h3 className="font-bold text-estate-navy truncate">{apt.propertyName}</h3>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                        <User className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                        <span className="truncate">{apt.agentName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {ratedAppointments.has(apt.id) ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg border border-gray-200">
                          <Star className="w-3.5 h-3.5 fill-estate-amber text-estate-amber" />
                          Rated
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setRatingTarget(apt);
                            setUserRating(0);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Rate Agent
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

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
      {/* Rate Agent Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-estate-border">
              <h2 className="text-xl font-bold text-estate-navy font-serif flex items-center gap-2">
                <Star className="w-5 h-5 text-estate-amber fill-estate-amber" />
                Rate Agent
              </h2>
              <button
                onClick={() => { setRatingTarget(null); setUserRating(0); }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-estate-blue-pale flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-estate-navy" />
                </div>
                <h3 className="text-lg font-bold text-estate-navy">{ratingTarget.agentName}</h3>
                <p className="text-sm text-estate-muted mt-1">
                  Rate your experience with this agent
                </p>
                <p className="text-xs text-estate-text-sec mt-1">
                  {ratingTarget.propertyName}
                </p>
              </div>

              <div className="flex justify-center py-4">
                <StarRating
                  rating={userRating}
                  onRate={setUserRating}
                  size={36}
                />
              </div>

              {userRating > 0 && (
                <div className="text-center text-sm text-estate-text-sec">
                  {userRating === 1 && "Poor"}
                  {userRating === 2 && "Fair"}
                  {userRating === 3 && "Good"}
                  {userRating === 4 && "Very Good"}
                  {userRating === 5 && "Excellent"}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => { setRatingTarget(null); setUserRating(0); }}
                className="px-4 py-2 text-estate-text-sec font-semibold rounded-xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRateAgent}
                disabled={userRating === 0 || isRatingSubmitting}
                className="px-6 py-2 bg-estate-amber text-white font-semibold rounded-xl hover:bg-estate-amber-dark transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isRatingSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-white" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
  </section>

}
