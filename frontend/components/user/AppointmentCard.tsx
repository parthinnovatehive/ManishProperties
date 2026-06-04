import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  property: string;
  date: string;
  agent: string;
  status: string;
  clientEmail?: string;
  clientPhone?: string;
}

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "success";
    case "pending":
      return "amber";
    case "completed":
      return "muted";
    default:
      return "blue";
  }
};

export default function AppointmentCard({
  property,
  date,
  agent,
  status,
  clientEmail,
  clientPhone,
}: AppointmentCardProps) {
  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        {/* Status Badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant={getStatusVariant(status)} size="sm">
            {status}
          </Badge>
        </div>

        {/* Property Details */}
        <div className="mt-4">
          <h3 className="text-base font-extrabold text-estate-navy tracking-tight truncate">
            {property}
          </h3>
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
              <Mail className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
              <span className="truncate text-estate-text-sec">{agent}</span>
            </div>
            {clientPhone && (
              <div className="flex items-center gap-1.5 text-xs text-estate-text-sec">
                <Phone className="w-3.5 h-3.5 text-estate-muted flex-shrink-0" />
                <span>{clientPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-estate-border my-4" />

        {/* Date & Time */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-estate-text-sec font-semibold">
              <Calendar className="w-3.5 h-3.5 text-estate-muted" />
              <span>{date.split(" at ")[0]}</span>
            </div>
            {date.includes(" at ") && (
              <div className="flex items-center gap-1 text-xs text-estate-text-sec font-semibold">
                <Clock className="w-3.5 h-3.5 text-estate-muted" />
                <span>{date.split(" at ")[1]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}