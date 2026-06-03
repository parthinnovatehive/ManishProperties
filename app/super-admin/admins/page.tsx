"use client";

import { useState } from "react";
import { admins as initialAdmins, AdminUser } from "@/data/admins";

export default function SuperAdminAdminsPage() {
  const [adminsList, setAdminsList] = useState<AdminUser[]>(initialAdmins);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdmin: AdminUser = {
      id: `adm-${Date.now()}`,
      name,
      email,
      role: 'admin',
      status: 'active',
      permissions: ["Manage Users", "Approve Properties"],
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    setAdminsList(prev => [...prev, newAdmin]);
    setName("");
    setEmail("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const toggleStatus = (id: string) => {
    setAdminsList(prev =>
      prev.map(a => {
        if (a.id === id) {
          const newStatus = a.status === 'active' ? 'inactive' : 'active';
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Admin Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">Create Admin</h2>
          <p className="text-sm text-estate-text-sec mb-6">Authorize a new user to moderate listings and resolve user complaints.</p>

          {success && (
            <div className="p-4 mb-4 bg-estate-success-bg border border-estate-success/30 rounded-xl text-estate-success text-sm font-medium animate-fade-up">
              ✓ Admin created successfully!
            </div>
          )}

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Admin Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sameer Verma"
                className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sameer@estateelite.com"
                className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            <div className="p-4 bg-estate-bg rounded-xl text-xs text-estate-text-sec space-y-1">
              <span className="font-bold block uppercase text-estate-navy mb-1">Standard Permissions</span>
              <div>• Approve / Reject Properties</div>
              <div>• View Appointed Tours</div>
              <div>• Resolve User Complaints</div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-estate-navy hover:bg-estate-navy-mid text-white font-semibold rounded-xl transition shadow-md"
            >
              Add Platform Admin
            </button>
          </form>
        </div>
      </div>

      {/* Admin List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">Platform Admins</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Authorized Permissions</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {adminsList.map((adm) => (
                  <tr key={adm.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-estate-text">{adm.name}</div>
                      <div className="text-xs text-estate-text-sec">{adm.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {adm.permissions.map((p, idx) => (
                          <span key={idx} className="bg-estate-blue-pale text-estate-navy text-[10px] font-semibold px-2 py-0.5 rounded-full border border-estate-navy/10">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">{adm.joinedDate}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        adm.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {adm.role !== 'super-admin' ? (
                        <button
                          onClick={() => toggleStatus(adm.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            adm.status === 'active'
                              ? 'bg-estate-red-bg text-estate-red border-estate-red/20 hover:bg-rose-100'
                              : 'bg-estate-success-bg text-estate-success border-estate-success/20 hover:bg-emerald-150'
                          }`}
                        >
                          {adm.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-xs text-estate-muted font-bold">System Guard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
