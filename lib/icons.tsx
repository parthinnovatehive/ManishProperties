import {
  Award,
  BarChart3,
  Building2,
  Calculator,
  Globe,
  Home,
  Landmark,
  LocateFixed,
  MapPin,
  Sparkles,
  TreePine,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { IconKey } from "@/types";

const iconMap = {
  award: Award,
  barChart: BarChart3,
  building: Building2,
  calculator: Calculator,
  globe: Globe,
  home: Home,
  landmark: Landmark,
  locate: LocateFixed,
  mapPin: MapPin,
  sparkles: Sparkles,
  tree: TreePine,
  trending: TrendingUp,
  users: Users,
  zap: Zap,
} satisfies Record<IconKey, typeof Building2>;

export function ContentIcon({ icon, className, size = 20 }: { icon: IconKey; className?: string; size?: number }) {
  const Icon = iconMap[icon];
  return <Icon aria-hidden="true" className={className} size={size} />;
}
