"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/config";

interface AdminUser {
  id?: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: string;
  status: "active" | "inactive";
  permissions: string[];
  joinedDate: string;
  phone?: string;
}

interface CreateAdminPayload {
  name: string;
  email: string;
  username?: string;
  password: string;
  phone?: string;
  role: string;
  status: "active" | "inactive";
  permissions: string[];
  joinedDate: string;
}

interface City {
  id: string;
  name: string;
  count: number;
  image: string;
  admin_id: string | null;
  status: "active" | "inactive";
}

export default function SuperAdminAdminsPage() {
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Modal states
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [newCityImage, setNewCityImage] = useState("");
  const [newCityCount, setNewCityCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    estateApi.admins.list<AdminUser>().then((items) =>
      setAdminsList(
        items.map((admin) => ({
          ...admin,
          email: admin.email || admin.username || "",
          status: admin.status || "active",
          permissions: Array.isArray(admin.permissions)
            ? admin.permissions
            : ["Manage Users", "Approve Properties"],
          joinedDate:
            admin.joinedDate ||
            new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
        }))
      )
    );

    estateApi.cities.list<City>().then((data) => {
      console.log("Cities received:", data);
      setCities(data);
    });
  }, []);

  const handleAddCity = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const cityData = {
      name: newCityName,
      image: newCityImage,
      count: parseInt(newCityCount) || 0,
      status: "active",
      admin_id: null,
    };
    
    console.log("Creating city with data:", cityData);
    
    // Try to create the city
    try {
      await estateApi.cities.create(cityData);
    } catch (createErr) {
      console.log("Create API returned error, but city might still be created");
    }
    
    // Always refetch the list to get the latest data
    const updatedCities = await estateApi.cities.list<City>();
    console.log("Refetched cities:", updatedCities);
    setCities(updatedCities);
    
    // Check if our city was created
    const cityExists = updatedCities.some(
      c => c.name.toLowerCase() === newCityName.toLowerCase()
    );
    
    if (cityExists) {
      // Reset form and close modal only if city exists
      setNewCityName("");
      setNewCityImage("");
      setNewCityCount("");
      setIsCityModalOpen(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError("Failed to create city. Please try again.");
      setTimeout(() => setError(""), 5000);
    }
    
  } catch (err: any) {
    console.error("Error in city creation process:", err);
    setError(`Failed to create city: ${err.message || "Unknown error"}`);
    setTimeout(() => setError(""), 5000);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const newAdmin = await estateApi.admins.create<CreateAdminPayload>({
      name,
      username: email,
      email,
      password,
      phone,
      role: "ADMIN",
      status: "active",
      permissions: ["Manage Users", "Approve Properties"],
      joinedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }) as AdminUser;

    setAdminsList(prev => [...prev, newAdmin]);

    if (selectedCity) {
      await estateApi.cities.update(selectedCity, {
        admin_id: newAdmin.id || "",
      });

      setCities((prev) =>
        prev.map((city) =>
          city.id === selectedCity
            ? { ...city, admin_id: newAdmin.id || null }
            : city
        )
      );
    }

    // Reset form
    setName("");
    setSelectedCity("");
    setEmail("");
    setPassword("");
    setPhone("");
    setIsAdminModalOpen(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const toggleStatus = async (id: string) => {
    const admin = adminsList.find((item) => item.id === id);
    const newStatus = admin?.status === "active" ? "inactive" : "active";
    await estateApi.admins.update<AdminUser>(id, { status: newStatus });

    if (newStatus === "inactive") {
      const assignedCity = cities.find((city) => city.admin_id === id);
      if (assignedCity) {
        await estateApi.cities.update(assignedCity.id, { admin_id: null });
        setCities((prev) =>
          prev.map((city) =>
            city.id === assignedCity.id
              ? { ...city, admin_id: null }
              : city
          )
        );
      }
    }

    setAdminsList(prev =>
      prev.map(a => {
        if (a.id === id) {
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password for admin (min 6 characters):");
    if (newPassword && newPassword.length >= 6) {
      await estateApi.admins.update<AdminUser>(id, { password: newPassword });
      alert("Password reset successfully!");
    } else if (newPassword) {
      alert("Password must be at least 6 characters");
    }
  };

  const getAssignedCity = (adminId: string | undefined) => {
    if (!adminId) return null;
    return cities.find((city) => city.admin_id === adminId);
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-estate-success-bg border border-estate-success/30 rounded-xl text-estate-success text-sm font-medium animate-fade-up">
          ✓ Operation completed successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
          ✗ {error}
        </div>
      )}

      {/* Header with Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-estate-navy font-serif">Platform Admins</h1>
          <p className="text-estate-text-sec text-sm mt-1">Total Cities: {cities.length}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCityModalOpen(true)}
            className="px-4 py-2 bg-white border border-estate-navy text-estate-navy rounded-xl hover:bg-estate-bg transition font-semibold"
          >
            + Add City
          </button>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="px-4 py-2 bg-estate-navy hover:bg-estate-navy-mid text-white rounded-xl transition font-semibold shadow-md"
          >
            + Create Admin
          </button>
        </div>
      </div>

      {/* Admin List Table */}
      <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Authorized Permissions</th>
                <th className="py-3 px-4">City</th>
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
                    {adm.phone && <div className="text-xs text-estate-muted">{adm.phone}</div>}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {adm.permissions?.map((p, idx) => (
                        <span key={idx} className="bg-estate-blue-pale text-estate-navy text-[10px] font-semibold px-2 py-0.5 rounded-full border border-estate-navy/10">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getAssignedCity(adm.id)?.name || (
                      <span className="text-rose-500 font-semibold text-xs">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">
                    {adm.joinedDate}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${adm.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                      {adm.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                    {adm.role !== 'SUPER_ADMIN' ? (
                      <>
                        <select
                          value={getAssignedCity(adm.id)?.id || ""}
                          onChange={async (e) => {
                            const cityId = e.target.value;
                            if (!cityId) return;

                            await estateApi.cities.update(cityId, {
                              admin_id: adm.id,
                            });

                            setCities((prev) =>
                              prev.map((city) =>
                                city.id === cityId
                                  ? { ...city, admin_id: adm.id || null }
                                  : city
                              )
                            );
                          }}
                          className="px-2 py-1 rounded-lg border border-estate-border text-xs"
                        >
                          <option value="">Assign City</option>
                          {cities
                            .filter(
                              (city) =>
                                !city.admin_id ||
                                city.admin_id === adm.id
                            )
                            .map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                        </select>
                        {/* <button
                          onClick={() => handleResetPassword(adm.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-estate-navy/20 text-estate-navy bg-white hover:bg-estate-bg transition"
                        >
                          Reset PW
                        </button> */}
                        <button
                          onClick={() => toggleStatus(adm.id!)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${adm.status === 'active'
                            ? 'bg-estate-red-bg text-estate-red border-estate-red/20 hover:bg-rose-100'
                            : 'bg-estate-success-bg text-estate-success border-estate-success/20 hover:bg-emerald-150'
                            }`}
                        >
                          {adm.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </>
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

      {/* Create Admin Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-estate-navy font-serif">Create New Admin</h2>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">Admin Name *</label>
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
                <label className="block text-sm font-semibold text-estate-text mb-2">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sameer@estateelite.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                  required
                />
                <p className="text-xs text-estate-muted mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">Assign City *</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-estate-border bg-white text-black"
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => {
                    const isAssigned = !!city.admin_id;
                    return (
                      <option
                        key={city.id}
                        value={city.id}
                        disabled={isAssigned}
                        className={isAssigned ? "text-gray-400" : ""}
                      >
                        {city.name} {isAssigned ? `(Already Assigned)` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="p-4 bg-estate-bg rounded-xl text-xs text-estate-text-sec space-y-1">
                <span className="font-bold block uppercase text-estate-navy mb-1">Standard Permissions</span>
                <div>• Approve / Reject Properties</div>
                <div>• View Appointed Tours</div>
                <div>• Resolve User Complaints</div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-estate-navy hover:bg-estate-navy-mid text-white font-semibold rounded-xl transition"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-estate-navy font-serif">Add New City</h2>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCity} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">City Name *</label>
                <input
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">Image URL *</label>
                <input
                  type="url"
                  value={newCityImage}
                  onChange={(e) => setNewCityImage(e.target.value)}
                  placeholder="https://example.com/city-image.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">Property Count</label>
                <input
                  type="number"
                  value={newCityCount}
                  onChange={(e) => setNewCityCount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-estate-navy hover:bg-estate-navy-mid text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add City"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}