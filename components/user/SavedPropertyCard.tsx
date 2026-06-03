import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

interface SavedPropertyCardProps {
  id?: string | number;
  title: string;
  location: string;
  price: string;
  image?: string;
  type?: string;
}

export default function SavedPropertyCard({
  id = "1",
  title,
  location,
  price,
  image,
  type = "Apartment",
}: SavedPropertyCardProps) {
  const [isSaved, setIsSaved] = useState(true);
  
  return (
    <Card className="p-0 overflow-hidden h-full flex flex-col group">
      {/* Image */}
      <div className="relative h-48 bg-estate-surface overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=75'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-estate-bg text-estate-border">
            <Eye size={48} className="opacity-20" />
          </div>
        )}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-white shadow-estate flex items-center justify-center hover:shadow-estate-md transition-shadow"
        >
          <Heart 
            size={18} 
            className={isSaved ? 'fill-estate-red text-estate-red' : 'text-estate-text-sec'}
          />
        </button>
        <div className="absolute top-3 left-3">
          <Badge variant="white" size="sm">
            {type}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-extrabold text-estate-navy tracking-tight line-clamp-2 mb-2">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-estate-text-sec font-semibold mb-4 flex-1">
          <MapPin size={14} className="text-estate-navy-light flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-estate-border/50">
          <div className="text-lg font-extrabold text-estate-navy tracking-tight">
            {price}
          </div>
          <Link href={`/properties/${id}`}>
            <Button size="sm" variant="outline" className="text-xs">
              View
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}