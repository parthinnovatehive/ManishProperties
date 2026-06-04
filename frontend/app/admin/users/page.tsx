"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: string;
  avatar?: string;
  joinedDate?: string;
  savedProperties: string[];
  status?: "active" | "suspended";
}

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    estateApi.users.list<User>().then((items) =>
      setUsersList(items.map((user) => ({
        ...user,
        email: user.email || user.username || "",
        avatar: user.avatar || (user.name || user.username || "U").slice(0, 2).toUpperCase(),
        joinedDate: user.joinedDate || "Not available",
        savedProperties: user.savedProperties || [],
        status: user.status || "active",
      })))
    );
  }, []);

  const toggleStatus = async (id: string) => {
    const user = usersList.find((item) => item.id === id);
    const newStatus = user?.status === "active" ? "suspended" : "active";
    await estateApi.users.update<User>(id, { status: newStatus });
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id) {
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const activeCount = usersList.filter(u => u.status === 'active').length;
  const suspendedCount = usersList.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Manage Users</h1>
          <p className="text-sm text-estate-text-sec">View, moderate, and manage user accounts on the platform.</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Users</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{usersList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Active Users</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">{activeCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Suspended Users</span>
          <span className="text-3xl font-extrabold text-estate-red block mt-2">{suspendedCount}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Saved Listings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-estate-bg/40 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-estate-blue-pale text-estate-navy text-xs font-bold rounded-full flex items-center justify-center border border-estate-border-med">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-estate-text">{user.name}</div>
                        <div className="text-xs text-estate-muted capitalize">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-estate-text font-medium">{user.email}</div>
                    <div className="text-xs text-estate-text-sec">{user.phone}</div>
                  </td>
                  <td className="py-4 px-4 text-estate-text-sec">{user.joinedDate}</td>
                  <td className="py-4 px-4 text-center font-semibold text-estate-navy">{user.savedProperties.length}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        user.status === 'active'
                          ? 'bg-estate-red-bg text-estate-red border-estate-red/20 hover:bg-rose-100'
                          : 'bg-estate-success-bg text-estate-success border-estate-success/20 hover:bg-emerald-150'
                      }`}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
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
