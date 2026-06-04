"use client";

import { useState } from "react";
import { agents as initialAgents, Agent } from "@/data/agents";

export default function AdminAgentsPage() {
  const [agentsList, setAgentsList] = useState<Agent[]>(initialAgents);

  const toggleStatus = (id: string) => {
    setAgentsList(prev =>
      prev.map(a => {
        if (a.id === id) {
          const newStatus = a.status === 'active' ? 'inactive' : 'active';
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  const activeCount = agentsList.filter(a => a.status === 'active').length;
  const avgRating = (agentsList.reduce((acc, curr) => acc + curr.rating, 0) / agentsList.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Manage Agents</h1>
          <p className="text-sm text-estate-text-sec">Supervise agent activity, details, and active listings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Agents</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{agentsList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Active Agents</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">{activeCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Average Rating</span>
          <span className="text-3xl font-extrabold text-estate-amber-dark block mt-2">⭐ {avgRating} / 5.0</span>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Deals Closed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {agentsList.map((agent) => (
                <tr key={agent.id} className="hover:bg-estate-bg/40 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-estate-blue text-white text-xs font-bold rounded-full flex items-center justify-center border border-estate-navy">
                        {agent.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-estate-text">{agent.name}</div>
                        <div className="text-xs text-estate-amber-dark font-medium">⭐ {agent.rating} Rating</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-estate-text font-medium">{agent.email}</div>
                    <div className="text-xs text-estate-text-sec">{agent.phone}</div>
                  </td>
                  <td className="py-4 px-4 text-estate-text-sec">{agent.experience}</td>
                  <td className="py-4 px-4 font-bold text-estate-navy">{agent.deals}</td>
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        agent.status === 'active'
                          ? 'bg-estate-red-bg text-estate-red border-estate-red/20 hover:bg-rose-100'
                          : 'bg-estate-success-bg text-estate-success border-estate-success/20 hover:bg-emerald-150'
                      }`}
                    >
                      {agent.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
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
