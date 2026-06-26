import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Building2, Star, Edit, CheckCircle, Award } from "lucide-react";
import { AgentRatingDisplay } from "@/components/ui/AgentRatingDisplay";

interface AgentProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  propertiesCount: number;
  rating: number;
  totalRatings?: number;
  dealsCount: number;
  appointmentsCount: number;
}

interface ProfileCardProps {
  profile: AgentProfile;
  onEditClick?: () => void;
}

export function ProfileCard({ profile, onEditClick }: ProfileCardProps) {
  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AG";

  return (
    <Card className="overflow-hidden">
      {/* Header Banner */}
      <div className="h-24 bg-gradient-to-r from-estate-navy via-estate-navy-mid to-estate-navy-light relative" />

      {/* Profile section */}
      <div className="px-6 pb-6 relative">
        {/* Avatar + Edit button overlay */}
        <div className="flex justify-between items-end -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-estate-amber text-white flex items-center justify-center font-extrabold text-2xl shadow-md z-10">
            {initials}
          </div>
          <div className="flex gap-2 z-10">
            <Button variant="outline" size="sm" onClick={onEditClick} className="flex items-center gap-1.5">
              <Edit className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Name + Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-extrabold text-estate-navy tracking-tight">{profile.name}</h2>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            profile.status === "ACTIVE" || profile.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            <CheckCircle className="w-3 h-3" />
            {profile.status === "ACTIVE" || profile.status === "active" ? "Active" : "Pending"}
          </span>
        </div>

        {/* Rating */}
        <div className="mt-2">
          <AgentRatingDisplay rating={profile.rating} totalRatings={profile.totalRatings} showCount />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl">
            <Mail className="w-4 h-4 text-estate-navy-light flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">Email</span>
              <span className="text-sm font-semibold text-estate-text truncate block">{profile.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl">
            <Phone className="w-4 h-4 text-estate-navy-light flex-shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">Phone</span>
              <span className="text-sm font-semibold text-estate-text block">{profile.phone || "Not set"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl">
            <MapPin className="w-4 h-4 text-estate-navy-light flex-shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">City</span>
              <span className="text-sm font-semibold text-estate-text block">{profile.city || "Not set"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl">
            <Building2 className="w-4 h-4 text-estate-navy-light flex-shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">Properties</span>
              <span className="text-sm font-semibold text-estate-text block">{profile.propertiesCount} listed</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center p-4 bg-estate-blue-pale rounded-xl">
            <span className="text-2xl font-extrabold text-estate-navy block">{profile.propertiesCount}</span>
            <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Properties</span>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <span className="text-2xl font-extrabold text-emerald-700 block">{profile.dealsCount}</span>
            <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Deals</span>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <span className="text-2xl font-extrabold text-amber-700 block">{profile.appointmentsCount}</span>
            <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Appointments</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
