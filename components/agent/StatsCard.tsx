import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = "text-estate-navy",
  iconBg = "bg-estate-blue-pale",
}: StatsCardProps) {
  return (
    <Card className="p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {change && (
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full",
              isPositive ? "bg-estate-success-bg text-estate-success" : "bg-estate-red-bg text-estate-red"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-estate-navy leading-none tracking-tight">
          {value}
        </div>
        <div className="text-sm font-semibold text-estate-text-sec mt-1.5">{title}</div>
      </div>
    </Card>
  );
}
