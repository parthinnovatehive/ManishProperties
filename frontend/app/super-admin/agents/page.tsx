"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { AgentRatingDisplay } from "@/components/ui/AgentRatingDisplay";

interface Agent {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  avatar?: string;
  rating: number;
  totalRatings?: number;
  experience?: string;
  status?: "active" | "inactive";
  propertyCount?: number;
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[];
  status: string;
  slug: string;
}

interface City {
  id: string;
  name: string;
  admin_id: string | null;
  status: string;
}

export default function AdminAgentsPage() {
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentSubareas, setAgentSubareas] = useState<Subarea[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSubareas, setIsLoadingSubareas] = useState(false);
  const [availableSubareas, setAvailableSubareas] = useState<Subarea[]>([]);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "propertyCount">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchAgents();
    fetchSubareas();
    fetchCities();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [agentsList, searchTerm, statusFilter, ratingFilter, sortBy, sortOrder]);

  const fetchAgents = () => {
    Promise.all([
      estateApi.agents.list<Agent>(),
      estateApi.adminProperties.list(),
      estateApi.users.list<any>().catch(() => [] as any[]),
    ]).then(([items, allProperties, users]) => {
      setProperties(allProperties);
      const agentRatings = new Map<string, { rating: number; totalRatings: number; sum: number }>();
      for (const user of users) {
        const ratings = (user as any).agentRatings;
        if (!ratings) continue;
        for (const entry of Object.values(ratings) as any[]) {
          if (!entry?.agentEmail || !entry?.rating) continue;
          const existing: { rating: number; totalRatings: number; sum: number } = agentRatings.get(entry.agentEmail) || { rating: 0, totalRatings: 0, sum: 0 };
          existing.sum += Number(entry.rating);
          existing.totalRatings += 1;
          existing.rating = Math.round((existing.sum / existing.totalRatings) * 10) / 10;
          agentRatings.set(entry.agentEmail, existing);
        }
      }
      setAgentsList(items.map((agent) => {
        const computed = agent.email ? agentRatings.get(agent.email) : undefined;
        return {
          ...agent,
          email: agent.email || agent.username || "",
          avatar: agent.avatar || (agent.name || agent.username || "A").slice(0, 2).toUpperCase(),
          rating: (computed?.rating ?? Number(agent.rating)) || 0,
          totalRatings: (computed?.totalRatings ?? Number((agent as any).totalRatings)) || 0,
          experience: agent.experience || "2+ years",
          status: agent.status || "active",
          propertyCount: allProperties.filter(p =>
            p.lister_id === agent.id &&
            p.lister_type === "agent"
          ).length,
        };
      }));
    });
  };

  const fetchSubareas = async () => {
    try {
      const data = await estateApi.content.subareas.list<any>();
      console.log("Subareas loaded:", data);
      console.log("Subareas with agents:", data.filter((s: any) => (s.agent_ids || []).length > 0));
      console.log("Subareas without agents:", data.filter((s: any) => (s.agent_ids || []).length === 0));
      setSubareas(data);
    } catch (error: any) {
      console.error("Error loading subareas from API:", error);
      console.log("Using fallback - no subareas endpoint available");
      setSubareas([]);
    }
  };

  const fetchCities = () => {
    estateApi.cities.list<City>().then((data) => {
      console.log("Cities loaded:", data);
      setCities(data);
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...agentsList];

    // Search filter (name, email, phone)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          (a.phone && a.phone.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter((a) => a.rating >= minRating);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "rating") {
        return sortOrder === "asc"
          ? a.rating - b.rating
          : b.rating - a.rating;
      } else if (sortBy === "propertyCount") {
        return sortOrder === "asc"
          ? (a.propertyCount || 0) - (b.propertyCount || 0)
          : (b.propertyCount || 0) - (a.propertyCount || 0);
      }
      return 0;
    });

    setFilteredAgents(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRatingFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  const viewAgentSubareas = async (agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
    setIsLoadingSubareas(true);
    
    try {
      console.log(`Viewing subareas for agent: ${agent.name} (${agent.id})`);
      console.log("All subareas:", subareas);
      
      const filteredSubareas = subareas.filter(
        (subarea) => subarea.agent_ids?.includes(agent.id)
      );
      
      const available = subareas.filter(
        (subarea) => !subarea.agent_ids || subarea.agent_ids.length === 0
      );
      
      console.log(`Found ${filteredSubareas.length} assigned subareas:`, filteredSubareas);
      console.log(`Found ${available.length} available subareas:`, available);
      
      setAgentSubareas(filteredSubareas);
      setAvailableSubareas(available);
    } catch (error) {
      console.error("Error fetching agent subareas:", error);
      setAgentSubareas([]);
      setAvailableSubareas([]);
    } finally {
      setIsLoadingSubareas(false);
    }
  };

  const assignSubarea = async (subareaId: string, agentId: string) => {
    try {
      console.log(`Assigning subarea ${subareaId} to agent ${agentId}`);
      
      await estateApi.content.subareas.update(subareaId, {
        add_agent: agentId
      });
      
      setSubareas(prev =>
        prev.map(s =>
          s.id === subareaId
            ? { ...s, agent_ids: [...new Set([...(s.agent_ids || []), agentId])] }
            : s
        )
      );
      
      const assignedSubarea = availableSubareas.find(s => s.id === subareaId);
      if (assignedSubarea) {
        setAgentSubareas(prev => [...prev, { ...assignedSubarea, agent_ids: [...new Set([...(assignedSubarea.agent_ids || []), agentId])] }]);
        setAvailableSubareas(prev => prev.filter(s => s.id !== subareaId));
      }
      
      alert("Subarea assigned successfully!");
    } catch (error) {
      console.error("Error assigning subarea:", error);
      alert("Failed to assign subarea. Please make sure the backend endpoint is configured.");
    }
  };

  const unassignSubarea = async (subareaId: string) => {
    try {
      console.log(`Unassigning subarea ${subareaId}`);
      
      const agentId = selectedAgent?.id;
      await estateApi.content.subareas.update(subareaId, {
        remove_agent: agentId
      });
      
      setSubareas(prev =>
        prev.map(s =>
          s.id === subareaId
            ? { ...s, agent_ids: (s.agent_ids || []).filter(id => id !== agentId) }
            : s
        )
      );
      
      const unassignedSubarea = agentSubareas.find(s => s.id === subareaId);
      if (unassignedSubarea) {
        setAvailableSubareas(prev => [...prev, { ...unassignedSubarea, agent_ids: (unassignedSubarea.agent_ids || []).filter(id => id !== agentId) }]);
        setAgentSubareas(prev => prev.filter(s => s.id !== subareaId));
      }
      
      alert("Subarea unassigned successfully!");
    } catch (error) {
      console.error("Error unassigning subarea:", error);
      alert("Failed to unassign subarea");
    }
  };

  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || "Unknown City";
  };

  const toggleStatus = async (id: string) => {
    const agent = agentsList.find((item) => item.id === id);
    const newStatus = agent?.status === "active" ? "inactive" : "active";
    await estateApi.agents.update<Agent>(id, { status: newStatus });
    setAgentsList(prev =>
      prev.map(a => {
        if (a.id === id) {
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  const getAgentSubareaCount = (agentId: string): number => {
    return subareas.filter(s => s.agent_ids?.includes(agentId)).length;
  };

  const activeCount = agentsList.filter(a => a.status === 'active').length;
  const avgRating = agentsList.length ? (agentsList.reduce((acc, curr) => acc + curr.rating, 0) / agentsList.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-estate-navy font-serif">Manage Agents</h1>
          <p className="text-sm text-estate-text-sec">Supervise agent activity, details, and active listings.</p>
        </div>
        <button
          onClick={() => {
            fetchAgents();
            fetchSubareas();
          }}
          className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition shadow-md min-h-[44px]"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Agents</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{agentsList.length}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Active Agents</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">{activeCount}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Average Rating</span>
          <span className="text-3xl font-extrabold text-estate-amber-dark block mt-2">{avgRating} / 5.0</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, email, phone..."
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>

          {/* Status Filter */}
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

          {/* Rating Filter */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Minimum Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Ratings</option>
              <option value="4">4★ & Above</option>
              <option value="3">3★ & Above</option>
              <option value="2">2★ & Above</option>
              <option value="1">1★ & Above</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "rating" | "propertyCount")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="propertyCount">Properties Listed</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="asc">Ascending (A-Z / Low to High)</option>
              <option value="desc">Descending (Z-A / High to Low)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm min-h-[44px]"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== "all" || ratingFilter !== "all") && (
          <div className="mt-4 pt-3 border-t border-estate-border flex flex-wrap gap-2">
            <span className="text-xs text-estate-muted">Active filters:</span>
            {searchTerm && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {ratingFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Rating: {ratingFilter}★ & above
                <button onClick={() => setRatingFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "name") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("name");
                    setSortOrder("asc");
                  }
                }}>
                  Agent {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "propertyCount") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("propertyCount");
                    setSortOrder("desc");
                  }
                }}>
                  Properties Listed {sortBy === "propertyCount" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4">Subareas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-estate-muted">
                    No agents found matching your filters
                    </td>
                 </tr>
              ) : (
                filteredAgents.map((agent) => {
                  const subareaCount = getAgentSubareaCount(agent.id);
                  return (
                    <tr key={agent.id} className="hover:bg-estate-bg/40 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-estate-blue text-white text-xs font-bold rounded-full flex items-center justify-center border border-estate-navy">
                            {agent.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-estate-text">{agent.name}</div>
                            <div className="text-xs text-estate-amber-dark font-medium">{agent.rating} Rating</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-estate-text font-medium">{agent.email}</div>
                        <div className="text-xs text-estate-text-sec">{agent.phone}</div>
                      </td>
                      <td className="py-4 px-4 text-estate-text-sec">
                          <AgentRatingDisplay rating={agent.rating} totalRatings={agent.totalRatings} />
                        </td>
                      <td className="py-4 px-4 font-bold text-estate-navy">{agent.propertyCount ?? '-'}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => viewAgentSubareas(agent)}
                          className="text-estate-navy hover:text-estate-navy-mid font-semibold text-xs underline"
                        >
                          View Subareas ({subareaCount})
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          agent.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => toggleStatus(agent.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition min-h-[44px] ${
                            agent.status === 'active'
                              ? 'bg-estate-red-bg text-estate-red border-estate-red/20 hover:bg-rose-100'
                              : 'bg-estate-success-bg text-estate-success border-estate-success/20 hover:bg-emerald-150'
                          }`}
                        >
                          {agent.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Results Count */}
        <div className="px-4 sm:px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted flex justify-between items-center">
          <span>Showing {filteredAgents.length} of {agentsList.length} agents</span>
          {filteredAgents.length !== agentsList.length && (
            <button onClick={clearFilters} className="text-estate-navy hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Agent Subareas Modal */}
      {isModalOpen && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-5xl mx-4 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-estate-border">
              <div>
                <h2 className="text-xl font-bold text-estate-navy font-serif">
                  Subareas Managed by {selectedAgent.name}
                </h2>
                <p className="text-sm text-estate-text-sec mt-1">
                  Email: {selectedAgent.email} | Phone: {selectedAgent.phone || "Not provided"}
                </p>
                <p className="text-xs text-estate-muted mt-1">
                  Total Assigned Subareas: {agentSubareas.length}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoadingSubareas ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-estate-navy">Loading subareas...</div>
                </div>
              ) : subareas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-estate-text-sec">No subareas data available. Please check the backend configuration.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assigned Subareas */}
                  <div>
                    <h3 className="font-bold text-estate-navy mb-3 flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Assigned Subareas
                      <span className="text-xs text-estate-muted">({agentSubareas.length})</span>
                    </h3>
                    {agentSubareas.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-estate-text-sec text-sm">No subareas assigned</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {agentSubareas.map((subarea) => (
                          <div
                            key={subarea.id}
                            className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-estate-navy">{subarea.name}</p>
                              <p className="text-xs text-estate-muted">{getCityName(subarea.city_id)}</p>
                            </div>
                            <button
                              onClick={() => unassignSubarea(subarea.id)}
                              className="px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Subareas */}
                  <div>
                    <h3 className="font-bold text-estate-navy mb-3 flex items-center gap-2">
                      <span className="text-gray-400">📌</span> Available Subareas
                      <span className="text-xs text-estate-muted">({availableSubareas.length})</span>
                    </h3>
                    {availableSubareas.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-estate-text-sec text-sm">No available subareas</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableSubareas.map((subarea) => (
                          <div
                            key={subarea.id}
                            className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
                          >
                            <div>
                              <p className="font-medium text-estate-navy">{subarea.name}</p>
                              <p className="text-xs text-estate-muted">{getCityName(subarea.city_id)}</p>
                            </div>
                            <button
                              onClick={() => assignSubarea(subarea.id, selectedAgent.id)}
                              className="px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            >
                              Assign
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 sm:p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition min-h-[44px]"
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