"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { Plus, X, Calendar as CalendarIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/lib/notifications";
import { getAdminData } from "@/lib/utils/token";

interface Appointment {
  id: string;
  propertyId: string | number;
  propertyName: string;
  userId: string;
  userName: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  agentId?: string;
  agentName: string;
  agentEmail: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Scheduled" | "Completed";
  type: "In-Person" | "Video Call" | "Site Visit" | "Online Consultation" | "Agreement Review";
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (id: string, newStatus: Appointment["status"]) => void;
  properties: any[];
}

function AppointmentCard({ appointment, onStatusChange, properties }: AppointmentCardProps) {
  
  const property = properties?.find(p => String(p.id) === String(appointment.propertyId));
// Use the client fields directly from appointment
  const clientName = appointment.clientName || appointment.userName || "Unknown Client";
  const clientEmail = appointment.clientEmail || "No email provided";
  const clientPhone = appointment.clientPhone || "";

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-4 sm:p-5 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-estate-blue-pale flex items-center justify-center">
            <span className="text-estate-navy font-bold text-lg">
              {clientName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-estate-navy">{clientName}</h3>
            <p className="text-xs text-estate-muted">{clientEmail}</p>
            {clientPhone && <p className="text-xs text-estate-muted">{clientPhone}</p>}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-estate-muted">👤</span>
          <span className="font-medium text-estate-text">{clientName}</span>
        </div>
        {clientEmail && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-estate-muted">✉</span>
            <span className="text-estate-text-sec">{clientEmail}</span>
          </div>
        )}
        {clientPhone && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-estate-muted">📞</span>
            <span className="text-estate-text-sec">{clientPhone}</span>
          </div>
        )}
        <div className="border-t border-estate-border/50 my-2" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-estate-muted">🏠</span>
          <span className="font-medium text-estate-text">{property?.title || appointment.propertyName}</span>
        </div>
        {property?.location && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-estate-muted">📍</span>
            <span className="text-estate-text-sec">{property.location}{property.city ? `, ${property.city}` : ""}</span>
          </div>
        )}
        {property?.price && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-estate-muted">💰</span>
            <span className="text-estate-text-sec font-semibold text-estate-navy">{property.price}</span>
          </div>
        )}
        {property?.type && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-estate-muted">🏗</span>
            <span className="text-estate-text-sec">{property.type}{property.listingType ? ` • ${property.listingType}` : ""}</span>
          </div>
        )}
        {(property?.beds || property?.bathrooms || property?.area) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-estate-muted">📐</span>
            <span className="text-estate-text-sec">
              {property.beds ? `${property.beds} Beds` : ""}
              {property.beds && property.bathrooms ? " • " : ""}
              {property.bathrooms ? `${property.bathrooms} Baths` : ""}
              {(property.beds || property.bathrooms) && property.area ? " • " : ""}
              {property.area ? `${property.area} sq.ft` : ""}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-estate-muted">📅</span>
          <span className="text-estate-text-sec">{formatDate(appointment.date)}</span>
          <span className="text-estate-muted">•</span>
          <span className="text-estate-text-sec">{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-estate-muted">📍</span>
          <span className="text-estate-text-sec">{appointment.type}</span>
        </div>
        {appointment.agentName && appointment.agentName !== "Not Assigned" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-estate-muted">👤</span>
            <span className="text-estate-text-sec">Agent: {appointment.agentName}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-estate-border">
        {appointment.status === "Pending" && (
          <>
            <button
              onClick={() => onStatusChange(appointment.id, "Confirmed")}
              className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition min-h-[44px]"
            >
              Confirm
            </button>
            <button
              onClick={() => onStatusChange(appointment.id, "Cancelled")}
              className="flex-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition min-h-[44px]"
            >
              Cancel
            </button>
          </>
        )}
        {appointment.status === "Confirmed" && (
          <button
            onClick={() => onStatusChange(appointment.id, "Completed")}
            className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition min-h-[44px]"
          >
            Mark Completed
          </button>
        )}
        {(appointment.status === "Completed" || appointment.status === "Cancelled") && (
          <span className="text-xs text-estate-muted text-center w-full py-1.5">
            {appointment.status === "Completed" ? "✓ Meeting Completed" : "✗ Meeting Cancelled"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AgentAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Confirmed" | "Completed" | "Cancelled">("All");

  // Scheduling states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formState, setFormState] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    propertyId: "",
    propertyName: "",
    date: "",
    time: "",
    type: "Site Visit" as Appointment["type"],
  });
  // const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [currentAgent, setCurrentAgent] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  setLoading(true);
  try {
    // Get current agent from localStorage
    let storedUser = localStorage.getItem("userData");
    let currentAgentId = null;

    if (!storedUser) {
      storedUser = localStorage.getItem("adminData");
    }

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      currentAgentId = userData.id;
      setCurrentAgent(userData);
    }

    if (!currentAgentId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    // Fetch all appointments
    let allAppointments: Appointment[] = [];
    try {
      allAppointments = await estateApi.appointments.list<Appointment>();
    } catch (appointmentError) {
      allAppointments = [];
    }

    // Filter appointments for this agent
    const agentAppointments = allAppointments.filter((a) => {
      const appointmentAgentId = a.agentId || (a as any).agent_id;
      return appointmentAgentId === currentAgentId;
    });

    // Fetch user details for each unique user ID
    const uniqueUserIds = [...new Set(agentAppointments.map(a => a.userId).filter(Boolean))];
    const userMap = new Map();
    
    for (const userId of uniqueUserIds) {
      try {
        const user = await estateApi.users.getById(userId);
        userMap.set(userId, user);
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
      }
    }

    // Enrich appointments with user details (no need for separate users state)
    const appointmentsWithUsers = agentAppointments.map((appointment) => {
      const user = userMap.get(appointment.userId);
      if (user) {
        return {
          ...appointment,
          clientName: appointment.clientName || user.name,
          clientEmail: appointment.clientEmail || user.email,
          clientPhone: appointment.clientPhone || user.phone
        };
      }
      return appointment;
    });

    setAppointments(appointmentsWithUsers);

    // Fetch properties for dropdown
    try {
      const allProperties = await estateApi.adminProperties.list();
      setProperties(allProperties);
    } catch (propError) {
      setProperties([]);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};

  const handleStatusChange = async (id: string, newStatus: Appointment["status"]) => {
  try {
    const appointment = appointments.find(a => a.id === id);
    
    await estateApi.appointments.update<Appointment>(id, { status: newStatus });
    
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    // Notification for appointment confirmation
    if (newStatus === "Confirmed" && appointment) {
      if (appointment.userId) {
        await notificationService.addNotification({
          userId: appointment.userId,
          userType: "USER",
          title: "Appointment Confirmed",
          message: `Your appointment for ${appointment.propertyName} on ${appointment.date} has been confirmed.`,
          type: "appointment",
          relatedId: id,
          actionUrl: "/user/appointments",
          icon: "Calendar"
        });
      }
    }

    // Notification for appointment completion
    if (newStatus === "Completed" && appointment) {
      const currentAdmin = getAdminData();
      const clientName = appointment.clientName || appointment.userName || "Client";
      const agentName = appointment.agentName || currentAgent?.name || "Agent";
      const propertyName = appointment.propertyName || "Property";
      
      // 1. Notification for ADMIN
      await notificationService.addNotification({
        userId: currentAdmin?.id || "admin",
        userType: "ADMIN",
        title: "Appointment Completed",
        message: `Agent ${agentName} has completed an appointment for ${propertyName} with ${clientName}.`,
        type: "appointment",
        relatedId: id,
        actionUrl: "/admin/appointments",
        icon: "CheckCircle"
      });
      
      // 2. Notification for USER (Client) - With rating prompt
      if (appointment.userId) {
        await notificationService.addNotification({
          userId: appointment.userId,
          userType: "USER",
          title: "Rate Your Agent",
          message: `Your appointment with ${agentName} for ${propertyName} has been completed. Please rate your experience with the agent.`,
          type: "agent_rating",
          relatedId: id,
          actionUrl: "/user/appointments",
          icon: "Star"
        });
      }
      
      // 3. Notification for AGENT (Self)
      const agentId = appointment.agentId || currentAgent?.id;
      if (agentId) {
        await notificationService.addNotification({
          userId: agentId,
          userType: "AGENT",
          title: "Appointment Completed",
          message: `You have successfully completed the appointment for ${propertyName} with ${clientName}.`,
          type: "appointment",
          relatedId: id,
          actionUrl: "/agent/appointments",
          icon: "CheckCircle"
        });
      }
    }
  } catch (error) {
    console.error("Error updating appointment status:", error);
    alert("Failed to update appointment status");
  }
};

  const handleAddAppointment = async (e: React.FormEvent) => {
  e.preventDefault();

  const storedUser = localStorage.getItem("userData");
  let agentId = null;
  let agentName = "";
  let agentEmail = "";

  if (storedUser) {
    const userData = JSON.parse(storedUser);
    agentId = userData.id;
    agentName = userData.name;
    agentEmail = userData.email;
  }

  const newAppt: any = {
    propertyId: formState.propertyId,
    propertyName: formState.propertyName,
    userId: "temp_user",
    userName: formState.clientName,
    clientName: formState.clientName,
    clientEmail: formState.clientEmail,
    clientPhone: formState.clientPhone,
    agentId: agentId,
    agentName: agentName,
    agentEmail: agentEmail,
    date: formState.date,
    time: formState.time,
    status: "Pending",
    type: formState.type,
  };

  try {
    const created = await estateApi.appointments.create<Appointment>(newAppt);
    setAppointments((prev) => [created, ...prev]);
    
    // Send notification to admin about new appointment request
    const currentAdmin = getAdminData();
    await notificationService.addNotification({
      userId: currentAdmin?.id || "admin",
      userType: "ADMIN",
      title: "New Appointment Request",
      message: `Agent ${agentName} has requested a new appointment for ${formState.propertyName} on ${formState.date}.`,
      type: "appointment",
      relatedId: created.id,
      actionUrl: "/admin/appointments",
      icon: "Calendar"
    });
    
    setShowAddModal(false);
    setFormState({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      propertyId: "",
      propertyName: "",
      date: "",
      time: "",
      type: "Site Visit",
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    alert("Failed to create appointment");
  }
};

  const filteredAppointments = appointments.filter((a) => {
    if (filterStatus === "All") return true;
    return a.status === filterStatus;
  });

  const getAppointmentsForDay = (year: number, month: number, day: number) => {
  // Create a date string in the format that matches your appointment dates
  // Your appointments have dates like "05 Jul 2026"
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[month - 1];
  const dayStr = day.toString().padStart(2, "0");
  const targetDateStr = `${dayStr} ${monthName} ${year}`;
  
  console.log(`Looking for appointments on: ${targetDateStr}`);
  
  return appointments.filter((a) => {
    // Compare the date string directly
    const isMatch = a.date === targetDateStr;
    if (isMatch) {
      console.log(`Found appointment: ${a.id} on ${a.date}`);
    }
    return isMatch;
  });
};

  // Calendar calculations
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const currentYear = currentMonth.getFullYear();
  const currentMonthNum = currentMonth.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthNum - 1, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthNum - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthNum, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const confirmedCount = appointments.filter(a => a.status === "Confirmed" || a.status === "Scheduled").length;
  const completedCount = appointments.filter(a => a.status === "Completed").length;

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-estate-navy tracking-tight font-serif">
            My Appointments
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Track site visits, client consultations, and agreements.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-estate-border bg-white rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2.5 transition flex items-center gap-1.5 min-h-[44px] ${viewMode === "calendar" ? "bg-estate-blue-pale text-estate-navy font-bold" : "text-estate-text-sec hover:bg-estate-surface/40"}`}
            >
              <CalendarIcon className="w-4.5 h-4.5" />
              <span className="text-xs hidden md:inline">Calendar</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition flex items-center gap-1.5 min-h-[44px] ${viewMode === "list" ? "bg-estate-blue-pale text-estate-navy font-bold" : "text-estate-text-sec hover:bg-estate-surface/40"}`}
            >
              <List className="w-4.5 h-4.5" />
              <span className="text-xs hidden md:inline">List View</span>
            </button>
          </div>

          <Button variant="primary" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" /> Book Meeting
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Appointments</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{appointments.length}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Confirmed</span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-2">{confirmedCount}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Completed</span>
          <span className="text-3xl font-extrabold text-purple-600 block mt-2">{completedCount}</span>
        </div>
      </div>

      {/* Filters for List View */}
      {viewMode === "list" && (
        <div className="flex flex-wrap items-center gap-2 p-1 bg-white border border-estate-border/70 rounded-2xl shadow-sm">
          {(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition min-h-[44px] ${filterStatus === status ? "bg-estate-navy text-white shadow-sm" : "text-estate-text-sec hover:text-estate-navy hover:bg-estate-surface/40"}`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <>
          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appt) => (
                <AppointmentCard
  key={appt.id}
  appointment={appt}
  onStatusChange={handleStatusChange}
  properties={properties}
/>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-estate-border/80 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-sm font-bold text-estate-muted">No appointments found matching this status.</p>
            </div>
          )}
        </>
      )}

      {/* CALENDAR VIEW */}
{viewMode === "calendar" && (
  <div className="bg-white border border-estate-border rounded-2xl p-4 lg:p-6 shadow-estate space-y-4 lg:space-y-6 lg:max-w-4xl xl:max-w-3xl mx-auto">
    {/* Calendar Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            const newDate = new Date(currentYear, currentMonthNum - 2, 1);
            setCurrentMonth(newDate);
          }} 
          className="p-2 hover:bg-estate-surface rounded-lg transition"
        >
          ←
        </button>
        <h2 className="text-xl font-extrabold text-estate-navy font-serif">
          {monthNames[currentMonthNum - 1]} {currentYear}
        </h2>
        <button 
          onClick={() => {
            const newDate = new Date(currentYear, currentMonthNum, 1);
            setCurrentMonth(newDate);
          }} 
          className="p-2 hover:bg-estate-surface rounded-lg transition"
        >
          →
        </button>
        <button 
          onClick={() => setCurrentMonth(new Date())} 
          className="px-3 py-1 text-xs bg-estate-navy/10 text-estate-navy rounded-lg hover:bg-estate-navy/20 transition min-h-[44px]"
        >
          Today
        </button>
      </div>
    </div>

    {/* Calendar Grid */}
    <div className="grid grid-cols-7 gap-1.5 lg:gap-2 text-center">
      {dayNames.map((dayName) => (
        <div key={dayName} className="text-[10px] lg:text-xs font-extrabold text-estate-muted uppercase tracking-wider py-1.5 lg:py-2">
          {dayName}
        </div>
      ))}

      {/* Empty days at start */}
      {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
        <div key={`empty-${idx}`} className="aspect-square border border-estate-border/40 bg-estate-surface/20 rounded-xl" />
      ))}

      {/* Calendar Days */}
      {Array.from({ length: daysInMonth }).map((_, idx) => {
        const day = idx + 1;
        const dailyMeetings = getAppointmentsForDay(currentYear, currentMonthNum, day);
        const isToday = currentYear === new Date().getFullYear() && 
                        currentMonthNum === new Date().getMonth() + 1 && 
                        day === new Date().getDate();

        return (
          <div
            key={`day-${day}`}
            className={`aspect-square p-1.5 lg:p-2 border flex flex-col rounded-lg lg:rounded-xl transition ${
              isToday ? "border-estate-navy bg-estate-blue-pale/40" : "border-estate-border/50 hover:bg-estate-surface/30"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-[11px] lg:text-sm font-semibold ${isToday ? "text-estate-navy font-extrabold" : "text-estate-text"}`}>
                {day}
              </span>
              {dailyMeetings.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </div>

            {/* Meetings indicators */}
            <div className="mt-1 space-y-1 overflow-y-auto max-h-[80%]">
              {dailyMeetings.slice(0, 3).map((appt) => {
                const displayName = appt.clientName || appt.userName || "Unknown";
                const statusColor = 
                  appt.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" :
                  appt.status === "Pending" ? "bg-amber-100 text-amber-800" :
                  "bg-gray-100 text-gray-600";
                return (
                  <div
                    key={appt.id}
                    className={`text-[10px] font-semibold truncate p-1 rounded ${statusColor} cursor-pointer hover:opacity-80`}
                    title={`${displayName} - ${appt.time} (${appt.status})`}
                    onClick={() => setViewMode("list")}
                  >
                    {displayName}
                  </div>
                );
              })}
              {dailyMeetings.length > 3 && (
                <div className="text-[10px] text-estate-muted text-center">
                  +{dailyMeetings.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <>
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" />
          <div className="fixed inset-0 sm:inset-x-4 sm:top-16 sm:max-w-xl sm:mx-auto bg-white z-50 sm:rounded-2xl rounded-t-3xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up flex flex-col">
            <div className="p-4 sm:p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Schedule New Meeting</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-estate-surface rounded-lg transition"><X className="w-5 h-5 text-estate-text-sec" /></button>
            </div>
            <form onSubmit={handleAddAppointment} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">Client Name *</span>
                  <input type="text" required placeholder="e.g., Vicky Kaushal" value={formState.clientName} onChange={(e) => setFormState({ ...formState, clientName: e.target.value })} className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50" />
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">Client Email *</span>
                  <input type="email" required placeholder="e.g., vicky@example.com" value={formState.clientEmail} onChange={(e) => setFormState({ ...formState, clientEmail: e.target.value })} className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50" />
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">Client Phone *</span>
                  <input type="text" required placeholder="e.g., +91 90000 12345" value={formState.clientPhone} onChange={(e) => setFormState({ ...formState, clientPhone: e.target.value })} className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50" />
                </label>
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">Select Property *</span>
                  <select required value={formState.propertyId} onChange={(e) => { const selectedProperty = properties.find(p => p.id === e.target.value); setFormState({ ...formState, propertyId: e.target.value, propertyName: selectedProperty?.title || "" }); }} className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white">
                    <option value="">Select a property</option>
                    {properties.map((prop) => (<option key={prop.id} value={prop.id}>{prop.title} - {prop.city}, {prop.location}</option>))}
                  </select>
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">Meeting Date *</span>
                  <input type="date" required value={formState.date} onChange={(e) => setFormState({ ...formState, date: e.target.value })} className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white" />
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">Meeting Time *</span>
                  <input type="time" required value={formState.time} onChange={(e) => setFormState({ ...formState, time: e.target.value })} className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white" />
                </label>
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">Meeting Type *</span>
                  <select required value={formState.type} onChange={(e) => setFormState({ ...formState, type: e.target.value as Appointment["type"] })} className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white">
                    <option value="Site Visit">Site Visit</option>
                    <option value="Online Consultation">Online Consultation</option>
                    <option value="Agreement Review">Agreement Review</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Video Call">Video Call</option>
                  </select>
                </label>
              </div>
              <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 border border-estate-border text-sm font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition min-h-[44px]">Cancel</button>
                <Button variant="primary" size="sm" type="submit" className="min-h-[44px]">Confirm Schedule</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}