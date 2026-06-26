"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { notificationService } from "@/lib/notifications";
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
  status?: string;
  city_id?: string;
  sub_area_ids?: string[];
  propertyCount?: number;
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[]; // ✅ Changed from agent_id to agent_ids (array of agent IDs)
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

export default function AdminAgentsPage() {
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentSubareas, setAgentSubareas] = useState<Subarea[]>([]);
  const [requestedSubareas, setRequestedSubareas] = useState<Subarea[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSubareas, setIsLoadingSubareas] = useState(false);
  const [availableSubareas, setAvailableSubareas] = useState<Subarea[]>([]);
  const [adminCity, setAdminCity] = useState<City | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<"assigned" | "requested">("assigned");
  const [properties, setProperties] = useState<any[]>([]);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "propertyCount">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    getAdminData();
  }, []);

  const getAdminData = async () => {
    try {
      // Get current admin from localStorage
      const storedAdmin = localStorage.getItem("adminData");
      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin);
        setAdminData(admin);

        // Fetch cities to find which city this admin manages
        const citiesList = await estateApi.cities.list<City>();
        const assignedCity = citiesList.find(city => city.admin_id === admin.id);
        setAdminCity(assignedCity || null);

        if (assignedCity) {
          // Fetch data only for the assigned city
          await Promise.all([
            fetchAgentsForCity(assignedCity.id),
            fetchSubareasForCity(assignedCity.id),
          ]);
        }
      }
      fetchCities();
    } catch (error) {
      console.error("Error getting admin data:", error);
    }
  };

  const fetchAgentsForCity = async (cityId: string) => {
    try {
      const [allAgents, allProperties, users] = await Promise.all([
        estateApi.agents.list<Agent>(),
        estateApi.adminProperties.list(),
        estateApi.users.list<any>().catch(() => [] as any[]),
      ]);

      setProperties(allProperties);

      const agentRatings = new Map<string, { rating: number; totalRatings: number }>();
      for (const user of users) {
        const ratings = (user as any).agentRatings;
        if (!ratings) continue;
        for (const entry of Object.values(ratings) as any[]) {
          if (!entry?.agentEmail || !entry?.rating) continue;
          const existing = agentRatings.get(entry.agentEmail) || { rating: 0, totalRatings: 0, sum: 0 };
          (existing as any).sum += Number(entry.rating);
          existing.totalRatings += 1;
          existing.rating = Math.round(((existing as any).sum / existing.totalRatings) * 10) / 10;
          agentRatings.set(entry.agentEmail, existing);
        }
      }

      const cityAgents = allAgents.filter(agent => agent.city_id === cityId);

      setAgentsList(cityAgents.map((agent) => {
        const computed = agent.email ? agentRatings.get(agent.email) : undefined;
        return {
          ...agent,
          email: agent.email || agent.username || "",
          avatar: agent.avatar || (agent.name || agent.username || "A").slice(0, 2).toUpperCase(),
          rating: (computed?.rating ?? Number(agent.rating)) || 0,
          totalRatings: (computed?.totalRatings ?? Number((agent as any).totalRatings)) || 0,
          experience: agent.experience || "2+ years",
          status: agent.status?.toLowerCase() || "pending",
          city_id: agent.city_id,
          sub_area_ids: agent.sub_area_ids || [],
          propertyCount: allProperties.filter(p =>
            p.lister_id === agent.id &&
            p.lister_type === "agent"
          ).length,
        };
      }));
    } catch (error) {
      console.error("Error fetching agents for city:", error);
      setAgentsList([]);
    }
  };

  const fetchSubareasForCity = async (cityId: string) => {
    try {
      const allSubareas = await estateApi.content.subareas.list();
      const citySubareas = allSubareas.filter(s => s.city_id === cityId);
      setSubareas(citySubareas);
    } catch (error) {
      console.error("Error fetching subareas for city:", error);
      setSubareas([]);
    }
  };

  const fetchCities = () => {
    estateApi.cities.list<City>().then((data) => {
      console.log("Cities loaded:", data);
      setCities(data);
    });
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [agentsList, searchTerm, statusFilter, ratingFilter, sortBy, sortOrder]);

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
    setActiveTab("assigned");

    try {
      console.log(`🔍 Viewing subareas for agent: ${agent.name} (${agent.id})`);

      // ✅ Get fresh subareas data
      let currentSubareas = subareas;

      // If subareas is empty or stale, fetch fresh data
      if (currentSubareas.length === 0 && adminCity) {
        const freshSubareas = await estateApi.content.subareas.list();
        const citySubareas = freshSubareas.filter(s => s.city_id === adminCity.id);
        setSubareas(citySubareas);
        currentSubareas = citySubareas;
      }

      // ✅ Get assigned subareas (where agent_id is in subarea.agent_ids array)
      const filteredSubareas = currentSubareas.filter(
        (subarea) => subarea.agent_ids?.includes(agent.id)
      );

      // ✅ Get requested subareas (from agent's sub_area_ids array)
      const requested = currentSubareas.filter(
        (subarea) => agent.sub_area_ids?.includes(subarea.id)
      );

      // ✅ Available subareas (not assigned to this agent and not requested)
      const available = currentSubareas.filter(
        (subarea) => !subarea.agent_ids?.includes(agent.id) && !agent.sub_area_ids?.includes(subarea.id)
      );

      console.log(`✅ Found ${filteredSubareas.length} assigned subareas`);
      console.log(`✅ Found ${requested.length} requested subareas`);
      console.log(`✅ Found ${available.length} available subareas`);

      setAgentSubareas(filteredSubareas);
      setRequestedSubareas(requested);
      setAvailableSubareas(available);
    } catch (error) {
      console.error("❌ Error fetching agent subareas:", error);
      setAgentSubareas([]);
      setRequestedSubareas([]);
      setAvailableSubareas([]);
    } finally {
      setIsLoadingSubareas(false);
    }
  };

  const assignSubarea = async (subareaId: string, agentId: string) => {
    try {
      console.log(`🔍 Assigning subarea ${subareaId} to agent ${agentId}`);

      // Get subarea and agent details
      const subarea = subareas.find(s => s.id === subareaId);
      const agent = agentsList.find(a => a.id === agentId);

      if (!subarea) {
        alert("Subarea not found. Please refresh and try again.");
        return;
      }

      // ✅ API call to assign subarea (add agent to agent_ids)
      const payload = { add_agent: agentId };
      await estateApi.content.subareas.update(subareaId, payload);
      console.log(`✅ Subarea ${subareaId} assigned successfully`);

      // ✅ Update all three lists simultaneously
      // 1. Update subareas (global state) - add agent to agent_ids array
      setSubareas(prev =>
        prev.map(s =>
          s.id === subareaId
            ? { ...s, agent_ids: [...new Set([...(s.agent_ids || []), agentId])] }
            : s
        )
      );

      // 2. Remove from Requested
      setRequestedSubareas(prev => prev.filter(s => s.id !== subareaId));

      // 3. Add to Assigned
      const assignedSubarea = { ...subarea, agent_ids: [...new Set([...(subarea.agent_ids || []), agentId])] };
      setAgentSubareas(prev => {
        if (prev.some(s => s.id === subareaId)) {
          return prev;
        }
        return [...prev, assignedSubarea];
      });

      // 4. Remove from Available (if it was there)
      setAvailableSubareas(prev => prev.filter(s => s.id !== subareaId));

      // ✅ Update agent's sub_area_ids (remove this subarea from requested list)
      // ❌ DO NOT change status here - let admin use "Approve & Assign All" for activation
      setAgentsList(prev =>
        prev.map(a => {
          if (a.id === agentId) {
            // Remove this subarea ID from the agent's requested list
            const updatedSubareaIds = (a.sub_area_ids || []).filter(id => id !== subareaId);
            return {
              ...a,
              sub_area_ids: updatedSubareaIds
              // ❌ Keep status unchanged - don't auto-activate
            };
          }
          return a;
        })
      );

      // ✅ Update agent in backend (remove subarea from requested list)
      if (agent) {
        const remainingRequests = (agent.sub_area_ids || []).filter(id => id !== subareaId);
        await estateApi.agents.update(agentId, {
          sub_area_ids: remainingRequests
          // ❌ Keep status unchanged in backend too
        });
      }

      // ✅ Send notification
      if (agent && subarea) {
        try {
          await notificationService.addNotification({
            userId: agentId,
            userType: "AGENT",
            title: "New Subarea Assigned",
            message: `You have been assigned to manage ${subarea.name} in ${getCityName(subarea.city_id)}.`,
            type: "subarea_assigned",
            relatedId: subareaId,
            actionUrl: "/agent/dashboard",
            icon: "MapPin"
          });
        } catch (notifError) {
          console.warn("Failed to send notification:", notifError);
        }
      }

     // ✅ Check if all requested subareas are assigned
const remainingRequests = (agent?.sub_area_ids || []).filter(id => id !== subareaId);
if (remainingRequests.length === 0 && agent?.status === "pending") {
  alert("✅ All requested subareas assigned! You can now approve this agent.");
} else {
  alert(`✅ Subarea assigned successfully! ${remainingRequests.length} subarea(s) remaining to assign.`);
}

      // ✅ Refresh data
      if (adminCity) {
        await Promise.all([
          fetchAgentsForCity(adminCity.id),
          fetchSubareasForCity(adminCity.id),
        ]);
      }

      // ✅ Refresh modal data
      if (selectedAgent) {
        await viewAgentSubareas(selectedAgent);
      }

    } catch (error: any) {
      console.error("❌ Error assigning subarea:", error);

      let errorMessage = "Failed to assign subarea. ";
      if (error?.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }
      alert(errorMessage);
    }
  }; // ← THIS CLOSING BRACE AND SEMICOLON IS CRITICAL!

  const unassignSubarea = async (subareaId: string) => {
    try {
      console.log(`Unassigning subarea ${subareaId}`);

      // Get subarea and agent details
      const subarea = subareas.find(s => s.id === subareaId);
      const agentId = selectedAgent?.id;
      const agent = agentsList.find(a => a.id === agentId);

      if (!agentId) {
        alert("No agent selected.");
        return;
      }

      await estateApi.content.subareas.update(subareaId, {
        remove_agent: agentId
      });

      // Update subarea state: remove agent from agent_ids
      setSubareas(prev =>
        prev.map(s =>
          s.id === subareaId
            ? { ...s, agent_ids: (s.agent_ids || []).filter(id => id !== agentId) }
            : s
        )
      );

      const unassignedSubarea = agentSubareas.find(s => s.id === subareaId);
      if (unassignedSubarea) {
        const updatedIds = (unassignedSubarea.agent_ids || []).filter(id => id !== agentId);
        setAvailableSubareas(prev => [...prev, { ...unassignedSubarea, agent_ids: updatedIds }]);
        setAgentSubareas(prev => prev.filter(s => s.id !== subareaId));
      }

      // Send notification to the agent
      if (agent && subarea) {
        await notificationService.addNotification({
          userId: agent.id,
          userType: "AGENT",
          title: "Subarea Removed",
          message: `You are no longer managing ${subarea.name} in ${getCityName(subarea.city_id)}.`,
          type: "subarea_assigned",
          relatedId: subareaId,
          actionUrl: "/agent/dashboard",
          icon: "AlertCircle"
        });
      }

      alert("Subarea unassigned successfully!");

      if (adminCity) {
        await fetchAgentsForCity(adminCity.id);
      }
    } catch (error) {
      console.error("Error unassigning subarea:", error);
      alert("Failed to unassign subarea");
    }
  };

  const approveAgentWithSubareas = async (agentId: string) => {
    const agent = agentsList.find((item) => item.id === agentId);
    if (!agent) return;

    try {
      // First, assign all requested subareas to the agent
      const requestedSubareaIds = agent.sub_area_ids || [];

      if (requestedSubareaIds.length === 0) {
        // If no subareas requested, just approve the agent
        await estateApi.agents.update<Agent>(agentId, { status: "active" });

        setAgentsList(prev =>
          prev.map(a => {
            if (a.id === agentId) {
              return { ...a, status: "active" };
            }
            return a;
          })
        );

        await notificationService.addNotification({
          userId: agentId,
          userType: "AGENT",
          title: "Account Approved! 🎉",
          message: `Congratulations! Your agent account has been approved. You can now access all agent features.`,
          type: "account_update",
          relatedId: agentId,
          actionUrl: "/agent/dashboard",
          icon: "CheckCircle"
        });

        alert("Agent approved successfully!");

        // Refresh data
        if (adminCity) {
          await Promise.all([
            fetchAgentsForCity(adminCity.id),
            fetchSubareasForCity(adminCity.id),
          ]);
        }

        setIsModalOpen(false);
        return;
      }

      // Assign each requested subarea
      let assignedCount = 0;
      for (const subareaId of requestedSubareaIds) {
        try {
          await estateApi.content.subareas.update(subareaId, {
            add_agent: agentId
          });
          assignedCount++;
        } catch (subareaError) {
          console.error(`Failed to assign subarea ${subareaId}:`, subareaError);
          // Continue with other subareas even if one fails
        }
      }

      // Then update agent status to active AND clear sub_area_ids
      await estateApi.agents.update<Agent>(agentId, {
        status: "active",
        sub_area_ids: [] // ✅ Clear the requested list after approval
      });

      // Update local state
      setAgentsList(prev =>
        prev.map(a => {
          if (a.id === agentId) {
            return { ...a, status: "active", sub_area_ids: [] };
          }
          return a;
        })
      );

      // Send notification to the agent
      await notificationService.addNotification({
        userId: agentId,
        userType: "AGENT",
        title: "Account Approved! 🎉",
        message: `Congratulations! Your agent account has been approved and you have been assigned to ${assignedCount} subarea(s). You can now access all agent features.`,
        type: "account_update",
        relatedId: agentId,
        actionUrl: "/agent/dashboard",
        icon: "CheckCircle"
      });

      alert(`Agent approved and ${assignedCount} subarea(s) assigned successfully!`);

      // Refresh data
      if (adminCity) {
        await Promise.all([
          fetchAgentsForCity(adminCity.id),
          fetchSubareasForCity(adminCity.id),
        ]);
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error approving agent:", error);

      let errorMessage = "Failed to approve agent. ";
      if (error?.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }
      alert(errorMessage);
    }
  }; // ← THIS CLOSING BRACE AND SEMICOLON IS MISSING!

  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || "Unknown City";
  };

  // Updated toggleStatus function with approval support
  const toggleStatus = async (id: string) => {
    const agent = agentsList.find((item) => item.id === id);
    if (!agent) return;

    let newStatus: string;
    let statusMessage: string;

    if (agent.status === "pending") {
      // ✅ Use approveAgentWithSubareas for pending agents
      await approveAgentWithSubareas(id);
      return;
    } else if (agent.status === "active") {
      newStatus = "inactive";
      statusMessage = "suspended";
    } else {
      newStatus = "active";
      statusMessage = "activated";
    }

    try {
      await estateApi.agents.update<Agent>(id, { status: newStatus });

      setAgentsList(prev =>
        prev.map(a => {
          if (a.id === id) {
            return { ...a, status: newStatus };
          }
          return a;
        })
      );

      await notificationService.addNotification({
        userId: id,
        userType: "AGENT",
        title: newStatus === "active" ? "Account Activated" : "Account Suspended",
        message: `Your agent account has been ${statusMessage} by the administrator.`,
        type: "account_update",
        relatedId: id,
        actionUrl: "/agent/dashboard",
        icon: newStatus === "active" ? "CheckCircle" : "AlertCircle"
      });

      // ✅ Refresh the modal if it's open
      if (isModalOpen && selectedAgent && selectedAgent.id === id) {
        await viewAgentSubareas(selectedAgent);
      }

    } catch (error) {
      console.error("Error updating agent status:", error);
      alert("Failed to update agent status. Please try again.");
    }
  };

  const getAgentSubareaCount = (agentId: string): number => {
    return subareas.filter(s => s.agent_ids?.includes(agentId)).length;
  };

  const getAgentRequestedSubareaCount = (agent: Agent): number => {
    return agent.sub_area_ids?.length || 0;
  };

  const activeCount = agentsList.filter(a => a.status === 'active').length;
  const pendingCount = agentsList.filter(a => a.status === 'pending').length;
  const avgRating = agentsList.length ? (agentsList.reduce((acc, curr) => acc + curr.rating, 0) / agentsList.length).toFixed(1) : "0.0";

  // Add this function to debug agent data
  const debugAgentData = async () => {
    try {
      const allAgents = await estateApi.agents.list<Agent>();
      console.log("=== 🔍 DEBUG: All Agents Data ===");
      console.log(JSON.stringify(allAgents, null, 2));

      let totalWithSubareas = 0;
      allAgents.forEach(agent => {
        const hasSubareas = agent.sub_area_ids && agent.sub_area_ids.length > 0;
        if (hasSubareas) totalWithSubareas++;

        console.log(`📋 Agent: ${agent.name} (${agent.id})`);
        console.log(`  Status: ${agent.status}`);
        console.log(`  City: ${agent.city_id}`);
        console.log(`  sub_area_ids:`, agent.sub_area_ids);
        console.log(`  Has subareas: ${hasSubareas ? '✅ YES' : '❌ NO'}`);
        console.log('---');
      });

      alert(`✅ Total Agents: ${allAgents.length}\n✅ Agents with subareas: ${totalWithSubareas}\n✅ Pending agents: ${allAgents.filter(a => a.status === 'pending').length}\n\nCheck console for full details!`);
    } catch (error) {
      console.error("❌ Debug error:", error);
      alert("Error debugging. Check console.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Manage Agents</h1>
          <p className="text-sm text-estate-text-sec">
            {adminCity ? `Managing agents for ${adminCity.name} city` : "Loading city information..."}
          </p>
        </div>
        <button
          onClick={() => {
            if (adminCity) {
              fetchAgentsForCity(adminCity.id);
              fetchSubareasForCity(adminCity.id);
            }
          }}
          className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition shadow-md"
        >
          Refresh
        </button>
       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Agents</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{agentsList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Active Agents</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">{activeCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending Approval</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{pendingCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Average Rating</span>
          <span className="text-3xl font-extrabold text-estate-amber-dark block mt-2">{avgRating} / 5.0</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <option value="pending">Pending</option>
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
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
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
                  const requestedCount = getAgentRequestedSubareaCount(agent);
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
                      <td className="py-4 px-4 font-bold text-estate-navy">{agent.propertyCount || 0}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => viewAgentSubareas(agent)}
                          className="text-estate-navy hover:text-estate-navy-mid font-semibold text-xs underline"
                        >
                          View Subareas ({subareaCount})
                          {agent.status === "pending" && requestedCount > 0 && (
                            <span className="ml-1 text-amber-600">+{requestedCount} requested</span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${agent.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : agent.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {agent.status === 'pending' ? (
                          <button
                            onClick={() => toggleStatus(agent.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            Approve Agent
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(agent.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${agent.status === 'active'
                              ? 'bg-estate-red-bg text-estate-red border-estate-red/20 hover:bg-rose-100'
                              : 'bg-estate-success-bg text-estate-success border-estate-success/20 hover:bg-emerald-150'
                              }`}
                          >
                            {agent.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Results Count */}
        <div className="px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted flex justify-between items-center">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-5xl mx-4 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-estate-border">
              <div>
                <h2 className="text-xl font-bold text-estate-navy font-serif">
                  Subareas for {selectedAgent.name}
                </h2>
                <p className="text-sm text-estate-text-sec mt-1">
                  Email: {selectedAgent.email} | Phone: {selectedAgent.phone || "Not provided"}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-estate-muted">
                    Status: {selectedAgent.status === "pending" ? (
                      <span className="text-amber-600 font-medium">⏳ Pending Approval</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">✓ Active</span>
                    )}
                  </p>
                  {requestedSubareas.length > 0 && (
                    <p className="text-xs text-amber-600 font-medium">
                      • {requestedSubareas.length} subarea(s) requested
                    </p>
                  )}
                  {agentSubareas.length > 0 && (
                    <p className="text-xs text-emerald-600 font-medium">
                      • {agentSubareas.length} assigned
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 flex border-b border-estate-border px-6">
              <button
                onClick={() => setActiveTab("assigned")}
                className={`py-3 px-4 text-sm font-semibold transition border-b-2 ${activeTab === "assigned"
                  ? "border-estate-navy text-estate-navy"
                  : "border-transparent text-estate-muted hover:text-estate-text"
                  }`}
              >
                Assigned ({agentSubareas.length})
              </button>
              {requestedSubareas.length > 0 && (
                <button
                  onClick={() => setActiveTab("requested")}
                  className={`py-3 px-4 text-sm font-semibold transition border-b-2 ${activeTab === "requested"
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-estate-muted hover:text-estate-text"
                    }`}
                >
                  Requested ({requestedSubareas.length})
                  {selectedAgent.status === "pending" && (
                    <span className="ml-1 text-xs text-amber-600">⏳</span>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab("available")}
                className={`py-3 px-4 text-sm font-semibold transition border-b-2 ${activeTab === "available"
                  ? "border-estate-navy text-estate-navy"
                  : "border-transparent text-estate-muted hover:text-estate-text"
                  }`}
              >
                Available ({availableSubareas.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingSubareas ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-estate-navy">Loading subareas...</div>
                </div>
              ) : subareas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-estate-text-sec">No subareas available for your city.</p>
                </div>
              ) : (
                <>
                  {/* Assigned Subareas Tab */}
                  {activeTab === "assigned" && (
                    <div>
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
                  )}

                  {/* Requested Subareas Tab - Always show if there are requested subareas */}
                  {activeTab === "requested" && requestedSubareas.length > 0 && (
                    <div>
                      {selectedAgent.status === "pending" ? (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700">
                            ⏳ This agent is pending approval. Assign requested subareas individually or use "Approve & Assign All" to activate and assign all at once.
                          </p>
                        </div>
                      ) : (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            ℹ️ This agent is already active. Assign additional subareas as needed.
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {requestedSubareas.map((subarea) => (
                          <div
                            key={subarea.id}
                            className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-estate-navy">{subarea.name}</p>
                              <p className="text-xs text-estate-muted">{getCityName(subarea.city_id)}</p>
                              <span className="text-xs text-amber-600 font-medium">⏳ Requested</span>
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

                      {/* Show "Approve & Assign All" button only for pending agents */}
                      {selectedAgent.status === "pending" && (
                        <div className="mt-4 pt-4 border-t border-estate-border">
                          <button
                            onClick={() => approveAgentWithSubareas(selectedAgent.id)}
                            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-sm font-semibold"
                          >
                            Approve & Assign All Requested ({requestedSubareas.length})
                          </button>
                          <p className="text-xs text-estate-muted mt-2 text-center">
                            This will assign all requested subareas and activate the agent.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Subareas Tab */}
                  {activeTab === "available" && (
                    <div>
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
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-estate-border bg-gray-50 gap-3">
              {selectedAgent.status === "pending" && requestedSubareas.length > 0 && (
                <button
                  onClick={() => approveAgentWithSubareas(selectedAgent.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                >
                  Approve & Assign All Requested
                </button>
              )}
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