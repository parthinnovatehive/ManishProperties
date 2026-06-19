"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyCard } from "@/components/agent/PropertyCard";
import { Property } from "@/types";
import { estateApi } from "@/lib/api";
import { Search, Plus, X, Bed, Bath, Maximize2, MapPin, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Sold" | "Pending">("All");

  // Selection states for Drawers/Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for Edit
  const [formState, setFormState] = useState({
    title: "",
    price: "",
    location: "",
    city: "Mumbai",
    type: "Apartment",
    beds: 3,
    baths: 3,
    area: 1500,
    status: "Active",
    rera: "",
    description: "",
  });

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current agent from localStorage
      let storedUser = localStorage.getItem("userData");
      let currentAgentId = null;

      if (!storedUser) {
        storedUser = localStorage.getItem("adminData");
      }

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        currentAgentId = userData.id;
      }

      if (!currentAgentId) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const items = await estateApi.adminProperties.list();
      
      // Filter properties where lister_id matches current agent's ID
      // and lister_type is "agent"
      const agentProperties = items.filter(
        (item) => item.lister_id === currentAgentId && item.lister_type === "agent"
      );
      
      setProperties(agentProperties.map((item) => ({
        ...item,
        status: item.status === "APPROVED" ? "Active" : item.status === "REJECTED" ? "Sold" : "Pending",
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Filter logic
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.price.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "All") return matchesSearch;
    return matchesSearch && p.status.toLowerCase() === activeTab.toLowerCase();
  });

  // Handle Edit Action Click
  const handleEditClick = (property: Property) => {
    setEditingProperty(property);
    setFormState({
      title: property.title,
      price: property.price,
      location: property.location,
      city: property.city,
      type: property.type as string,
      beds: property.beds,
      baths: Number(property.baths ?? property.bathrooms ?? 3),
      area: property.area,
      status: property.status as string,
      rera: property.rera || "",
      description: property.description || "",
    });
  };

  // Handle Save Edit Listing
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    try {
      const updated = await estateApi.adminProperties.update(editingProperty.id, {
        title: formState.title,
        price: formState.price,
        location: formState.location,
        city: formState.city,
        type: formState.type,
        beds: formState.beds,
        bathrooms: formState.baths,
        area: formState.area,
        status: formState.status,
        rera: formState.rera,
        description: formState.description,
      });

      setProperties((prev) =>
        prev.map((p) =>
          p.id === editingProperty.id
            ? {
                ...p,
                ...updated,
                title: formState.title,
                price: formState.price,
                location: formState.location,
                city: formState.city,
                type: formState.type,
                beds: formState.beds,
                baths: formState.baths,
                bathrooms: formState.baths,
                area: formState.area,
                status: formState.status,
                rera: formState.rera,
                description: formState.description,
              }
            : p
        )
      );
      setEditingProperty(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update property.");
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    if (!window.confirm(`Delete "${property.title}"?`)) return;
    try {
      await estateApi.adminProperties.remove(property.id);
      setProperties((prev) => prev.filter((item) => item.id !== property.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete property.");
    }
  };

  const handleAddListing = () => {
    router.push("/submit-property");
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
          <button onClick={loadProperties} className="ml-3 font-bold underline">Retry</button>
        </div>
      )}
      {loading && (
        <div className="rounded-2xl border border-estate-border bg-white p-4 text-sm font-semibold text-estate-text-sec">
          Loading properties...
        </div>
      )}
      {/* Header title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
            My Properties
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Manage your real estate listings, status tags, and details.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddListing}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Listing
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white border border-estate-border/70 p-4 rounded-2xl shadow-sm">
        {/* Tab filters */}
        <div className="flex overflow-x-auto gap-1.5 p-1 bg-estate-surface/60 rounded-xl max-w-full scrollbar-none">
          {(["All", "Active", "Pending", "Sold"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-estate-navy text-white shadow-sm"
                  : "text-estate-text-sec hover:text-estate-navy hover:bg-estate-surface/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-estate-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-estate-border/80 focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 rounded-xl outline-none transition bg-estate-bg"
          />
        </div>
      </div>

      {/* Properties responsive grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={(p) => setSelectedProperty(p)}
              onEdit={handleEditClick}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-estate-muted">No properties found matching the criteria.</p>
        </div>
      )}

      {/* VIEW PROPERTY DETAIL DRAWER */}
      {selectedProperty && (
        <>
          <div
            onClick={() => setSelectedProperty(null)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white z-50 shadow-estate-lg flex flex-col overflow-y-auto animate-fade-up">
            {/* Header */}
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10 sticky top-0 bg-white">
              <div>
                <h3 className="font-extrabold text-base text-estate-navy">Property Details</h3>
                <span className="text-[10px] text-estate-muted font-bold">ID: {selectedProperty.id}</span>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 hover:bg-estate-surface rounded-lg transition"
              >
                <X className="w-5 h-5 text-estate-text-sec" />
              </button>
            </div>

            {/* Photo */}
            <div className="h-60 bg-estate-surface relative overflow-hidden flex-shrink-0">
              <img
                src={selectedProperty.img || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=70"}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-estate-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                {selectedProperty.status}
              </span>
            </div>

            {/* Contents */}
            <div className="p-6 space-y-6 flex-1">
              <div>
                <span className="text-xl font-extrabold text-estate-navy block">{selectedProperty.price}</span>
                <h2 className="text-lg font-bold text-estate-text mt-1">{selectedProperty.title}</h2>
                <div className="flex items-center gap-1 text-estate-text-sec text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5 text-estate-navy-light" />
                  <span>{selectedProperty.location}</span>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 bg-estate-surface/50 p-4 rounded-xl border border-estate-border/50">
                <div className="text-center border-r border-estate-border last:border-0">
                  <Bed className="w-4 h-4 mx-auto text-estate-navy-light" />
                  <span className="text-sm font-extrabold text-estate-navy block mt-1">
                    {selectedProperty.beds}
                  </span>
                  <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Beds</span>
                </div>
                <div className="text-center border-r border-estate-border last:border-0">
                  <Bath className="w-4 h-4 mx-auto text-estate-navy-light" />
                  <span className="text-sm font-extrabold text-estate-navy block mt-1">
                    {selectedProperty.baths ?? selectedProperty.bathrooms ?? "N/A"}
                  </span>
                  <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Baths</span>
                </div>
                <div className="text-center">
                  <Maximize2 className="w-4 h-4 mx-auto text-estate-navy-light" />
                  <span className="text-sm font-extrabold text-estate-navy block mt-1">
                    {selectedProperty.area}
                  </span>
                  <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Sq Ft</span>
                </div>
              </div>

              {/* Data list */}
              <div className="bg-white border border-estate-border/80 rounded-xl overflow-hidden shadow-sm">
                {[
                  ["Property Type", selectedProperty.type],
                  ["Operating City", selectedProperty.city],
                  ["RERA Registration", selectedProperty.rera || "Not Required / Exempted"],
                  ["Developer", selectedProperty.builder || "Independent Construction"],
                  ["Facing Direction", selectedProperty.facing || "East"],
                  ["Year Constructed", selectedProperty.yearBuilt || "2023"],
                ].map(([lbl, val], idx) => (
                  <div
                    key={lbl}
                    className={`flex justify-between p-3.5 text-xs font-semibold ${
                      idx % 2 === 0 ? "bg-white" : "bg-estate-surface/30"
                    } border-b border-estate-border last:border-0`}
                  >
                    <span className="text-estate-muted">{lbl}</span>
                    <span className="text-estate-text font-bold">{val}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-estate-navy">
                    Property Description
                  </h4>
                  <p className="text-xs font-medium leading-relaxed text-estate-text-sec bg-estate-surface/30 p-4 rounded-xl border border-estate-border/40">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Highlights/Amenities */}
              {selectedProperty.amenities && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-estate-navy">Amenities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProperty.amenities.map((item) => (
                      <span
                        key={item}
                        className="text-[10px] font-bold text-estate-navy bg-estate-blue-pale/80 border border-estate-border px-2.5 py-1 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* EDIT LISTING MODAL */}
      {editingProperty && (
        <>
          <div
            onClick={() => setEditingProperty(null)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-x-4 top-10 max-w-xl mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Edit Listing</h3>
              <button
                onClick={() => setEditingProperty(null)}
                className="p-1 hover:bg-estate-surface rounded-lg transition"
              >
                <X className="w-5 h-5 text-estate-text-sec" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Listing Title
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Listing Price (e.g. ₹2.85 Cr)
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Status tag
                  </span>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
                  </select>
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Exact Location address
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Property Type
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.type}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    RERA Registration Code
                  </span>
                  <input
                    type="text"
                    value={formState.rera}
                    onChange={(e) => setFormState({ ...formState, rera: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Bedrooms count
                  </span>
                  <input
                    type="number"
                    value={formState.beds}
                    onChange={(e) => setFormState({ ...formState, beds: Number(e.target.value) })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Bathrooms count
                  </span>
                  <input
                    type="number"
                    value={formState.baths}
                    onChange={(e) => setFormState({ ...formState, baths: Number(e.target.value) })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Area (Square Feet)
                  </span>
                  <input
                    type="number"
                    value={formState.area}
                    onChange={(e) => setFormState({ ...formState, area: Number(e.target.value) })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Operating City
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Detailed Description
                  </span>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2.5 border border-estate-border text-xs font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition"
                >
                  Cancel
                </button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}