import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, Mail, Check, X, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Appointment {
  id: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  propertyName: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Scheduled";
  type: "Site Visit" | "Online Consultation" | "Agreement Review" | "In-Person" | "Video Call";
}

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange?: (id: string, newStatus: Appointment["status"]) => void;
}

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const getStatusVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "Confirmed":
        return "success";
      case "Pending":
        return "amber";
      case "Completed":
        return "muted";
      default:
        return "blue";
    }
  };

  const getMeetingTypeStyle = (type: Appointment["type"]) => {
    switch (type) {
      case "Site Visit":
        return "bg-estate-blue-pale text-estate-navy";
      case "Online Consultation":
        return "bg-purple-50 text-purple-700";
      case "Agreement Review":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-estate-surface text-estate-text";
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header with status and meeting type */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getMeetingTypeStyle(appointment.type)}`}>
            {appointment.type}
          </span>
          <Badge variant={getStatusVariant(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>

        {/* Client details */}
        <div className="mt-4">
          <h3 className="text-base font-extrabold text-estate-navy tracking-tight truncate">
            {appointment.clientName}
          </h3>
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
              <Mail className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
              <span className="truncate">{appointment.clientEmail}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
              <Phone className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
              <span>{appointment.clientPhone}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-estate-border my-4" />

        {/* Property & Scheduling */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-estate-navy-light mt-0.5 flex-shrink-0" />
            <div className="text-xs text-estate-text font-bold line-clamp-2">
              {appointment.propertyName}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs text-estate-text-sec font-semibold">
              <Calendar className="w-3.5 h-3.5 text-estate-muted" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-estate-text-sec font-semibold">
              <Clock className="w-3.5 h-3.5 text-estate-muted" />
              <span>{appointment.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer controls for confirming / completing appointments */}
      {appointment.status !== "Completed" && (
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-estate-border">
          {appointment.status === "Pending" && (
            <>
              <button
                className="flex-1 inline-flex items-center justify-center gap-1 bg-estate-success text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-estate-success/90 transition"
                onClick={() => onStatusChange?.(appointment.id, "Confirmed")}
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                className="inline-flex items-center justify-center p-2 border border-estate-red/30 text-estate-red rounded-lg hover:bg-estate-red-bg transition"
                onClick={() => onStatusChange?.(appointment.id, "Completed")}
                title="Decline / Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {appointment.status === "Confirmed" && (
            <button
              className="w-full inline-flex items-center justify-center gap-1.5 bg-estate-navy text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-estate-navy-mid transition"
              onClick={() => onStatusChange?.(appointment.id, "Completed")}
            >
              Mark Completed
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
