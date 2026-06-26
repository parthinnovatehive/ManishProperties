"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { notificationService } from "@/lib/notifications";
import { AgentRatingDisplay } from "@/components/ui/AgentRatingDisplay";
import type { Property } from "@/types";

interface Appointment {
  id: string;
  propertyId: string | number;
  propertyName: string;
  userId: string;
  userName: string;
  agentId?: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Scheduled";
  type: "In-Person" | "Video Call";
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[];
  status: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rating: number;
  totalRatings?: number;
  status?: string;
}

interface City {
  id: string;
  name: string;
  admin_id: string | null;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function AdminAppointmentsPage() {
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [adminCity, setAdminCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [subareaAgent, setSubareaAgent] = useState<Agent | null>(null);
  const [selectedSubarea, setSelectedSubarea] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [appointmentsList, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storedAdmin = localStorage.getItem("adminData");
      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin);

        const citiesList = await estateApi.cities.list<City>();
        const assignedCity = citiesList.find(city => city.admin_id === admin.id);
        setAdminCity(assignedCity || null);

        const allProperties = await estateApi.adminProperties.list();
        setProperties(allProperties);

        const allSubareas = await estateApi.content.subareas.list<Subarea>();
        setSubareas(allSubareas);

        const allAgents = await estateApi.agents.list<Agent>();

        const allUsers = await estateApi.users.list<User>();
        setUsers(allUsers);

        // Compute real ratings from users' agentRatings
        const ratingsByEmail = new Map<string, { rating: number; totalRatings: number }>();
        for (const user of allUsers) {
          const ratings = (user as any).agentRatings;
          if (!ratings) continue;
          for (const entry of Object.values(ratings) as any[]) {
            if (!entry?.agentEmail || !entry?.rating) continue;
            const existing = ratingsByEmail.get(entry.agentEmail) || { rating: 0, totalRatings: 0, sum: 0 };
            (existing as any).sum += Number(entry.rating);
            existing.totalRatings += 1;
            existing.rating = Math.round(((existing as any).sum / existing.totalRatings) * 10) / 10;
            ratingsByEmail.set(entry.agentEmail, existing);
          }
        }
        setAgents(allAgents.map((a) => {
          const computed = a.email ? ratingsByEmail.get(a.email) : undefined;
          return { ...a, rating: (computed?.rating ?? Number(a.rating)) || 0, totalRatings: computed?.totalRatings ?? 0 };
        }));

        setCities(citiesList);

        const appointments = await estateApi.appointments.list<Appointment>();

        if (assignedCity) {
          const cityPropertyIds = allProperties
            .filter(p => p.city_id === assignedCity.id)
            .map(p => p.id);

          const filtered = appointments.filter(a => cityPropertyIds.includes(String(a.propertyId)));
          const enriched = filtered.map(a => ({
            ...a,
            userName: getClientName(a.userId)
          }));
          setAppointmentsList(enriched);
        } else {
          const enriched = appointments.map(a => ({
            ...a,
            userName: getClientName(a.userId)
          }));
          setAppointmentsList(enriched);
        }
      } else {
        const appointments = await estateApi.appointments.list<Appointment>();
        const enriched = appointments.map(a => ({
          ...a,
          userName: getClientName(a.userId)
        }));
        setAppointmentsList(enriched);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (userId: string): string => {
  if (!userId) return "Unknown User";
  const user = users.find(u => u.id === userId);
  return user?.name || "Unknown User";
};

  const getClientPhone = (userId: string): string => {
  if (!userId) return "N/A";
  const user = users.find(u => u.id === userId);
  return user?.phone || "N/A";
};

  const openPropertyModal = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    setSelectedProperty(property || null);
    setIsPropertyModalOpen(true);
  };

  const getPropertyImage = (property: Property | null): string => {
    if (!property) return "https://placehold.co/400x300?text=No+Image";
    return property.image ||
      (property.images && property.images[0]) ||
      "https://placehold.co/400x300?text=No+Image";
  };

  const formatPrice = (price: string | number | undefined): string => {
    if (!price) return "Price on request";
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`;
    }
    return price;
  };

  const applyFiltersAndSort = () => {
    let filtered = [...appointmentsList];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
  (a) =>
    a.propertyName.toLowerCase().includes(term) ||
    getClientName(a.userId).toLowerCase().includes(term) ||
    a.agentName.toLowerCase().includes(term)
);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else if (sortBy === "status") {
        const statusOrder = { Pending: 0, Scheduled: 1, Confirmed: 2, Cancelled: 3 };
        const orderA = statusOrder[a.status as keyof typeof statusOrder] || 0;
        const orderB = statusOrder[b.status as keyof typeof statusOrder] || 0;
        return sortOrder === "desc" ? orderB - orderA : orderA - orderB;
      }
      return 0;
    });

    setFilteredAppointments(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  const getPropertySubarea = (propertyId: string): Subarea | undefined => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return undefined;
    return subareas.find(s => s.id === property.sub_area_id);
  };

  const getAgentForSubarea = (subareaId?: string): Agent | undefined => {
    if (!subareaId) return undefined;
    const subarea = subareas.find(s => s.id === subareaId);
    if (!subarea || !subarea.agent_ids || subarea.agent_ids.length === 0) return undefined;
    return agents.find(a => a.id === subarea.agent_ids[0]);
  };

  const getSubareasWithAgents = (): Subarea[] => {
    return subareas.filter(s =>
      s.city_id === adminCity?.id &&
      s.agent_ids &&
      s.agent_ids.length > 0
    );
  };

  const getAgentsForSubarea = (subareaId: string): Agent[] => {
    const subarea = subareas.find(s => s.id === subareaId);
    if (!subarea || !subarea.agent_ids || subarea.agent_ids.length === 0) return [];
    return agents.filter(a => subarea.agent_ids?.includes(a.id));
  };

  const openAssignModal = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedSubarea("");
    setSelectedAgent(null);

    const property = properties.find(p => p.id === String(appointment.propertyId));
    if (property) {
      const preAssignedAgent = getAgentForSubarea(property.sub_area_id);
      setSubareaAgent(preAssignedAgent || null);
    }

    setIsAssignModalOpen(true);
  };

  const handleSubareaChange = (subareaId: string) => {
    setSelectedSubarea(subareaId);
    if (subareaId) {
      const agentsList = getAgentsForSubarea(subareaId);
      setSelectedAgent(agentsList[0] || null);
    } else {
      setSelectedAgent(null);
    }
  };

  const selectSubareaAgent = () => {
    if (subareaAgent) {
      setSelectedAgent(subareaAgent);
      setSelectedSubarea("");
      // Optionally show a success message
      alert("Subarea agent selected. Click Assign Agent to confirm.");
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAppointment || !selectedAgent) {
      alert("Please select an agent");
      return;
    }

    setIsSubmitting(true);
    try {
      await estateApi.appointments.update(selectedAppointment.id, {
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        agentEmail: selectedAgent.email,
        agentPhone: selectedAgent.phone || "N/A",
        status: "Confirmed"
      });

      setAppointmentsList(prev =>
        prev.map(a =>
          a.id === selectedAppointment.id
            ? {
              ...a,
              agentId: selectedAgent.id,
              agentName: selectedAgent.name,
              agentEmail: selectedAgent.email,
              agentPhone: selectedAgent.phone || "N/A",
              status: "Confirmed"
            }
            : a
        )
      );

      // Add notifications after successful assignment
      // Notification for user
      await notificationService.addNotification({
        userId: selectedAppointment.userId,
        userType: "USER",
        title: "Agent Assigned",
        message: `Agent ${selectedAgent.name} has been assigned to your appointment for ${selectedAppointment.propertyName}.`,
        type: "appointment",
        relatedId: selectedAppointment.id,
        actionUrl: "/user/appointments",
        icon: "UserPlus"
      });

      // Notification for agent
      await notificationService.addNotification({
        userId: selectedAgent.id,
        userType: "AGENT",
        title: "New Appointment Assigned",
        message: `You have been assigned an appointment for ${selectedAppointment.propertyName} on ${selectedAppointment.date}.`,
        type: "appointment",
        relatedId: selectedAppointment.id,
        actionUrl: "/agent/appointments",
        icon: "Calendar"
      });

      alert("Agent assigned successfully!");
      setIsAssignModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error assigning agent:", error);
      alert("Failed to assign agent");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const pendingCount = appointmentsList.filter(a => a.status === 'Pending').length;
  const confirmedCount = appointmentsList.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled').length;
  const cancelledCount = appointmentsList.filter(a => a.status === 'Cancelled').length;

  const availableSubareas = getSubareasWithAgents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Appointments Management</h1>
          <p className="text-sm text-estate-text-sec">
            {adminCity ? `Managing appointments for ${adminCity.name} city` : "View and manage property visit appointments"}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition shadow-md"
        >
          Refresh
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Bookings</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{appointmentsList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{pendingCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Confirmed</span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-2">{confirmedCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Cancelled</span>
          <span className="text-3xl font-extrabold text-rose-600 block mt-2">{cancelledCount}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Property, client, agent..."
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>

          <div className="w-[180px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="w-[180px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "status")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="w-[180px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
          >
            Clear Filters
          </button>
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
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-estate-muted">
                    No appointments found
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const property = properties.find(p => p.id === String(apt.propertyId));
                  const subarea = getPropertySubarea(String(apt.propertyId));
                  const preAssignedAgent = getAgentForSubarea(subarea?.id);
                  const needsAgentAssignment = !apt.agentId && apt.status === "Pending";

                  return (
                    <tr key={apt.id} className="hover:bg-estate-bg/40 transition">
                      <td className="py-4 px-4 whitespace-nowrap">
  <div className="font-bold text-estate-text">{getClientName(apt.userId)}</div>
  <div className="text-xs text-estate-muted">{getClientPhone(apt.userId)}</div>
</td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-estate-navy line-clamp-1">{apt.propertyName}</div>
                        {subarea && <div className="text-xs text-estate-muted mt-1">📍 {subarea.name}</div>}
                        <button
                          onClick={() => openPropertyModal(String(apt.propertyId))}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                        >
                          View Property Details
                        </button>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {apt.agentId && apt.agentName && apt.agentName !== "Not Assigned" ? (
                          <div>
                            <div className="text-estate-text font-medium">{apt.agentName}</div>
                            <div className="text-xs text-estate-text-sec">{apt.agentEmail}</div>
                            {apt.agentPhone && <div className="text-xs text-estate-muted mt-0.5">📞 {apt.agentPhone}</div>}
                            <div className="text-xs text-emerald-600 mt-1">✓ Assigned</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-amber-600 text-xs font-semibold">Not Assigned</span>
                            <button
                              onClick={() => openAssignModal(apt)}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                            >
                              Assign Agent
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-estate-text font-medium">{formatDate(apt.date)}</div>
                        <div className="text-xs text-estate-text-sec">{apt.time}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">{apt.type}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          {needsAgentAssignment && (
                            <button
                              onClick={() => openAssignModal(apt)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition"
                            >
                              Assign Agent
                            </button>
                          )}
                          {apt.status !== 'Cancelled' && apt.status !== 'Confirmed' && apt.agentId && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted">
          Showing {filteredAppointments.length} of {appointmentsList.length} appointments
        </div>
      </div>

      {/* Assign Agent Modal */}
      {isAssignModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-estate-navy">Assign Agent</h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Subarea Agent Section */}
              <div>
                <p className="text-sm text-estate-text-sec mb-2">Agent for this Subarea</p>
                {subareaAgent ? (
                  <div
                    className={`cursor-pointer transition-all ${selectedAgent?.id === subareaAgent.id
                        ? 'bg-emerald-100 border-2 border-emerald-600'
                        : 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                      } p-3 rounded-lg`}
                    onClick={() => {
                      setSelectedAgent(subareaAgent);
                      setSelectedSubarea("");
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-emerald-800">{subareaAgent.name}</p>
                        <p className="text-xs text-emerald-700">{subareaAgent.email}</p>
                        <div className="mt-1"><AgentRatingDisplay rating={subareaAgent.rating} totalRatings={subareaAgent.totalRatings} size={12} /></div>
                      </div>
                      {selectedAgent?.id === subareaAgent.id && (
                        <span className="text-emerald-600 text-sm font-semibold">✓ Selected</span>
                      )}
                    </div>
                    {selectedAgent?.id !== subareaAgent.id && (
                      <button
                        className="mt-2 px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgent(subareaAgent);
                          setSelectedSubarea("");
                        }}
                      >
                        Select This Agent
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700">No agent available in this subarea</p>
                  </div>
                )}
              </div>

              {/* Subarea Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">
                  Select Subarea
                </label>
                <select
                  value={selectedSubarea}
                  onChange={(e) => handleSubareaChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
                >
                  <option value="">Select a subarea</option>
                  {availableSubareas.map((subarea) => (
                    <option key={subarea.id} value={subarea.id}>
                      {subarea.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Agent Details */}
              {selectedAgent && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-blue-800">Selected Agent</p>
                    <span className="text-blue-600 text-xs font-semibold">Ready to Assign</span>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-xs text-estate-muted">Name:</span> <span className="text-sm font-medium">{selectedAgent.name}</span></p>
                    <p><span className="text-xs text-estate-muted">Email:</span> <span className="text-sm">{selectedAgent.email}</span></p>
                    <p><span className="text-xs text-estate-muted">Phone:</span> <span className="text-sm">{selectedAgent.phone || "N/A"}</span></p>
                    <p><span className="text-xs text-estate-muted">Rating:</span> <span className="text-sm"><AgentRatingDisplay rating={selectedAgent.rating} totalRatings={selectedAgent.totalRatings} size={14} /></span></p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignAgent}
                  disabled={isSubmitting || !selectedAgent}
                  className="flex-1 py-2 bg-estate-navy text-white font-semibold rounded-xl hover:bg-estate-navy-mid transition disabled:opacity-50"
                >
                  {isSubmitting ? "Assigning..." : "Assign Agent"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {isPropertyModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b border-estate-border">
              <h2 className="text-xl font-bold text-estate-navy font-serif">Property Details</h2>
              <button
                onClick={() => setIsPropertyModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <img
                src={getPropertyImage(selectedProperty)}
                alt={selectedProperty.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=No+Image";
                }}
              />

              <h3 className="text-2xl font-bold text-estate-navy mb-2">{selectedProperty.title}</h3>
              <p className="text-estate-text-sec mb-4">{selectedProperty.location}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-estate-bg rounded-xl mb-6">
                <div>
                  <p className="text-xs text-estate-muted">Price</p>
                  <p className="text-xl font-bold text-estate-navy">{formatPrice(selectedProperty.price)}</p>
                </div>
                {selectedProperty.area && (
                  <div>
                    <p className="text-xs text-estate-muted">Area</p>
                    <p className="text-lg font-semibold">{selectedProperty.area} sq.ft</p>
                  </div>
                )}
                {selectedProperty.type && (
                  <div>
                    <p className="text-xs text-estate-muted">Property Type</p>
                    <p className="text-lg font-semibold">{selectedProperty.type}</p>
                  </div>
                )}
                {selectedProperty.listingType && (
                  <div>
                    <p className="text-xs text-estate-muted">Listing Type</p>
                    <p className="text-lg font-semibold">{selectedProperty.listingType}</p>
                  </div>
                )}
              </div>

              {(selectedProperty.beds || selectedProperty.bathrooms) && (
                <div className="mb-6">
                  <h4 className="font-bold text-estate-navy mb-2">Specifications</h4>
                  <div className="flex gap-6">
                    {selectedProperty.beds && (
                      <div>
                        <p className="text-xs text-estate-muted">Bedrooms</p>
                        <p className="font-semibold">{selectedProperty.beds}</p>
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div>
                        <p className="text-xs text-estate-muted">Bathrooms</p>
                        <p className="font-semibold">{selectedProperty.bathrooms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedProperty.description && (
                <div className="mb-6">
                  <h4 className="font-bold text-estate-navy mb-2">Description</h4>
                  <p className="text-estate-text leading-relaxed">{selectedProperty.description}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => setIsPropertyModalOpen(false)}
                className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6">
            <p className="text-estate-navy">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
