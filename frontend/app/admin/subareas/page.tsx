"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { notificationService } from "@/lib/notifications";

interface Agent {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  status?: string;
  city_id?: string;
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[];
  status: string;
  slug: string;
  description?: string;
}

interface City {
  id: string;
  name: string;
  admin_id: string | null;
  status: string;
}

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: string;
  city_id?: string;
}

export default function AdminSubareasPage() {
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [adminCity, setAdminCity] = useState<City | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedSubarea, setSelectedSubarea] = useState<Subarea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedAdmin = localStorage.getItem("adminData");
      if (!storedAdmin) return;

      const admin: AdminData = JSON.parse(storedAdmin);
      setAdminData(admin);

      const citiesList = await estateApi.cities.list<City>();
      setCities(citiesList);
      const assignedCity = citiesList.find(city => city.admin_id === admin.id);

      if (assignedCity) {
        setAdminCity(assignedCity);
        const [allSubareas, allAgents] = await Promise.all([
          estateApi.content.subareas.list<Subarea>(),
          estateApi.agents.list<Agent>(),
        ]);

        const citySubareas = allSubareas.filter(s => s.city_id === assignedCity.id);
        const cityAgents = allAgents.filter(a => a.city_id === assignedCity.id);

        setSubareas(citySubareas);
        setAgents(cityAgents);
      } else {
        const [allSubareas, allAgents] = await Promise.all([
          estateApi.content.subareas.list<Subarea>(),
          estateApi.agents.list<Agent>(),
        ]);
        setSubareas(allSubareas);
        setAgents(allAgents);
      }
    } catch (error) {
      console.error("Error loading subareas data:", error);
    }
  };

  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || "Unknown City";
  };

  const getAgentName = (agentId: string): string => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || agent?.email || agentId;
  };

  const getAssignedAgents = (subarea: Subarea): Agent[] => {
    return agents.filter(a => subarea.agent_ids?.includes(a.id));
  };

  const openManageModal = (subarea: Subarea) => {
    setSelectedSubarea(subarea);
    setIsModalOpen(true);
  };

  const toggleAgentAssignment = async (subareaId: string, agentId: string, isAssigned: boolean) => {
    try {
      const payload = isAssigned
        ? { remove_agent: agentId }
        : { add_agent: agentId };

      await estateApi.content.subareas.update(subareaId, payload);

      setSubareas(prev =>
        prev.map(s => {
          if (s.id !== subareaId) return s;
          const currentIds = s.agent_ids || [];
          return {
            ...s,
            agent_ids: isAssigned
              ? currentIds.filter(id => id !== agentId)
              : [...currentIds, agentId],
          };
        })
      );

      const agent = agents.find(a => a.id === agentId);
      const subarea = subareas.find(s => s.id === subareaId);

      if (agent && subarea) {
        await notificationService.addNotification({
          userId: agentId,
          userType: "AGENT",
          title: isAssigned ? "Subarea Removed" : "New Subarea Assigned",
          message: isAssigned
            ? `You are no longer managing ${subarea.name} in ${getCityName(subarea.city_id)}.`
            : `You have been assigned to manage ${subarea.name} in ${getCityName(subarea.city_id)}.`,
          type: "subarea_assigned",
          relatedId: subareaId,
          actionUrl: "/agent/dashboard",
          icon: isAssigned ? "AlertCircle" : "MapPin",
        });
      }
    } catch (error) {
      console.error("Error toggling agent assignment:", error);
      alert("Failed to update assignment");
    }
  };

  const filteredSubareas = subareas.filter(s => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!s.name.toLowerCase().includes(term)) return false;
    }
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const totalSubareas = subareas.length;
  const activeSubareas = subareas.filter(s => s.status === "active").length;
  const assignedSubareas = subareas.filter(s => (s.agent_ids || []).length > 0).length;
  const unassignedSubareas = subareas.filter(s => (s.agent_ids || []).length === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Manage Subareas</h1>
          <p className="text-sm text-estate-text-sec">
            {adminCity ? `Managing subareas for ${adminCity.name}` : "All subareas"}
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition shadow-md"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Subareas</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{totalSubareas}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Active</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">{activeSubareas}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">With Agents</span>
          <span className="text-3xl font-extrabold text-estate-blue block mt-2">{assignedSubareas}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Unassigned</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{unassignedSubareas}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subarea name..."
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Subareas Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Subarea</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Assigned Agents</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {filteredSubareas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-estate-muted">
                    No subareas found
                  </td>
                </tr>
              ) : (
                filteredSubareas.map((subarea) => {
                  const assignedAgents = getAssignedAgents(subarea);
                  const agentCount = (subarea.agent_ids || []).length;
                  return (
                    <tr key={subarea.id} className="hover:bg-estate-bg/40 transition">
                      <td className="py-4 px-4">
                        <div className="font-bold text-estate-text">{subarea.name}</div>
                        <div className="text-xs text-estate-text-sec">{subarea.slug}</div>
                      </td>
                      <td className="py-4 px-4 text-estate-text-sec">
                        {getCityName(subarea.city_id)}
                      </td>
                      <td className="py-4 px-4">
                        {agentCount === 0 ? (
                          <span className="text-xs text-amber-600 font-medium">No agents assigned</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {assignedAgents.map(agent => (
                              <span
                                key={agent.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {agent.name || agent.email}
                              </span>
                            ))}
                            {agentCount > assignedAgents.length && (
                              <span className="text-xs text-estate-muted">
                                +{agentCount - assignedAgents.length} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          subarea.status === "active"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}>
                          {subarea.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openManageModal(subarea)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-estate-navy/30 text-estate-navy hover:bg-estate-navy hover:text-white transition"
                        >
                          Manage Agents ({agentCount})
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted">
          Showing {filteredSubareas.length} of {subareas.length} subareas
        </div>
      </div>

      {/* Manage Agents Modal */}
      {isModalOpen && selectedSubarea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-estate-border">
              <div>
                <h2 className="text-xl font-bold text-estate-navy font-serif">
                  Manage Agents: {selectedSubarea.name}
                </h2>
                <p className="text-sm text-estate-text-sec mt-1">
                  {getCityName(selectedSubarea.city_id)} — {selectedSubarea.slug}
                </p>
                <p className="text-xs text-estate-muted mt-1">
                  {(selectedSubarea.agent_ids || []).length} agent(s) currently assigned
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {agents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-estate-text-sec">No agents available to assign.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agents.map(agent => {
                    const isAssigned = (selectedSubarea.agent_ids || []).includes(agent.id);
                    return (
                      <div
                        key={agent.id}
                        className={`flex justify-between items-center p-3 rounded-xl border transition ${
                          isAssigned
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-estate-navy text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {(agent.name || agent.email || "A").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-estate-navy text-sm">
                              {agent.name || agent.email}
                            </p>
                            <p className="text-xs text-estate-text-sec">
                              {agent.email} {agent.phone && `• ${agent.phone}`}
                            </p>
                            <p className="text-xs">
                              {agent.status === "active" ? (
                                <span className="text-emerald-600 font-medium">Active</span>
                              ) : (
                                <span className="text-amber-600 font-medium">Pending</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAgentAssignment(selectedSubarea.id, agent.id, isAssigned)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                            isAssigned
                              ? "text-rose-600 hover:bg-rose-100 border border-rose-200"
                              : "text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {isAssigned ? "Remove" : "Assign"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
