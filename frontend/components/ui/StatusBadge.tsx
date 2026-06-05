import React from "react";
import { Clock, CheckCircle, XCircle, Check, HelpCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = (status || "").toUpperCase();

  // Premium design color tokens mapping colors & icons
  const config: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    // Green: Active, Approved, Available
    APPROVED: {
      bg: "#E8F5E9",
      color: "#2F8F46",
      icon: <CheckCircle size={13} />,
      label: "Approved",
    },
    ACTIVE: {
      bg: "#E8F5E9",
      color: "#2F8F46",
      icon: <CheckCircle size={13} />,
      label: "Active",
    },
    AVAILABLE: {
      bg: "#E8F5E9",
      color: "#2F8F46",
      icon: <CheckCircle size={13} />,
      label: "Available",
    },
    // Yellow/Orange: Pending
    PENDING: {
      bg: "#F8F4EA",
      color: "#9A7B35",
      icon: <Clock size={13} />,
      label: "Pending",
    },
    // Red: Rejected, Inactive
    REJECTED: {
      bg: "#FFF1F1",
      color: "#B94B4B",
      icon: <XCircle size={13} />,
      label: "Rejected",
    },
    INACTIVE: {
      bg: "#FFF1F1",
      color: "#B94B4B",
      icon: <XCircle size={13} />,
      label: "Inactive",
    },
    // Blue: Sold
    SOLD: {
      bg: "#E3F2FD",
      color: "#0D47A1",
      icon: <Check size={13} />,
      label: "Sold",
    },
  };

  const badgeConfig = config[s] || {
    bg: "#F3F6F2",
    color: "#5D6B61",
    icon: <HelpCircle size={13} />,
    label: status || "Unknown",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: badgeConfig.bg,
        color: badgeConfig.color,
        padding: "4px 12px",
        borderRadius: "99px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
      }}
    >
      {badgeConfig.icon}
      <span>{badgeConfig.label}</span>
    </span>
  );
}

export default StatusBadge;
