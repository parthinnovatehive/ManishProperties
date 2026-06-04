"use client";

import { useEffect, useState } from "react";
import { AppointmentCard, type Appointment } from "@/components/agent/AppointmentCard";
import { estateApi } from "@/lib/api";
import { Plus, X, Calendar as CalendarIcon, List, Clock, User, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [filterStatus, setFilterStatus] = useState<"All" | "Confirmed" | "Pending" | "Completed">("All");

  // Scheduling states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formState, setFormState] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    propertyName: "Luxury Sea-View 3BHK Apartment",
    date: "2026-06-04",
    time: "10:00 AM",
    type: "Site Visit" as Appointment["type"],
  });

  useEffect(() => {
    estateApi.appointments.list<Appointment>().then(setAppointments);
  }, []);

  // Calendar calculations for June 2026 (June 1st, 2026 is Monday)
  // June has 30 days.
  const daysInJune = 30;
  const startDayOffset = 1; // 1 = Monday (Monday starts at col 1)

  // Status Change Callback
  const handleStatusChange = async (id: string, newStatus: Appointment["status"]) => {
    await estateApi.appointments.update<Appointment>(id, { status: newStatus });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  // Submit Schedule Form
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAppt: Appointment = {
      id: `app-${Date.now()}`,
      clientName: formState.clientName,
      clientEmail: formState.clientEmail,
      clientPhone: formState.clientPhone,
      propertyName: formState.propertyName,
      date: formState.date,
      time: formState.time,
      status: "Pending",
      type: formState.type,
    };

    const created = await estateApi.appointments.create<Appointment>(newAppt);
    setAppointments((prev) => [created, ...prev]);
    setShowAddModal(false);
    setFormState({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      propertyName: "Luxury Sea-View 3BHK Apartment",
      date: "2026-06-04",
      time: "10:00 AM",
      type: "Site Visit",
    });
  };

  // Filters calculation
  const filteredAppointments = appointments.filter((a) => {
    if (filterStatus === "All") return true;
    return a.status === filterStatus;
  });

  // Get appointments for a specific day in June 2026
  const getAppointmentsForDay = (day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const targetDate = `2026-06-${dayStr}`;
    return appointments.filter((a) => a.date === targetDate);
  };

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
            My Appointments
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Track site visits, client consultations, and agreements.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Mode Switcher */}
          <div className="flex border border-estate-border bg-white rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2.5 transition flex items-center gap-1.5 ${
                viewMode === "calendar"
                  ? "bg-estate-blue-pale text-estate-navy font-bold"
                  : "text-estate-text-sec hover:bg-estate-surface/40"
              }`}
              title="Calendar view"
            >
              <CalendarIcon className="w-4.5 h-4.5" />
              <span className="text-xs hidden md:inline">Calendar</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-estate-blue-pale text-estate-navy font-bold"
                  : "text-estate-text-sec hover:bg-estate-surface/40"
              }`}
              title="Grid list view"
            >
              <List className="w-4.5 h-4.5" />
              <span className="text-xs hidden md:inline">List View</span>
            </button>
          </div>

          <Button variant="primary" onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Book Meeting
          </Button>
        </div>
      </div>

      {/* List filters (only relevant for List view) */}
      {viewMode === "list" && (
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-white border border-estate-border/70 rounded-2xl shadow-sm max-w-full scrollbar-none">
          {(["All", "Confirmed", "Pending", "Completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                filterStatus === status
                  ? "bg-estate-navy text-white shadow-sm"
                  : "text-estate-text-sec hover:text-estate-navy hover:bg-estate-surface/40"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* RENDER VIEW: LIST MODE */}
      {viewMode === "list" && (
        <>
          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-estate-border/80 rounded-[20px] p-12 text-center shadow-sm">
              <p className="text-sm font-bold text-estate-muted">No appointments found matching this status.</p>
            </div>
          )}
        </>
      )}

      {/* RENDER VIEW: CALENDAR MODE (Premium Layout) */}
      {viewMode === "calendar" && (
        <div className="bg-white border border-estate-border rounded-[20px] p-6 shadow-estate space-y-6">
          {/* Calendar Header Month Name */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-estate-navy font-serif">June 2026</h2>
            <span className="text-xs font-bold text-estate-navy bg-estate-blue-pale border border-estate-border px-3 py-1.5 rounded-xl">
              Operating Standard Time (IST)
            </span>
          </div>

          {/* Calendar Table Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {/* Days title headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="text-xs font-extrabold text-estate-muted uppercase tracking-wider py-2">
                {dayName}
              </div>
            ))}

            {/* Empty days layout placeholders */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-[16/11] border border-estate-border/40 bg-estate-surface/20 rounded-xl" />
            ))}

            {/* Calendar Numbers list */}
            {Array.from({ length: daysInJune }).map((_, idx) => {
              const day = idx + 1;
              const dailyMeetings = getAppointmentsForDay(day);
              const isToday = day === 3;

              return (
                <div
                  key={`day-${day}`}
                  className={`aspect-[16/12] p-2 border flex flex-col justify-between items-stretch rounded-xl text-left transition ${
                    isToday ? "border-estate-navy bg-estate-blue-pale/40" : "border-estate-border/50 hover:bg-estate-surface/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isToday ? "text-estate-navy font-extrabold underline" : "text-estate-text"}`}>
                      {day}
                    </span>
                    {dailyMeetings.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-estate-navy-light" />
                    )}
                  </div>

                  {/* Meetings indicators */}
                  <div className="mt-1 space-y-0.5 max-h-[70%] overflow-y-auto scrollbar-none">
                    {dailyMeetings.map((appt) => {
                      const statusColor =
                        appt.status === "Confirmed"
                          ? "bg-estate-success"
                          : appt.status === "Pending"
                          ? "bg-estate-amber"
                          : "bg-estate-muted";
                      return (
                        <div
                          key={appt.id}
                          className="text-[9px] font-semibold text-estate-navy truncate bg-estate-surface/80 p-0.5 rounded border border-estate-border/60 flex items-center gap-1 cursor-pointer"
                          title={`${appt.clientName} - ${appt.time}`}
                          onClick={() => {
                            setViewMode("list");
                            setFilterStatus("All");
                          }}
                        >
                          <span className={`w-1 h-1 rounded-full ${statusColor}`} />
                          <span className="truncate">{appt.clientName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING DIALOG MODAL */}
      {showAddModal && (
        <>
          <div
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-x-4 top-16 max-w-xl mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Schedule New Meeting</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-estate-surface rounded-lg transition"
              >
                <X className="w-5 h-5 text-estate-text-sec" />
              </button>
            </div>
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Client Name
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vicky Kaushal"
                    value={formState.clientName}
                    onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Client Email
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vicky@example.com"
                    value={formState.clientEmail}
                    onChange={(e) => setFormState({ ...formState, clientEmail: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Client Phone Number
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 90000 12345"
                    value={formState.clientPhone}
                    onChange={(e) => setFormState({ ...formState, clientPhone: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Select Target Property
                  </span>
                  <select
                    value={formState.propertyName}
                    onChange={(e) => setFormState({ ...formState, propertyName: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white"
                  >
                    <option value="Luxury Sea-View 3BHK Apartment">Luxury Sea-View 3BHK Apartment</option>
                    <option value="Modern 4BHK Independent Villa">Modern 4BHK Independent Villa</option>
                    <option value="Premium 2BHK in Hinjewadi">Premium 2BHK in Hinjewadi</option>
                    <option value="Ultra-Luxury Penthouse DLF Phase 5">Ultra-Luxury Penthouse DLF Phase 5</option>
                    <option value="Elegant 3BHK Gated Residence">Elegant 3BHK Gated Residence</option>
                    <option value="Grade-A Commercial Space BKC">Grade-A Commercial Space BKC</option>
                  </select>
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Meeting Date
                  </span>
                  <input
                    type="date"
                    required
                    value={formState.date}
                    onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Meeting Time
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={formState.time}
                    onChange={(e) => setFormState({ ...formState, time: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Meeting Type
                  </span>
                  <select
                    value={formState.type}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value as Appointment["type"] })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white"
                  >
                    <option value="Site Visit">Site Visit</option>
                    <option value="Online Consultation">Online Consultation</option>
                    <option value="Agreement Review">Agreement Review</option>
                  </select>
                </label>
              </div>

              <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-estate-border text-xs font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition"
                >
                  Cancel
                </button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm Schedule
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
