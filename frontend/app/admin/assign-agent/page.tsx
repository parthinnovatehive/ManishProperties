"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";

export default function AdminAssignAgentPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([estateApi.adminProperties.list(), estateApi.agents.list<any>()]).then(([propertiesList, agentsList]) => {
      setProperties(propertiesList);
      setAgents(agentsList);
      setSelectedProperty(String(propertiesList[0]?.id || ""));
      setSelectedAgent(String(agentsList[0]?.id || ""));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await estateApi.adminProperties.update(selectedProperty, { assignedAgentId: selectedAgent } as any);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const currentPropertyObj = properties.find(p => p.id.toString() === selectedProperty);
  const currentAgentObj = agents.find(a => a.id === selectedAgent);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-estate-navy font-serif">Assign Agent</h1>
        <p className="text-sm text-estate-text-sec">Link active agents to property listings to manage inquiries and client visits.</p>
      </div>

      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6 sm:p-8">
        {success && (
          <div className="p-4 mb-6 bg-estate-success-bg border border-estate-success/30 rounded-xl text-estate-success text-sm font-medium animate-fade-up">
            ✓ Agent <span className="font-bold">{currentAgentObj?.name}</span> assigned successfully to <span className="font-bold">{currentPropertyObj?.title}</span>!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-estate-text mb-2">Select Property Listing</label>
            <select
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
              required
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.location} - {p.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-estate-text mb-2">Select Broker/Agent</label>
            <select
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
              required
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.experience} Exp - ⭐ {a.rating})
                </option>
              ))}
            </select>
          </div>

          {currentPropertyObj && currentAgentObj && (
            <div className="p-5 bg-estate-bg rounded-xl border border-estate-border/50 text-sm space-y-3">
              <h4 className="font-bold text-estate-navy text-xs uppercase tracking-wider">Assignment Details Preview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] text-estate-muted font-bold">Property Submitter</span>
                  <span className="text-estate-text font-medium">{currentPropertyObj.agent?.name || "Not Assigned"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-estate-muted font-bold">New Assigned Broker</span>
                  <span className="text-estate-text font-medium">{currentAgentObj.name}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-estate-navy text-white font-semibold rounded-xl hover:bg-estate-navy-mid shadow-md hover:shadow-lg transition"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
