import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Home, DollarSign, Calendar, MessageSquare, Edit } from "lucide-react";

export interface Lead {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  propertyTitle: string;
  budget: string;
  notes?: string;
  date: string;
  status: "New" | "Contacted" | "Interested" | "Closed";
}

interface LeadCardProps {
  lead: Lead;
  onStatusChange?: (id: string, newStatus: Lead["status"]) => void;
  onEdit?: (lead: Lead) => void;
}

export function LeadCard({ lead, onStatusChange, onEdit }: LeadCardProps) {
  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Contacted":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Interested":
        return "bg-estate-success-bg text-estate-success border-estate-border-med";
      case "Closed":
        return "bg-estate-blue-pale text-estate-navy border-estate-border";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full hover:shadow-estate-md transition">
      <div>
        {/* Header - Initials Avatar & Edit Action */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-estate-navy text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              {getInitials(lead.clientName)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-estate-navy tracking-tight truncate">
                {lead.clientName}
              </h3>
              <span className="text-[10px] text-estate-muted font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" /> Received: {lead.date}
              </span>
            </div>
          </div>
          <button
            onClick={() => onEdit?.(lead)}
            className="p-1.5 hover:bg-estate-surface rounded-lg transition text-estate-text-sec hover:text-estate-navy"
            title="Edit Lead Details"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Contacts details */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 p-2 rounded-lg bg-estate-surface/60 hover:bg-estate-surface text-estate-navy transition text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-estate-navy-light" />
            <span className="truncate">Call Client</span>
          </a>
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 p-2 rounded-lg bg-estate-surface/60 hover:bg-estate-surface text-estate-navy transition text-xs font-semibold"
          >
            <Mail className="w-3.5 h-3.5 text-estate-navy-light" />
            <span className="truncate">Email Client</span>
          </a>
        </div>

        {/* Interested property */}
        <div className="mt-4 flex items-start gap-2.5 bg-estate-surface/30 p-3 rounded-xl border border-estate-border/50">
          <Home className="w-4.5 h-4.5 text-estate-muted flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-estate-muted tracking-wider block">
              Property Interested In
            </span>
            <span className="text-xs font-bold text-estate-text line-clamp-1 mt-0.5">
              {lead.propertyTitle}
            </span>
          </div>
        </div>

        {/* Budget info */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-estate-text-sec text-xs font-semibold">
            <DollarSign className="w-4.5 h-4.5 text-estate-navy-light" />
            <span>Budget: <strong className="text-estate-navy">{lead.budget}</strong></span>
          </div>
        </div>

        {/* Notes, if present */}
        {lead.notes && (
          <div className="mt-3.5 text-xs text-estate-text-sec bg-estate-amber-pale/40 border border-estate-border-med/40 p-2.5 rounded-lg line-clamp-2 italic">
            &ldquo;{lead.notes}&rdquo;
          </div>
        )}
      </div>

      {/* Status Editor Row */}
      <div className="mt-4 pt-3 border-t border-estate-border flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-estate-muted">Pipeline Status:</span>
        <select
          value={lead.status}
          onChange={(e) => onStatusChange?.(lead.id, e.target.value as Lead["status"])}
          className={`text-xs font-bold border rounded-lg px-2 py-1 outline-none transition cursor-pointer ${getStatusColor(
            lead.status
          )}`}
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Interested">Interested</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    </Card>
  );
}
