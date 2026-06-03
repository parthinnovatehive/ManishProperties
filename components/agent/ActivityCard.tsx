import { LucideIcon, UserPlus, FileText, Calendar, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  type: "lead" | "inquiry" | "appointment" | "update" | "message";
  title: string;
  description: string;
  time: string;
}

const config = {
  lead: {
    icon: UserPlus,
    color: "text-estate-navy",
    bg: "bg-estate-blue-pale",
  },
  inquiry: {
    icon: FileText,
    color: "text-estate-amber-dark",
    bg: "bg-estate-amber-pale",
  },
  appointment: {
    icon: Calendar,
    color: "text-estate-navy-light",
    bg: "bg-emerald-50",
  },
  update: {
    icon: RefreshCw,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  message: {
    icon: MessageSquare,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
};

interface ActivityCardProps {
  activity: ActivityItem;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const cfg = config[activity.type] || config.update;
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl transition duration-200 hover:bg-estate-surface/60">
      <div className={cn("p-2.5 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bg)}>
        <Icon className={cn("w-4.5 h-4.5", cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-estate-text truncate">{activity.title}</h4>
        <p className="text-xs text-estate-text-sec mt-0.5 line-clamp-2">{activity.description}</p>
        <span className="text-[10px] text-estate-muted font-medium mt-1 inline-block">
          {activity.time}
        </span>
      </div>
    </div>
  );
}
