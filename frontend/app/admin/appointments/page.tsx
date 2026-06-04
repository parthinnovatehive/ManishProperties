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

export default function AdminAppointmentsPage() {
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);

  useEffect(() => {
    estateApi.appointments.list<Appointment>().then(setAppointmentsList);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    await estateApi.appointments.update<Appointment>(id, { status: newStatus });
    setAppointmentsList(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Global Appointments</h1>
          <p className="text-sm text-estate-text-sec">View scheduled property visits and agent-client mappings.</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Bookings</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{appointmentsList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending</span>
          <span className="text-3xl font-extrabold text-estate-amber-dark block mt-2 font-mono">
            {appointmentsList.filter(a => a.status === 'Pending').length}
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Confirmed / Scheduled</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2 font-mono">
            {appointmentsList.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled').length}
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Cancelled</span>
          <span className="text-3xl font-extrabold text-estate-red block mt-2 font-mono">
            {appointmentsList.filter(a => a.status === 'Cancelled').length}
          </span>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {appointmentsList.map((apt) => (
                <tr key={apt.id} className="hover:bg-estate-bg/40 transition">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-bold text-estate-text">{apt.userName}</div>
                    <div className="text-xs text-estate-muted">{apt.userId}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-estate-navy line-clamp-1">{apt.propertyName}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-estate-text font-medium">{apt.agentName}</div>
                    <div className="text-xs text-estate-text-sec">{apt.agentEmail}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-estate-text font-medium">{apt.date}</div>
                    <div className="text-xs text-estate-text-sec">{apt.time}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">{apt.type}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {apt.status !== 'Cancelled' ? (
                      <div className="flex justify-end space-x-2">
                        {apt.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg transition"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-estate-red border border-estate-red/20 text-xs font-bold rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-estate-muted font-medium">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
