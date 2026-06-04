import Image from "next/image";
import { Property } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Maximize2, Star, Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: Property;
  onView?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyCard({ property, onView, onEdit, onDelete }: PropertyCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "for sale":
      case "for rent":
      case "approved":
        return "success";
      case "pending":
        return "amber";
      case "sold":
      case "rejected":
        return "muted";
      default:
        return "blue";
    }
  };

  const imageSrc = property.img || property.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=70";

  return (
    <Card className="flex flex-col h-full group overflow-hidden">
      {/* Property Image & Status */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-estate-surface">
        <img
          src={imageSrc}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <Badge variant={getStatusVariant(property.status)}>
            {property.status}
          </Badge>
          {property.featured && (
            <span className="inline-flex items-center gap-1 bg-estate-amber-pale text-estate-amber-dark font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
              <Star className="w-2.5 h-2.5 fill-current" /> Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-4 right-4 bg-estate-navy text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md backdrop-filter backdrop-blur-md bg-opacity-90">
          {property.type}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xl font-extrabold text-estate-navy tracking-tight truncate">
            {property.price}
          </div>
          <h3 className="text-base font-bold text-estate-text mt-1.5 line-clamp-1 group-hover:text-estate-navy-mid transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-estate-text-sec text-xs mt-1">
            <MapPin className="w-3.5 h-3.5 text-estate-navy-light flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-3 gap-2.5 border-t border-estate-border mt-4 pt-4">
            <div className="flex items-center gap-1.5 text-estate-text-sec">
              <Bed className="w-4 h-4 text-estate-muted" />
              <span className="text-xs font-semibold">{property.beds} Bed</span>
            </div>
            <div className="flex items-center gap-1.5 text-estate-text-sec">
              <Bath className="w-4 h-4 text-estate-muted" />
              <span className="text-xs font-semibold">
                {property.baths ?? property.bathrooms ?? "N/A"} Bath
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-estate-text-sec">
              <Maximize2 className="w-4 h-4 text-estate-muted" />
              <span className="text-xs font-semibold">{property.area} ft²</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-1"
            onClick={() => onView?.(property)}
          >
            <Eye className="w-3.5 h-3.5" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1"
            onClick={() => onEdit?.(property)}
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1"
            onClick={() => onDelete?.(property)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
