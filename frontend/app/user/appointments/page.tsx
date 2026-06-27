"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { estateApi } from "@/lib/api";
import { getAdminData } from "@/lib/utils/token";
import { Calendar, Clock, User, Phone, Video, MapPin, CheckCircle, XCircle, AlertCircle, MessageSquare, ExternalLink, Bed, Bath, Maximize2, RefreshCw, Star, Loader2 } from "lucide-react";
import { toastManager } from "@/lib/utils/toast";
import { StarRating } from "@/components/ui/StarRating";
import { AgentRatingDisplay } from "@/components/ui/AgentRatingDisplay";

interface Appointment {
  id: string;
  propertyId: string | number;
  propertyName: string;
  propertyLocation?: string;
  propertyImage?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Scheduled" | "Completed";
  type: "In-Person" | "Video Call";
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

interface Property {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  location: string;
  city: string;
  type: string;
  beds: number;
  bathrooms: number;
  area: number;
  image?: string;
  images?: string[];
  status: string;
}

export default function UserAppointmentsPage() {
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [properties, setProperties] = useState<Map<string, Property>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past" | "missed">("upcoming");
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [ratedAppointments, setRatedAppointments] = useState<Set<string>>(new Set());
  const [ratingTarget, setRatingTarget] = useState<Appointment | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [showMissedBanner, setShowMissedBanner] = useState(true);

  useEffect(() => {
    fetchAppointments();
    const account = getAdminData();
    if (account?.id) {
      estateApi.users.me<any>().then(user => {
        const ratings = user.agentRatings || {};
        setRatedAppointments(new Set(Object.keys(ratings)));
      }).catch(() => {});
    }
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const account = getAdminData();
      if (!account?.id) return;

      const allAppointments = await estateApi.appointments.list<Appointment>();
      
      const userAppointments = allAppointments.filter(
        (appointment) => appointment.userId === account.id
      );
      
      setAppointmentsList(userAppointments);

      // Fetch property details for each appointment
      const propertyMap = new Map();
      for (const apt of userAppointments) {
        if (apt.propertyId && !propertyMap.has(apt.propertyId)) {
          try {
            const property = await estateApi.properties.detail(apt.propertyId);
            propertyMap.set(apt.propertyId, property);
          } catch (error) {
            console.error(`Error fetching property ${apt.propertyId}:`, error);
          }
        }
      }
      setProperties(propertyMap);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await estateApi.appointments.update<Appointment>(id, { status: "Cancelled" });
        setAppointmentsList(prev =>
          prev.map(apt => (apt.id === id ? { ...apt, status: "Cancelled" as const } : apt))
        );
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        toastManager.error("Failed to cancel appointment. Please try again.");
      }
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    setIsRescheduling(true);
    try {
      const account = getAdminData();
      const newAppt = {
        id: `apt_${Date.now()}`,
        propertyId: rescheduleTarget.propertyId,
        propertyName: rescheduleTarget.propertyName,
        userId: account?.id || rescheduleTarget.userId,
        userName: rescheduleTarget.userName,
        userEmail: rescheduleTarget.userEmail,
        userPhone: rescheduleTarget.userPhone,
        agentName: rescheduleTarget.agentName,
        agentEmail: rescheduleTarget.agentEmail,
        agentPhone: rescheduleTarget.agentPhone,
        date: rescheduleDate,
        time: rescheduleTime,
        status: "Confirmed" as const,
        type: rescheduleTarget.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await estateApi.appointments.update(rescheduleTarget.id, { status: "Cancelled" });
      const created = await estateApi.appointments.create<Appointment>(newAppt);
      setAppointmentsList(prev => prev.map(a => a.id === rescheduleTarget.id ? { ...a, status: "Cancelled" as const } : a).concat([created]));
      setRescheduleTarget(null);
      setRescheduleDate("");
      setRescheduleTime("");
      toastManager.success("Appointment rescheduled successfully! A new booking has been created.");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toastManager.error("Failed to reschedule appointment. Please try again.");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleRateAgent = async () => {
    if (!ratingTarget || userRating === 0) return;
    setIsRatingSubmitting(true);
    try {
      const account = getAdminData();
      if (!account?.id) {
        toastManager.error("User not found. Please log in again.");
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
      toastManager.success(`Thank you for rating ${ratingTarget.agentName}!`);
    } catch (error) {
      console.error("Error rating agent:", error);
      toastManager.error("Failed to submit rating. Please try again.");
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const openAppointmentDetails = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const property = properties.get(String(appointment.propertyId));
    setSelectedProperty(property || null);
    setIsModalOpen(true);
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filterStatus) {
      case "upcoming":
        return appointmentsList.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return apt.status !== "Cancelled" && aptDate >= today;
        });
      case "past":
        return appointmentsList.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return apt.status !== "Cancelled" && aptDate < today;
        });
      case "missed":
        return appointmentsList.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return apt.status !== "Cancelled" && apt.status !== "Completed" && aptDate < today;
        });
      default:
        return appointmentsList;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "Scheduled":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "Pending":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <XCircle className="w-4 h-4 text-rose-600" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Completed":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "In-Person") {
      return <MapPin className="w-4 h-4" />;
    }
    return <Video className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-IN", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const isPastDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isMissedAppointment = (apt: Appointment) => {
    return isPastDate(apt.date) && apt.status !== "Cancelled" && apt.status !== "Completed";
  };

  const getPropertyImage = (property: Property | null | undefined): string => {
    if (!property) return "https://placehold.co/400x300?text=No+Image";
    return property.image || 
           (property.images && property.images[0]) || 
           "https://placehold.co/400x300?text=No+Image";
  };

  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`;
    }
    return price || 'Price on request';
  };

  const filteredAppointments = getFilteredAppointments();
  const upcomingCount = appointmentsList.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apt.status !== "Cancelled" && aptDate >= today;
  }).length;
  const pastCount = appointmentsList.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apt.status !== "Cancelled" && aptDate < today;
  }).length;
  const missedCount = appointmentsList.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apt.status !== "Cancelled" && apt.status !== "Completed" && aptDate < today;
  }).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-estate-navy">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-estate-navy font-serif">My Appointments</h1>
        <p className="text-sm text-estate-text-sec mt-1">Track and manage your property viewing appointments.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">Upcoming</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">{upcomingCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">Completed</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{pastCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">Missed</p>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">{missedCount}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-full">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-estate-border pb-2">
        <button
          onClick={() => setFilterStatus("upcoming")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition min-h-[44px] ${
            filterStatus === "upcoming"
              ? "bg-estate-navy text-white"
              : "text-estate-text-sec hover:text-estate-navy"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilterStatus("past")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition min-h-[44px] ${
            filterStatus === "past"
              ? "bg-estate-navy text-white"
              : "text-estate-text-sec hover:text-estate-navy"
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setFilterStatus("missed")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition relative min-h-[44px] ${
            filterStatus === "missed"
              ? "bg-estate-navy text-white"
              : "text-estate-text-sec hover:text-estate-navy"
          }`}
        >
          Missed
          {missedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {missedCount > 9 ? "9+" : missedCount}
            </span>
          )}
        </button>
      </div>

      {/* Missed Appointments Banner */}
      {missedCount > 0 && showMissedBanner && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-rose-700">
                You have {missedCount} missed appointment{missedCount > 1 ? 's' : ''}!
              </p>
              <p className="text-sm text-rose-600">
                Please reschedule or contact the agent.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus("missed")}
              className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition min-h-[44px]"
            >
              View Missed
            </button>
            <button
              onClick={() => setShowMissedBanner(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 transition"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-estate-border p-12 text-center">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-estate-text-sec">No appointments found.</p>
          <p className="text-sm text-estate-muted mt-1">
            {filterStatus === "upcoming" 
              ? "You don't have any upcoming appointments." 
              : filterStatus === "past"
              ? "You don't have any past appointments."
              : filterStatus === "missed"
              ? "You haven't missed any appointments."
              : "No cancelled appointments."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((apt) => {
            const property = properties.get(String(apt.propertyId));
            const propImg = getPropertyImage(property);
            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border shadow-estate overflow-hidden hover:shadow-lg transition cursor-pointer relative ${
                  isMissedAppointment(apt)
                    ? "border-rose-300 bg-rose-50/30"
                    : "border-estate-border"
                }`}
                onClick={() => openAppointmentDetails(apt)}
              >
                <div className="flex h-full">
                  <div className="w-28 sm:w-36 flex-shrink-0 relative">
                    {isMissedAppointment(apt) && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                          Missed
                        </span>
                      </div>
                    )}
                    <img
                      src={propImg}
                      alt={apt.propertyName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image"; }}
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.type && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            {apt.type}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-estate-navy truncate mt-1">{apt.propertyName}</h3>
                      {property?.location && (
                        <p className="text-xs text-estate-muted truncate mt-0.5">{property.location}</p>
                      )}
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                        <Calendar className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                        <span>{formatDate(apt.date)} at {apt.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                        <User className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                        <span className="truncate">{apt.agentName}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      {apt.agentPhone && (
                        <a
                          href={`tel:${apt.agentPhone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition min-h-[44px]"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Agent
                        </a>
                      )}
                      {apt.propertyId && (
                        <Link
                          href={`/properties/${apt.propertyId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-estate-navy text-white text-xs font-bold rounded-lg hover:bg-estate-navy-mid transition min-h-[44px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </Link>
                      )}
                      {apt.status === "Completed" && (
                        ratedAppointments.has(apt.id) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg border border-gray-200 min-h-[44px]">
                            <Star className="w-3.5 h-3.5 fill-estate-amber text-estate-amber" />
                            Rated
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setRatingTarget(apt);
                              setUserRating(0);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition min-h-[44px]"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Rate Agent
                          </button>
                        )
                      )}
                      {filterStatus === "missed" && (
                        <button
                          onClick={() => {
                            setRescheduleTarget(apt);
                            setRescheduleDate("");
                            setRescheduleTime("");
                          }}
                          className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition min-h-[44px]"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl">
            <div className="sticky top-0 bg-white flex justify-between items-center p-4 sm:p-6 border-b border-estate-border">
              <h2 className="text-lg sm:text-xl font-bold text-estate-navy font-serif">Appointment Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl ${
                selectedAppointment.status === "Confirmed" ? "bg-emerald-50 border border-emerald-200" :
                selectedAppointment.status === "Pending" ? "bg-amber-50 border border-amber-200" :
                selectedAppointment.status === "Cancelled" ? "bg-rose-50 border border-rose-200" :
                "bg-blue-50 border border-blue-200"
              }`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedAppointment.status)}
                  <div>
                    <p className="text-sm font-semibold">Status: {selectedAppointment.status}</p>
                    {selectedAppointment.status === "Confirmed" && (
                      <p className="text-xs text-emerald-700 mt-1">Your appointment has been confirmed.</p>
                    )}
                    {selectedAppointment.status === "Pending" && (
                      <p className="text-xs text-amber-700 mt-1">Waiting for agent confirmation.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Details Section */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-bold text-estate-navy flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Property Details
                    <Link
                      href={`/properties/${selectedAppointment.propertyId}`}
                      target="_blank"
                      className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Full Property <ExternalLink size={12} />
                    </Link>
                  </h3>
                </div>
                
                {selectedProperty ? (
                  <div className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={getPropertyImage(selectedProperty)}
                        alt={selectedProperty.title}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-estate-navy text-lg">{selectedProperty.title}</h4>
                        <p className="text-sm text-estate-text-sec mt-1">{selectedProperty.location}, {selectedProperty.city}</p>
                        <p className="text-xl font-bold text-estate-navy mt-2">{formatPrice(selectedProperty.price)}</p>
                        
                        <div className="flex gap-4 mt-3 text-sm">
                          {selectedProperty.beds && (
                            <div className="flex items-center gap-1">
                              <Bed size={16} className="text-estate-muted" />
                              <span>{selectedProperty.beds} Beds</span>
                            </div>
                          )}
                          {selectedProperty.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath size={16} className="text-estate-muted" />
                              <span>{selectedProperty.bathrooms} Baths</span>
                            </div>
                          )}
                          {selectedProperty.area && (
                            <div className="flex items-center gap-1">
                              <Maximize2 size={16} className="text-estate-muted" />
                              <span>{selectedProperty.area} sq.ft</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-estate-muted">
                    <p>Property details not available</p>
                    <Link
                      href={`/properties/${selectedAppointment.propertyId}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                    >
                      Click here to view property →
                    </Link>
                  </div>
                )}
              </div>

              {/* Appointment Details */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-bold text-estate-navy flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Details
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-estate-muted">Date</p>
                      <p className="font-medium">{formatDate(selectedAppointment.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-muted">Time</p>
                      <p className="font-medium">{selectedAppointment.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-muted">Type</p>
                      <p className="font-medium">{selectedAppointment.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-muted">Meeting Mode</p>
                      <p className="font-medium">{selectedAppointment.type === "In-Person" ? "Physical Visit" : "Virtual Meeting"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Details */}
<div className="border rounded-xl overflow-hidden">
  <div className="bg-gray-50 px-4 py-3 border-b">
    <h3 className="font-bold text-estate-navy flex items-center gap-2">
      <User className="w-4 h-4" />
      Assigned Agent
    </h3>
  </div>
  <div className="p-4">
    <p className="font-semibold text-estate-text">{selectedAppointment.agentName}</p>
    <p className="text-sm text-estate-muted">{selectedAppointment.agentEmail}</p>
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        <Phone size={14} className="text-estate-muted" />
        <span className="text-sm font-medium">
          {selectedAppointment.agentPhone ? selectedAppointment.agentPhone : "Not available"}
        </span>
      </div>
      {selectedAppointment.agentPhone && (
        <a
          href={`tel:${selectedAppointment.agentPhone}`}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <Phone size={14} />
          Call Agent
        </a>
      )}
    </div>
    <button
      onClick={() => toastManager.info(`Contacting Agent ${selectedAppointment.agentName} via email: ${selectedAppointment.agentEmail}`)}
      className="mt-3 w-full px-4 py-2 bg-estate-navy text-white text-sm font-semibold rounded-xl hover:bg-estate-navy-mid transition min-h-[44px]"
    >
      Email Agent
    </button>
  </div>
</div>

              {/* Additional Info */}
              {selectedAppointment.notes && (
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-bold text-estate-navy flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Special Notes
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-estate-text-sec bg-yellow-50 p-3 rounded-xl">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 sm:p-6 border-t border-estate-border bg-gray-50">
             
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-estate-navy text-white font-semibold rounded-xl hover:bg-estate-navy-mid transition min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl">
            <div className="sticky top-0 bg-white flex justify-between items-center p-4 sm:p-6 border-b border-estate-border">
              <h2 className="text-lg sm:text-xl font-bold text-estate-navy font-serif">Reschedule Appointment</h2>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              <div>
                <h3 className="font-bold text-estate-navy mb-1">{rescheduleTarget.propertyName}</h3>
                <p className="text-xs text-estate-muted">Current: {rescheduleTarget.date} at {rescheduleTarget.time}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-estate-navy mb-1.5">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-estate-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-estate-navy/20 focus:border-estate-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-estate-navy mb-1.5">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-estate-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-estate-navy/20 focus:border-estate-navy"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 sm:p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 text-estate-text-sec font-semibold rounded-xl hover:bg-gray-100 transition min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate || !rescheduleTime || isRescheduling}
                className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Agent Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-estate-border">
              <h2 className="text-lg sm:text-xl font-bold text-estate-navy font-serif flex items-center gap-2">
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

            <div className="p-4 sm:p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-estate-blue-pale flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-estate-navy" />
                </div>
                <h3 className="text-lg font-bold text-estate-navy">{ratingTarget.agentName}</h3>
                <p className="text-sm text-estate-muted mt-1">
                  Rate your experience with this agent
                </p>
                <p className="text-xs text-estate-text-sec mt-1">
                  {ratingTarget.propertyName} &middot; {ratingTarget.date}
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

            <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => { setRatingTarget(null); setUserRating(0); }}
                className="px-4 py-2 text-estate-text-sec font-semibold rounded-xl hover:bg-gray-100 transition min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRateAgent}
                disabled={userRating === 0 || isRatingSubmitting}
                className="px-6 py-2 bg-estate-amber text-white font-semibold rounded-xl hover:bg-estate-amber-dark transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 min-h-[44px]"
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
    </div>
  );
}