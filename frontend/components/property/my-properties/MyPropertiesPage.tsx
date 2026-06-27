"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Property } from "@/types";
import { estateApi } from "@/lib/api";
import { getAdminData } from "@/lib/utils/token";
import { MyPropertyStats } from "@/components/property/my-properties/MyPropertyStats";
import { MyPropertyCard } from "@/components/property/my-properties/MyPropertyCard";
import { MyPropertyFilters } from "@/components/property/my-properties/MyPropertyFilters";
import { DeletePropertyModal } from "@/components/property/my-properties/DeletePropertyModal";
import { FeatureRequestModal } from "@/components/property/my-properties/FeatureRequestModal";
import { ErrorBoundary } from "@/components/property/my-properties/ErrorBoundary";
import { Plus, Building2, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Filters {
  status: string;
  category: string;
  listingType: string;
  dateRange: string;
  search: string;
}

interface MyPropertiesPageProps {
  role: "user" | "agent";
}

function MyPropertiesPageInner({ role }: MyPropertiesPageProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    category: "",
    listingType: "",
    dateRange: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState("newest");

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [featureTarget, setFeatureTarget] = useState<Property | null>(null);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

  const getCurrentUserId = (): { id: string | null; type: string } => {
    const adminData = getAdminData();
    if (adminData?.id) {
      return {
        id: adminData.id,
        type: adminData.role?.toLowerCase() === "agent" ? "agent" : "user",
      };
    }
    let storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return { id: userData.id, type: "user" };
    }
    return { id: null, type: role };
  };

  const fetchProperties = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { id: currentUserId } = getCurrentUserId();
      if (!currentUserId) {
        setProperties([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const items = await estateApi.adminProperties.list();

      const myProperties = items.filter(
        (item: any) =>
          item.lister_id === currentUserId &&
          item.lister_type === role
      );

      setProperties(myProperties);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load properties."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [role]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchLower) ||
          p.location?.toLowerCase().includes(searchLower) ||
          p.city?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Listing type filter
    if (filters.listingType) {
      result = result.filter((p) => p.listingType === filters.listingType);
    }

    // Date range filter
    if (filters.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((p) => {
        if (!p.createdAt) return true;
        return new Date(p.createdAt) >= cutoff;
      });
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
        break;
      case "price_low":
        result.sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
        break;
      case "price_high":
        result.sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
        break;
      case "views":
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    return result;
  }, [properties, filters, sortBy]);

  // Handlers
  const handleView = (property: Property) => {
    router.push(`/properties/${property.id}`);
  };

  const handleEdit = (property: Property) => {
    router.push(`${role === "agent" ? "/agent" : "/user"}/my-properties/edit/${property.id}`);
  };

  const handleDeleteClick = (property: Property) => {
    setDeleteTarget(property);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (property: Property) => {
    try {
      await estateApi.adminProperties.remove(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      toast.success("Property deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete property"
      );
    }
  };

  const handleFeatureClick = (property: Property) => {
    setFeatureTarget(property);
    setFeatureModalOpen(true);
  };

  const handleFeatureSuccess = () => {
    fetchProperties();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchProperties()}
            className="ml-3 font-bold underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              href={role === "agent" ? "/agent/dashboard" : "/dashboard"}
              className="flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
            My Properties
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Manage your real estate listings, status, and details.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchProperties(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/submit-property")}
            className="flex items-center gap-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add New Property
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!loading && <MyPropertyStats properties={properties} />}
      {loading && <MyPropertyStats properties={[]} loading />}

      {/* Filters */}
      <MyPropertyFilters
        filters={filters}
        sortBy={sortBy}
        onFilterChange={setFilters}
        onSortChange={setSortBy}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-estate-navy animate-spin mb-4" />
          <p className="text-sm font-semibold text-estate-text-sec">
            Loading your properties...
          </p>
        </div>
      )}

      {/* Property Grid */}
      {!loading && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <MyPropertyCard
              key={property.id}
              property={property}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onFeatureRequest={handleFeatureClick}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-estate-blue-pale">
            <Building2 className="h-8 w-8 text-estate-navy" />
          </div>
          <h3 className="text-lg font-bold text-estate-navy font-serif mb-2">
            No Properties Yet
          </h3>
          <p className="text-sm text-estate-text-sec mb-6 max-w-sm mx-auto">
            You haven&apos;t listed any properties yet. Start by adding your first
            property listing.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/submit-property")}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" /> Add Your First Property
          </Button>
        </div>
      )}

      {/* No Results State */}
      {!loading && properties.length > 0 && filteredProperties.length === 0 && (
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-estate-muted">
            No properties match your current filters.
          </p>
          <button
            onClick={() =>
              setFilters({
                status: "",
                category: "",
                listingType: "",
                dateRange: "",
                search: "",
              })
            }
            className="mt-3 text-sm font-bold text-estate-navy underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <DeletePropertyModal
        property={deleteTarget}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Feature Request Modal */}
      <FeatureRequestModal
        property={featureTarget}
        isOpen={featureModalOpen}
        onClose={() => {
          setFeatureModalOpen(false);
          setFeatureTarget(null);
        }}
        onSuccess={handleFeatureSuccess}
      />
    </div>
  );
}

export default function MyPropertiesPage(props: MyPropertiesPageProps) {
  return (
    <ErrorBoundary>
      <MyPropertiesPageInner {...props} />
    </ErrorBoundary>
  );
}
