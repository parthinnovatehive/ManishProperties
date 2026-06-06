"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";

interface Appointment {
  id: string;
  propertyId: string | number;
  propertyName: string;
  userId: string;
  userName: string;
  agentName: string;
  agentEmail: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Scheduled";
  type: "In-Person" | "Video Call";
}

export default function UserAppointmentsPage() {
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);

  useEffect(() => {
    estateApi.appointments.myList<Appointment>().then(setAppointmentsList);
  }, []);

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      await estateApi.appointments.update<Appointment>(id, { status: "Cancelled" });
      setAppointmentsList(prev =>
        prev.map(apt => (apt.id === id ? { ...apt, status: "Cancelled" as const } : apt))
      );
    }
  };

  const getStatusStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Appointments</h1>
          <p className="text-sm text-estate-text-sec">Track and schedule property viewings with agents.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        {appointmentsList.length === 0 ? (
          <div className="p-12 text-center text-estate-muted">
            You don't have any appointments scheduled.
          </div>
        ) : (
          <div className="divide-y divide-estate-border">
            {appointmentsList.map((apt) => (
              <div key={apt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-estate-bg/50 transition">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-lg text-estate-text">{apt.propertyName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-6 text-sm text-estate-text-sec">
                    <div>
                      <span className="font-medium text-estate-text">Date:</span> {apt.date}
                    </div>
                    <div>
                      <span className="font-medium text-estate-text">Time:</span> {apt.time}
                    </div>
                    <div>
                      <span className="font-medium text-estate-text">Agent:</span> {apt.agentName}
                    </div>
                  </div>

                  <div className="text-xs text-estate-muted">
                    Type: <span className="font-semibold text-estate-text-sec">{apt.type}</span>
                  </div>
                </div>

                {apt.status !== 'Cancelled' && (
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                      onClick={() => alert(`Contacting Agent ${apt.agentName} via phone: +91 98765 43210`)}
                      className="px-4 py-2 bg-estate-navy text-white text-sm font-semibold rounded-xl hover:bg-estate-navy-mid transition shadow-sm"
                    >
                      Call Agent
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-4 py-2 bg-white hover:bg-estate-red-bg text-estate-red border border-estate-red/30 text-sm font-semibold rounded-xl transition"
                    >
                      Cancel Visit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
