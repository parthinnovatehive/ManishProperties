import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Briefcase, Building2, Star, Edit } from "lucide-react";
import { AgentRatingDisplay } from "@/components/ui/AgentRatingDisplay";

interface AgentProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  propertiesCount: number;
  rating: number;
  totalRatings?: number;
  dealsCount: number;
}

interface ProfileCardProps {
  profile: AgentProfile;
  onEditClick?: () => void;
}

export function ProfileCard({ profile, onEditClick }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-estate-md transition">
      {/* Visual Header Banner */}
      <div className="h-32 bg-gradient-to-r from-estate-navy via-estate-navy-mid to-estate-navy-light relative" />

      {/* Profile Details section */}
      <div className="px-6 pb-6 relative">
        {/* Avatar placement overlay */}
        <div className="flex justify-between items-end -mt-16 mb-4">
          <div className="w-28 h-28 rounded-full border-4 border-white bg-estate-blue-pale text-estate-navy flex items-center justify-center font-extrabold text-3xl shadow-md z-10 relative overflow-hidden">
            {/* Display placeholder image or initials */}
            <span className="relative z-10">RS</span>
            <div className="absolute inset-0 bg-cover bg-center bg-opacity-40" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&q=70')` }} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="flex items-center gap-1.5 z-10"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
        </div>

        {/* Identity Details */}
        <div>
          <h2 className="text-2xl font-extrabold text-estate-navy tracking-tight">{profile.name}</h2>
          <span className="text-xs font-bold text-estate-success bg-estate-success-bg border border-estate-border-med/40 px-2.5 py-0.5 rounded-full inline-block mt-1">
            Certified Estate Agent
          </span>
        </div>

        {/* Rating and Deals summaries */}
        <div className="flex items-center gap-4 mt-4 py-3 border-y border-estate-border/50">
          <AgentRatingDisplay rating={profile.rating} totalRatings={profile.totalRatings} showCount={true} />
          <div className="w-1.5 h-1.5 rounded-full bg-estate-border-med" />
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-estate-navy-light" />
            <span className="text-xs text-estate-muted font-medium">
              <strong className="text-estate-navy font-bold">{profile.propertiesCount}</strong> Active Listings
            </span>
          </div>
        </div>

        {/* Contact list & Personal specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-estate-surface/60 text-estate-navy-light">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">Email Address</span>
              <span className="text-sm font-bold text-estate-text truncate block">{profile.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-estate-surface/60 text-estate-navy-light">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">Phone Number</span>
              <span className="text-sm font-bold text-estate-text block">{profile.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-estate-surface/60 text-estate-navy-light">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">City / Operating Area</span>
              <span className="text-sm font-bold text-estate-text block">{profile.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-estate-surface/60 text-estate-navy-light">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider block">Industry Experience</span>
              <span className="text-sm font-bold text-estate-text block">{profile.experience}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
