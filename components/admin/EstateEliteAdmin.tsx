// @ts-nocheck
// Admin Dashboard Component

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Building2, CheckCircle, Clock, XCircle, Star,
  Users, UserCheck, BarChart3, Settings, LogOut, Search, Bell,
  ChevronDown, Menu, X, Eye, Trash2, Shield, MoreVertical,
  MapPin, Bed, Bath, Maximize2, TrendingUp, ArrowUpRight,
  Filter, RefreshCw, ChevronRight, AlertCircle, CheckSquare,
  Zap, Award, Home, Package, ChevronLeft, Edit, Globe,
  ShieldCheck, SlidersHorizontal, Download, UserCircle, Lock,
  ArrowDown, ArrowUp, MoreHorizontal, Landmark, Check,
  AlertTriangle, Info, ParkingCircle, Sparkles
} from "lucide-react";
import { useAdminProperties } from "@/hooks/useAdminProperties";
import { useToast } from "@/lib/utils/toast";
import { ToastContainer } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

/* ============================================================
   DESIGN SYSTEM — matches EstateElite frontend
============================================================ */
const C = {
  navy: "#164A34", navyMid: "#1E5D3D", navyLight: "#2E7450",
  blue: "#1E5D3D", blueLight: "#66BB6A", bluePale: "#E8F5E9",
  amber: "#66BB6A", amberDark: "#3E7B45", amberPale: "#EFF8EF",
  white: "#FFFFFF", bg: "#F8FAF8", surface: "#F3F6F2",
  text: "#1F2937", textSec: "#5D6B61", muted: "#8A9A90",
  border: "#DDE8DD", borderMed: "#C7D8C8",
  success: "#2F8F46", successBg: "#E8F5E9", successLight: "#DFF0E1",
  warning: "#9A7B35", warningBg: "#F8F4EA", warningLight: "#F1E8C9",
  danger: "#B94B4B", dangerBg: "#FFF1F1", dangerLight: "#FBE2E2",
  info: "#1E5D3D", infoBg: "#E8F5E9",
  sidebar: "#123826",
  sidebarHov: "rgba(255,255,255,0.07)",
  sidebarActive: "rgba(255,255,255,0.12)",
  sidebarBorder: "rgba(255,255,255,0.08)",
  shadow: "0 4px 20px rgba(22,74,52,0.08)",
  shadowMd: "0 12px 34px rgba(22,74,52,0.10)",
  shadowLg: "0 22px 54px rgba(22,74,52,0.12)",
};
const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif" };

/* ============================================================
   MOCK DATA — Realistic admin property moderation data
============================================================ */
/*
const MOCK_PROPERTIES = [
  {
    id: 1, title: "Luxury Sea-View 3BHK Apartment", location: "Worli, Mumbai",
    price: "₹2.85 Cr", priceNum: 28500000, type: "Apartment", beds: 3, baths: 3, area: 1850,
    status: "PENDING", featured: false, submittedBy: "Rahul Sharma", submitterEmail: "rahul@example.com",
    createdAt: "2025-05-14T09:22:00Z", updatedAt: "2025-05-14T09:22:00Z",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&auto=format&q=70",
    rera: "P51800047XXX", views: 0, inquiries: 0,
  },
  {
    id: 2, title: "Modern 4BHK Independent Villa", location: "Whitefield, Bangalore",
    price: "₹1.95 Cr", priceNum: 19500000, type: "Villa", beds: 4, baths: 4, area: 3200,
    status: "APPROVED", featured: true, submittedBy: "Priya Mehta", submitterEmail: "priya@example.com",
    createdAt: "2025-05-12T14:10:00Z", updatedAt: "2025-05-13T10:30:00Z",
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=200&auto=format&q=70",
    rera: "PRM/KA/RERA/XXX", views: 342, inquiries: 18,
  },
  {
    id: 3, title: "Premium 2BHK in Koregaon Park", location: "Koregaon Park, Pune",
    price: "₹42,000/mo", priceNum: 42000, type: "Apartment", beds: 2, baths: 2, area: 1200,
    status: "PENDING", featured: false, submittedBy: "Amit Kulkarni", submitterEmail: "amit@example.com",
    createdAt: "2025-05-15T07:55:00Z", updatedAt: "2025-05-15T07:55:00Z",
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&auto=format&q=70",
    rera: "P52100032XXX", views: 0, inquiries: 0,
  },
  {
    id: 4, title: "Ultra-Luxury Penthouse, DLF Phase 5", location: "Gurugram, Delhi NCR",
    price: "₹8.50 Cr", priceNum: 85000000, type: "Penthouse", beds: 5, baths: 6, area: 6500,
    status: "APPROVED", featured: true, submittedBy: "Vikram Singh", submitterEmail: "vikram@example.com",
    createdAt: "2025-05-10T11:00:00Z", updatedAt: "2025-05-11T15:20:00Z",
    img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&auto=format&q=70",
    rera: "GGM/RERA/XXX", views: 891, inquiries: 45,
  },
  {
    id: 5, title: "Smart Studio near HITEC City", location: "Gachibowli, Hyderabad",
    price: "₹18,000/mo", priceNum: 18000, type: "Studio", beds: 1, baths: 1, area: 550,
    status: "REJECTED", featured: false, submittedBy: "Sneha Reddy", submitterEmail: "sneha@example.com",
    createdAt: "2025-05-13T16:40:00Z", updatedAt: "2025-05-14T09:00:00Z",
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&auto=format&q=70",
    rera: "P01400006XXX", views: 0, inquiries: 0, rejectReason: "Incomplete documentation — RERA certificate missing",
  },
  {
    id: 6, title: "Grade A Commercial Office — BKC", location: "Bandra Kurla Complex, Mumbai",
    price: "₹1.20 L/mo", priceNum: 120000, type: "Commercial", beds: 0, baths: 4, area: 4500,
    status: "APPROVED", featured: false, submittedBy: "Rohan Malhotra", submitterEmail: "rohan@example.com",
    createdAt: "2025-05-09T13:30:00Z", updatedAt: "2025-05-10T11:00:00Z",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&auto=format&q=70",
    rera: "P51900000XXX", views: 214, inquiries: 11,
  },
  {
    id: 7, title: "Farmhouse with Private Pool", location: "Alibag, Maharashtra",
    price: "₹4.20 Cr", priceNum: 42000000, type: "Farmhouse", beds: 6, baths: 5, area: 8500,
    status: "PENDING", featured: false, submittedBy: "Kavya Nair", submitterEmail: "kavya@example.com",
    createdAt: "2025-05-15T10:15:00Z", updatedAt: "2025-05-15T10:15:00Z",
    img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&auto=format&q=70",
    rera: "P99800001XXX", views: 0, inquiries: 0,
  },
  {
    id: 8, title: "Luxury 3BHK in Jubilee Hills", location: "Jubilee Hills, Hyderabad",
    price: "₹1.80 Cr", priceNum: 18000000, type: "Apartment", beds: 3, baths: 3, area: 2100,
    status: "APPROVED", featured: false, submittedBy: "Arjun Reddy", submitterEmail: "arjun@example.com",
    createdAt: "2025-05-08T09:00:00Z", updatedAt: "2025-05-09T14:30:00Z",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&auto=format&q=70",
    rera: "P01400022XXX", views: 178, inquiries: 9,
  },
  {
    id: 9, title: "Commercial Plot — IT Corridor", location: "OMR, Chennai",
    price: "₹3.50 Cr", priceNum: 35000000, type: "Plot", beds: 0, baths: 0, area: 7200,
    status: "REJECTED", featured: false, submittedBy: "Sundar Krishnan", submitterEmail: "sundar@example.com",
    createdAt: "2025-05-11T08:20:00Z", updatedAt: "2025-05-12T10:00:00Z",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&auto=format&q=70",
    rera: null, views: 0, inquiries: 0, rejectReason: "Fraudulent ownership documents detected — flagged for legal review",
  },
  {
    id: 10, title: "Row House in Premium Township", location: "Hinjewadi, Pune",
    price: "₹95 L", priceNum: 9500000, type: "Row House", beds: 3, baths: 2, area: 1650,
    status: "PENDING", featured: false, submittedBy: "Meera Joshi", submitterEmail: "meera@example.com",
    createdAt: "2025-05-15T12:00:00Z", updatedAt: "2025-05-15T12:00:00Z",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&auto=format&q=70",
    rera: "P52200044XXX", views: 0, inquiries: 0,
  },
  {
    id: 11, title: "Sea-Facing Duplex Penthouse", location: "Bandra West, Mumbai",
    price: "₹12.50 Cr", priceNum: 125000000, type: "Penthouse", beds: 4, baths: 5, area: 5800,
    status: "APPROVED", featured: true, submittedBy: "Kiran Shah", submitterEmail: "kiran@example.com",
    createdAt: "2025-05-07T16:00:00Z", updatedAt: "2025-05-08T10:00:00Z",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&q=70",
    rera: "P51800099XXX", views: 1240, inquiries: 67,
  },
  {
    id: 12, title: "Gated Villa Community — 4 BHK", location: "Sarjapur Road, Bangalore",
    price: "₹2.40 Cr", priceNum: 24000000, type: "Villa", beds: 4, baths: 4, area: 3800,
    status: "PENDING", featured: false, submittedBy: "Deepika Rao", submitterEmail: "deepika@example.com",
    createdAt: "2025-05-15T14:30:00Z", updatedAt: "2025-05-15T14:30:00Z",
    img: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=200&auto=format&q=70",
    rera: "PRM/KA/RERA/5678/XXX", views: 0, inquiries: 0,
  },
];
*/

const MOCK_USERS = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", role: "AGENT", listings: 8, joined: "2024-11-15", verified: true, status: "ACTIVE" },
  { id: 2, name: "Priya Mehta", email: "priya@example.com", role: "AGENT", listings: 12, joined: "2024-09-22", verified: true, status: "ACTIVE" },
  { id: 3, name: "Arjun Kapoor", email: "arjun@example.com", role: "BUYER", listings: 0, joined: "2025-01-10", verified: true, status: "ACTIVE" },
  { id: 4, name: "Vikram Singh", email: "vikram@example.com", role: "AGENT", listings: 5, joined: "2024-12-01", verified: false, status: "PENDING" },
  { id: 5, name: "Sneha Reddy", email: "sneha@example.com", role: "AGENT", listings: 3, joined: "2025-02-18", verified: true, status: "SUSPENDED" },
];

const LOCATION_HIERARCHY = {
  Maharashtra: {
    Mumbai: ["Worli", "Bandra West", "Bandra Kurla Complex", "Powai", "Andheri West"],
    Pune: ["Baner", "Koregaon Park", "Hinjewadi", "Kalyani Nagar"],
    Alibag: ["Alibag", "Mandwa", "Nagaon"],
  },
  Karnataka: {
    Bangalore: ["Whitefield", "Sarjapur Road", "Indiranagar", "Hebbal"],
  },
  Telangana: {
    Hyderabad: ["Gachibowli", "Jubilee Hills", "HITEC City", "Banjara Hills"],
  },
  "Delhi NCR": {
    Gurugram: ["DLF Phase 5", "Golf Course Road", "Cyber City"],
    "Delhi NCR": ["Noida", "Greater Noida", "Dwarka"],
  },
  "Tamil Nadu": {
    Chennai: ["OMR", "Adyar", "Anna Nagar"],
  },
};

const LOCATION_INDEX = Object.entries(LOCATION_HIERARCHY).flatMap(([state, cities]) =>
  Object.entries(cities).flatMap(([city, areas]) => areas.map((area) => ({ state, city, area }))),
);

/* ============================================================
   UTILITY FUNCTIONS
============================================================ */
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const getPropertyLocationMeta = (property) => {
  const haystack = `${property.location} ${property.title}`.toLowerCase();
  const match = LOCATION_INDEX.find(({ city, area }) =>
    haystack.includes(area.toLowerCase()) || haystack.includes(city.toLowerCase()),
  );

  if (match) return match;

  const stateMatch = Object.keys(LOCATION_HIERARCHY).find((state) => haystack.includes(state.toLowerCase()));
  return { state: stateMatch || "", city: "", area: "" };
};

/* ============================================================
   SHARED UI COMPONENTS
============================================================ */
function StatusBadge({ status }) {
  const cfg = {
    PENDING: { bg: C.warningLight, color: C.warning, icon: <Clock size={11}/>, label: "Pending" },
    APPROVED: { bg: C.successLight, color: C.success, icon: <CheckCircle size={11}/>, label: "Approved" },
    REJECTED: { bg: C.dangerLight, color: C.danger, icon: <XCircle size={11}/>, label: "Rejected" },
  }[status] || { bg: C.border, color: C.muted, icon: null, label: status };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.amberPale, color: C.amberDark, padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
      <Star size={10} fill={C.amberDark}/> Featured
    </span>
  );
}


function ConfirmModal({ modal, onConfirm, onClose }) {
  if (!modal) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 420, width: "100%", boxShadow: C.shadowLg }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: modal.type === "danger" ? C.dangerBg : C.warningBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          {modal.type === "danger" ? <Trash2 size={24} color={C.danger}/> : <AlertTriangle size={24} color={C.warning}/>}
        </div>
        <h3 style={{ fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 8 }}>{modal.title}</h3>
        <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.65, marginBottom: 24 }}>{modal.message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: `1.5px solid ${C.border}`, borderRadius: 9, background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.textSec }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "10px 20px", border: "none", borderRadius: 9, background: modal.type === "danger" ? C.danger : C.warning, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
            {modal.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR
============================================================ */
const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, section: "main" },
  { id: "moderation", label: "All Properties", icon: Building2, section: "properties", badge: null },
  { id: "pending", label: "Pending Review", icon: Clock, section: "properties", badge: "pending" },
  { id: "approved", label: "Approved", icon: CheckCircle, section: "properties" },
  { id: "rejected", label: "Rejected", icon: XCircle, section: "properties" },
  { id: "featured", label: "Featured", icon: Star, section: "properties" },
  { id: "users", label: "Users", icon: Users, section: "people" },
  { id: "agents", label: "Agents", icon: UserCheck, section: "people" },
  { id: "analytics", label: "Analytics", icon: BarChart3, section: "system" },
  { id: "settings", label: "Settings", icon: Settings, section: "system" },
];

function Sidebar({ active, setActive, collapsed, setCollapsed, pendingCount }) {
  const sections = [
    { key: "main", label: null },
    { key: "properties", label: "Properties" },
    { key: "people", label: "People" },
    { key: "system", label: "System" },
  ];

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    router.push("/auth");
  };

  return (
    <aside style={{ width: collapsed ? 76 : 260, background: C.sidebar, display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden", position: "relative", zIndex: 100, boxShadow: "8px 0 30px rgba(18,56,38,0.18)" }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 16px" : "20px 22px", borderBottom: `1px solid ${C.sidebarBorder}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, background: C.blue, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 size={18} color="#fff"/>
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ ...serif, fontWeight: 700, fontSize: 17, color: "#fff", whiteSpace: "nowrap" }}>EstateElite</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin Console</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", overflowX: "hidden" }}>
        {sections.map(sec => {
          const items = NAV_ITEMS.filter(n => n.section === sec.key);
          return (
            <div key={sec.key} style={{ marginBottom: 4 }}>
              {sec.label && !collapsed && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 10px 6px" }}>{sec.label}</div>
              )}
              {items.map(item => {
                const isActive = active === item.id;
                const count = item.badge === "pending" ? pendingCount : null;
                return (
                  <button key={item.id} onClick={() => setActive(item.id)}
                    title={collapsed ? item.label : undefined}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "11px 14px" : "11px 12px", borderRadius: 12, border: "none", cursor: "pointer", marginBottom: 4, transition: "all 0.18s", background: isActive ? C.sidebarActive : "transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.64)", borderLeft: isActive ? `3px solid ${C.amber}` : "3px solid transparent", justifyContent: collapsed ? "center" : "flex-start" }}>
                    <item.icon size={17} style={{ flexShrink: 0 }}/>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap", textAlign: "left" }}>{item.label}</span>
                        {count > 0 && <span style={{ background: C.amber, color: C.navy, fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99, flexShrink: 0 }}>{count}</span>}
                      </>
                    )}
                  </button>
                );
              })}
              {sec.key !== "system" && <div style={{ height: 1, background: C.sidebarBorder, margin: "8px 4px" }}/>}
            </div>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div style={{ padding: collapsed ? "14px 12px" : "14px 16px", borderTop: `1px solid ${C.sidebarBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.navyLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 13, color: "#fff" }}>SA</div>
        {!collapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Super Admin</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>admin@estateelite.in</div>
          </div>
        )}
        {!collapsed && <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <LogOut
            size={16}
            color="rgba(255,255,255,0.35)"
            style={{ flexShrink: 0 }}
          />
        </button>}
      </div>
    </aside>
  );
}

/* ============================================================
   TOP BAR
============================================================ */
function TopBar({ active, collapsed, setCollapsed, searchQuery, setSearchQuery, properties }) {
  const [showNotif, setShowNotif] = useState(false);
  const pending = properties.filter(p => p.status === "PENDING");
  const breadcrumbs = {
    overview: ["Dashboard"],
    moderation: ["Dashboard", "All Properties"],
    pending: ["Dashboard", "Pending Review"],
    approved: ["Dashboard", "Approved"],
    rejected: ["Dashboard", "Rejected"],
    featured: ["Dashboard", "Featured"],
    users: ["Dashboard", "Users"],
    agents: ["Dashboard", "Agents"],
    analytics: ["Dashboard", "Analytics"],
    settings: ["Dashboard", "Settings"],
  };

  return (
    <header style={{ height: 72, background: "rgba(255,255,255,0.94)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 10px 30px rgba(22,74,52,0.05)", backdropFilter: "blur(18px)" }}>
      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(c => !c)} style={{ width: 38, height: 38, border: `1.5px solid ${C.border}`, borderRadius: 12, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: C.shadow }}>
        <Menu size={16} color={C.textSec}/>
      </button>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
        {(breadcrumbs[active] || ["Dashboard"]).map((crumb, i, arr) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: i === arr.length - 1 ? 700 : 500, color: i === arr.length - 1 ? C.navy : C.muted }}>{crumb}</span>
            {i < arr.length - 1 && <ChevronRight size={14} color={C.muted}/>}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }}/>

      {/* Search */}
      {["moderation", "pending", "approved", "rejected", "featured"].includes(active) && (
        <div style={{ position: "relative", width: 300 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.muted }}/>
          <input placeholder="Search properties…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 14px 10px 38px", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 13, color: C.text, outline: "none", background: C.bg }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
      )}

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowNotif(v => !v)} style={{ width: 38, height: 38, border: `1.5px solid ${C.border}`, borderRadius: 12, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: C.shadow }}>
          <Bell size={16} color={C.textSec}/>
          {pending.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 17, height: 17, background: C.danger, borderRadius: "50%", fontSize: 10, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{pending.length}</span>}
        </button>
        {showNotif && (
          <div style={{ position: "absolute", top: 44, right: 0, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowLg, width: 320, zIndex: 200 }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>Notifications</div>
              <span style={{ fontSize: 12, color: C.blue, cursor: "pointer", fontWeight: 600 }}>Mark all read</span>
            </div>
            {pending.slice(0, 4).map(p => (
              <div key={p.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber, flexShrink: 0, marginTop: 5 }}/>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>New listing pending review</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{timeAgo(p.createdAt)}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: "10px 16px", textAlign: "center", fontSize: 13, color: C.blue, cursor: "pointer", fontWeight: 600 }}>View all notifications</div>
          </div>
        )}
      </div>

      {/* Role badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 13px", background: C.bluePale, borderRadius: 14, border: `1px solid ${C.blue}22` }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>SA</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Super Admin</div>
          <div style={{ fontSize: 10, color: C.blue, fontWeight: 600 }}>● Online</div>
        </div>
        <ChevronDown size={13} color={C.blue}/>
      </div>
    </header>
  );
}

/* ============================================================
   LOCATION FILTERS
============================================================ */
function LocationFilterPanel({ value, onChange, onClear, resultCount }) {
  const states = Object.keys(LOCATION_HIERARCHY);
  const cities = value.state
    ? Object.keys(LOCATION_HIERARCHY[value.state] || {})
    : [...new Set(LOCATION_INDEX.map(item => item.city))];
  const areas = value.city
    ? LOCATION_INDEX.filter(item => item.city === value.city).map(item => item.area)
    : value.state
      ? Object.values(LOCATION_HIERARCHY[value.state] || {}).flat()
      : LOCATION_INDEX.map(item => item.area);

  const setStateFilter = (nextState) => onChange({ state: nextState, city: "", area: "" });
  const setCityFilter = (nextCity) => {
    const nextState = value.state || LOCATION_INDEX.find(item => item.city === nextCity)?.state || "";
    onChange({ state: nextState, city: nextCity, area: "" });
  };
  const setAreaFilter = (nextArea) => {
    const match = LOCATION_INDEX.find(item => item.area === nextArea);
    onChange({
      state: value.state || match?.state || "",
      city: value.city || match?.city || "",
      area: nextArea,
    });
  };

  const fieldStyle = {
    width: "100%",
    padding: "11px 36px 11px 38px",
    border: `1.5px solid ${C.border}`,
    borderRadius: 14,
    background: "#fff",
    color: C.text,
    fontSize: 13,
    fontWeight: 600,
    outline: "none",
    transition: "all 0.18s ease",
  };
  const inputWrap = { position: "relative" };
  const labelStyle = { display: "block", marginBottom: 8, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: C.muted, textTransform: "uppercase" };

  return (
    <section style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, marginBottom: 24, boxShadow: C.shadow }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ ...serif, fontSize: 21, fontWeight: 700, color: C.navy, marginBottom: 3 }}>Location Filters</div>
          <div style={{ fontSize: 13, color: C.textSec }}>{resultCount} listings in the current view</div>
        </div>
        <button
          onClick={onClear}
          style={{ border: `1.5px solid ${C.border}`, background: C.bg, color: C.navy, borderRadius: 12, padding: "9px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
        >
          Clear Location
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        <label>
          <span style={labelStyle}>State</span>
          <span style={inputWrap}>
            <MapPin size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.blue }} />
            <input
              list="admin-state-options"
              value={value.state}
              onChange={e => setStateFilter(e.target.value)}
              placeholder="Select state"
              style={fieldStyle}
              onFocus={e => { e.target.style.borderColor = C.navy; e.target.style.boxShadow = `0 0 0 4px ${C.bluePale}`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
            />
            <ChevronDown size={14} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
          </span>
          <datalist id="admin-state-options">
            {states.map(state => <option key={state} value={state} />)}
          </datalist>
        </label>

        <label>
          <span style={labelStyle}>City</span>
          <span style={inputWrap}>
            <Building2 size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.blue }} />
            <input
              list="admin-city-options"
              value={value.city}
              onChange={e => setCityFilter(e.target.value)}
              placeholder="Select city"
              style={fieldStyle}
              onFocus={e => { e.target.style.borderColor = C.navy; e.target.style.boxShadow = `0 0 0 4px ${C.bluePale}`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
            />
            <ChevronDown size={14} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
          </span>
          <datalist id="admin-city-options">
            {cities.map(city => <option key={city} value={city} />)}
          </datalist>
        </label>

        <label>
          <span style={labelStyle}>Area / Locality</span>
          <span style={inputWrap}>
            <Landmark size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.blue }} />
            <input
              list="admin-area-options"
              value={value.area}
              onChange={e => setAreaFilter(e.target.value)}
              placeholder="Select area"
              style={fieldStyle}
              onFocus={e => { e.target.style.borderColor = C.navy; e.target.style.boxShadow = `0 0 0 4px ${C.bluePale}`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
            />
            <ChevronDown size={14} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
          </span>
          <datalist id="admin-area-options">
            {areas.map(area => <option key={area} value={area} />)}
          </datalist>
        </label>
      </div>
    </section>
  );
}

/* ============================================================
   STATS CARDS
============================================================ */
function StatsGrid({ properties }) {
  const stats = [
    { label: "Total Properties", value: properties.length, icon: <Building2 size={20}/>, color: C.blue, bg: C.bluePale, delta: "+12 this week" },
    { label: "Pending Review", value: properties.filter(p => p.status === "PENDING").length, icon: <Clock size={20}/>, color: C.warning, bg: C.warningLight, delta: "Needs attention", urgent: true },
    { label: "Approved", value: properties.filter(p => p.status === "APPROVED").length, icon: <CheckCircle size={20}/>, color: C.success, bg: C.successLight, delta: "+3 today" },
    { label: "Rejected", value: properties.filter(p => p.status === "REJECTED").length, icon: <XCircle size={20}/>, color: C.danger, bg: C.dangerLight, delta: "2 flagged" },
    { label: "Featured", value: properties.filter(p => p.featured).length, icon: <Star size={20}/>, color: C.amber, bg: C.amberPale, delta: "Premium slots" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20, marginBottom: 28 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 20, border: `1px solid ${C.border}`, padding: "24px", transition: "all 0.2s", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: C.shadow }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = C.shadowMd; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
          {s.urgent && <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 20px 20px 0", borderColor: `transparent ${C.amber} transparent transparent` }}/>}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontSize: 11, color: s.urgent ? C.warning : C.success, fontWeight: 600 }}>{s.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PROPERTY ROW ACTIONS MENU
============================================================ */
function ActionMenu({ property, onApprove, onReject, onFeature, onDelete, onView, disabled = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button disabled={disabled} onClick={e => { e.stopPropagation(); if (!disabled) setOpen(v => !v); }}
        style={{ width: 32, height: 32, border: `1.5px solid ${C.border}`, borderRadius: 12, background: "#fff", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: C.shadow }}>
        <MoreVertical size={15} color={C.textSec}/>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setOpen(false)}/>
          <div style={{ position: "absolute", right: 0, top: 36, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: C.shadowLg, zIndex: 9999, minWidth: 175, overflow: "hidden" }}>
            {[
              { label: "View Details", icon: <Eye size={14}/>, action: () => { onView(property); setOpen(false); }, color: C.text },
              { label: "Approve", icon: <CheckCircle size={14}/>, action: () => { onApprove(property.id); setOpen(false); }, color: C.success, hide: property.status === "APPROVED" },
              { label: "Reject", icon: <XCircle size={14}/>, action: () => { onReject(property.id); setOpen(false); }, color: C.danger, hide: property.status === "REJECTED" },
              { label: property.featured ? "Remove Featured" : "Mark as Featured", icon: <Star size={14}/>, action: () => { onFeature(property.id); setOpen(false); }, color: C.amber },
              { label: "Delete Property", icon: <Trash2 size={14}/>, action: () => { onDelete(property.id); setOpen(false); }, color: C.danger, divider: true },
            ].filter(a => !a.hide).map((a, i) => (
              <button key={i} disabled={disabled} onClick={a.action}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "transparent", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, fontSize: 13, fontWeight: 500, color: a.color, transition: "background 0.12s", borderTop: a.divider ? `1px solid ${C.border}` : "none", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.background = a.color === C.danger ? C.dangerBg : C.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   PROPERTY DETAIL DRAWER
============================================================ */
function PropertyDrawer({ property, onClose, onApprove, onReject, onFeature, actionLoading = false }) {
  if (!property) return null;
  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 800 }} onClick={onClose}/>
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 480, background: "#fff", zIndex: 900, boxShadow: "-4px 0 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Property Review</div>
            <div style={{ fontSize: 12, color: C.muted }}>ID: #{property.id}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16}/></button>
        </div>

        {/* Image */}
        <div style={{ position: "relative", height: 220 }}>
          <img src={property.img} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=70"}/>
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8 }}>
            <StatusBadge status={property.status}/>
            {property.featured && <FeaturedBadge/>}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 24, flex: 1 }}>
          <h3 style={{ ...serif, fontSize: 20, color: C.navy, marginBottom: 6 }}>{property.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.textSec, fontSize: 14, marginBottom: 16 }}>
            <MapPin size={14} style={{ color: C.blue }}/> {property.location}
          </div>

          {/* Key specs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { icon: <Maximize2 size={14}/>, label: "Area", value: `${property.area.toLocaleString()} ft²` },
              { icon: <Bed size={14}/>, label: "Beds", value: property.beds > 0 ? property.beds : "N/A" },
              { icon: <Bath size={14}/>, label: "Baths", value: property.baths > 0 ? property.baths : "N/A" },
            ].map((spec, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ color: C.blue, display: "flex", justifyContent: "center", marginBottom: 4 }}>{spec.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{spec.value}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{spec.label}</div>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div style={{ background: C.bg, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            {[
              ["Price", property.price],
              ["Type", property.type],
              ["RERA No.", property.rera || "Not provided"],
              ["Submitted by", property.submittedBy],
              ["Email", property.submitterEmail],
              ["Submitted", formatDate(property.createdAt)],
              ["Views", property.views.toLocaleString()],
              ["Inquiries", property.inquiries],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < 7 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "#fff" : C.bg }}>
                <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: k === "Email" ? C.blue : C.text }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Reject reason */}
          {property.status === "REJECTED" && property.rejectReason && (
            <div style={{ background: C.dangerBg, border: `1px solid ${C.dangerLight}`, borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: C.danger, marginBottom: 4 }}>REJECTION REASON</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{property.rejectReason}</div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div style={{ padding: 20, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, flexShrink: 0, background: "#fff" }}>
          {property.status !== "APPROVED" && (
            <button disabled={actionLoading} onClick={() => { onApprove(property.id); onClose(); }}
              style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, background: C.success, color: "#fff", cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.65 : 1, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <CheckCircle size={16}/> Approve
            </button>
          )}
          {property.status !== "REJECTED" && (
            <button disabled={actionLoading} onClick={() => { onReject(property.id); onClose(); }}
              style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, background: C.danger, color: "#fff", cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.65 : 1, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <XCircle size={16}/> Reject
            </button>
          )}
          <button disabled={actionLoading} onClick={() => { onFeature(property.id); onClose(); }}
            style={{ width: 44, height: 44, border: `1.5px solid ${C.amber}`, borderRadius: 10, background: C.amberPale, color: C.amber, cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Star size={16} fill={property.featured ? C.amber : "none"}/>
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   PROPERTY TABLE
============================================================ */
function PropertyTable({ properties, onApprove, onReject, onFeature, onDelete, onView, loading, filterStatus, mutationState }) {
  const displayed = properties;

  const cols = ["Property", "Price & Type", "Size", "Status", "Submitted", "Actions"];

  if (loading) {
    return (
      <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${C.border}`, overflow: "visible", boxShadow: C.shadow, position: "relative", zIndex: 1 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 56, height: 44, borderRadius: 8, background: C.bg, animation: "pulse 1.5s infinite" }}/>
            <div style={{ flex: 1 }}>
              <div style={{ height: 13, width: "60%", background: C.bg, borderRadius: 4, marginBottom: 6, animation: "pulse 1.5s infinite" }}/>
              <div style={{ height: 11, width: "40%", background: C.bg, borderRadius: 4, animation: "pulse 1.5s infinite" }}/>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${C.border}`, padding: "72px 24px", textAlign: "center", boxShadow: C.shadow }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Package size={28} color={C.muted}/>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 6 }}>No properties found</div>
        <div style={{ fontSize: 14, color: C.muted }}>No properties match the current filter criteria</div>
      </div>  
    );
  }

return (
  <div
    style={{
      background: "#fff",
      borderRadius: 20,
      border: `1px solid ${C.border}`,
      overflow: "visible",
      position: "relative",
      zIndex: 1,
      boxShadow: C.shadow,
    }}
  >
    {/* Table header */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 1fr auto",
        gap: 0,
        padding: "14px 22px",
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        position: "relative",
        zIndex: 1,
      }}
    >
      {cols.map((col, i) => (
        <div
          key={i}
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.muted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {col}
        </div>
      ))}
    </div>

    {/* Rows */}
    {displayed.map((prop, idx) => (
      <div
        key={prop.id}
        style={{
          display: "grid",
          gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 1fr auto",
          gap: 0,
          padding: "16px 22px",
          borderBottom:
            idx < displayed.length - 1
              ? `1px solid ${C.border}`
              : "none",
          alignItems: "center",
          transition: "background 0.18s ease",
          cursor: "pointer",

          position: "relative",
          isolation: "isolate",
          zIndex: 1,
          overflow: "visible",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.bg;
          e.currentTarget.style.zIndex = "999";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.zIndex = "1";
        }}
        onClick={() => onView(prop)}
      >

          {/* Property */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={prop.img} alt={prop.title}
              style={{ width: 60, height: 48, borderRadius: 14, objectFit: "cover", flexShrink: 0, border: `1px solid ${C.border}` }}
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=70"; }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{prop.title}</div>
              <div style={{ fontSize: 12, color: C.textSec, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={11} style={{ color: C.blue, flexShrink: 0 }}/> {prop.location}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>by {prop.submittedBy}</div>
            </div>
          </div>

          {/* Price & Type */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.navy, marginBottom: 3 }}>{prop.price}</div>
            <span style={{ display: "inline-block", background: C.bluePale, color: C.blue, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{prop.type}</span>
            {prop.featured && <div style={{ marginTop: 4 }}><FeaturedBadge/></div>}
          </div>

          {/* Size */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{prop.area.toLocaleString()} ft²</div>
            {prop.beds > 0 && <div style={{ fontSize: 12, color: C.muted }}>{prop.beds}B / {prop.baths}Ba</div>}
          </div>

          {/* Status */}
          <div onClick={e => e.stopPropagation()}>
            <StatusBadge status={prop.status}/>
            {prop.status === "REJECTED" && prop.rejectReason && (
              <div style={{ marginTop: 4, fontSize: 11, color: C.danger, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={prop.rejectReason}>
                ⚠ {prop.rejectReason.slice(0, 30)}…
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{formatDate(prop.createdAt)}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{timeAgo(prop.createdAt)}</div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={e => e.stopPropagation()}>
            {prop.status === "PENDING" && (
              <>
                <button disabled={mutationState?.[prop.id]?.loading} onClick={() => onApprove(prop.id)}
                  style={{ padding: "5px 10px", border: "none", borderRadius: 6, background: C.successLight, color: C.success, cursor: mutationState?.[prop.id]?.loading ? "not-allowed" : "pointer", opacity: mutationState?.[prop.id]?.loading ? 0.6 : 1, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={12}/> OK
                </button>
                <button disabled={mutationState?.[prop.id]?.loading} onClick={() => onReject(prop.id)}
                  style={{ padding: "5px 10px", border: "none", borderRadius: 6, background: C.dangerLight, color: C.danger, cursor: mutationState?.[prop.id]?.loading ? "not-allowed" : "pointer", opacity: mutationState?.[prop.id]?.loading ? 0.6 : 1, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <X size={12}/> Reject
                </button>
              </>
            )}
            <ActionMenu property={prop} onApprove={onApprove} onReject={onReject} onFeature={onFeature} onDelete={onDelete} onView={onView} disabled={mutationState?.[prop.id]?.loading}/>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   OVERVIEW PAGE
============================================================ */
function OverviewPage({ properties, onSetActive }) {
  const recent = [...properties].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const pending = properties.filter(p => p.status === "PENDING");
  const approved = properties.filter(p => p.status === "APPROVED");
  const rejected = properties.filter(p => p.status === "REJECTED");

  return (
    <div>
      <StatsGrid properties={properties}/>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        {/* Recent submissions */}
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>Recent Submissions</div>
            <button onClick={() => onSetActive("moderation")} style={{ fontSize: 12, color: C.blue, fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>View All <ArrowUpRight size={13}/></button>
          </div>
          {recent.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < recent.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              <img src={p.img} alt="" style={{ width: 44, height: 36, borderRadius: 7, objectFit: "cover", border: `1px solid ${C.border}` }}
                onError={e => e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=70"}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div style={{ fontSize: 12, color: C.textSec }}>{p.location} · {p.price}</div>
              </div>
              <StatusBadge status={p.status}/>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Status breakdown */}
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 16 }}>Moderation Status</div>
            {[
              { label: "Approved", count: approved.length, total: properties.length, color: C.success, bg: C.successLight, icon: <CheckCircle size={15}/> },
              { label: "Pending", count: pending.length, total: properties.length, color: C.warning, bg: C.warningLight, icon: <Clock size={15}/> },
              { label: "Rejected", count: rejected.length, total: properties.length, color: C.danger, bg: C.dangerLight, icon: <XCircle size={15}/> },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: C.text }}><span style={{ color: s.color }}>{s.icon}</span>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.count}</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${(s.count / s.total) * 100}%`, height: "100%", background: s.color, borderRadius: 99, transition: "width 0.6s ease" }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Quick Actions</div>
            {[
              { label: `Review ${pending.length} pending`, icon: <Clock size={15}/>, color: C.warning, bg: C.warningLight, action: "pending" },
              { label: "Manage featured slots", icon: <Star size={15}/>, color: C.amber, bg: C.amberPale, action: "featured" },
              { label: "View all agents", icon: <UserCheck size={15}/>, color: C.blue, bg: C.bluePale, action: "agents" },
            ].map((a, i) => (
              <button key={i} onClick={() => onSetActive(a.action)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 9, background: "#fff", cursor: "pointer", marginBottom: i < 2 ? 8 : 0, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.borderColor = a.color + "44"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.border; }}>
                <span style={{ color: a.color }}>{a.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1, textAlign: "left" }}>{a.label}</span>
                <ChevronRight size={14} color={C.muted}/>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   USERS PAGE
============================================================ */
function UsersPage({ users }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 2 }}>User Management</h2>
          <div style={{ fontSize: 13, color: C.muted }}>{users.length} registered users</div>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", border: "none", borderRadius: 9, background: C.navy, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          <Download size={14}/> Export CSV
        </button>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "12px 20px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          {["User", "Contact", "Role", "Listings", "Status"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {users.map((user, i) => (
          <div key={user.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center", transition: "background 0.12s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.bg}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.navyMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>{user.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Joined {formatDate(user.joined)}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.blue }}>{user.email}</div>
            <span style={{ display: "inline-block", background: user.role === "AGENT" ? C.bluePale : C.bg, color: user.role === "AGENT" ? C.blue : C.textSec, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{user.role}</span>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{user.listings}</div>
            <span style={{ display: "inline-block", background: user.status === "ACTIVE" ? C.successLight : user.status === "SUSPENDED" ? C.dangerLight : C.warningLight, color: user.status === "ACTIVE" ? C.success : user.status === "SUSPENDED" ? C.danger : C.warning, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{user.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   PLACEHOLDER PAGES
============================================================ */
function PlaceholderPage({ title, icon, description }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center", gap: 16 }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: C.bluePale, display: "flex", alignItems: "center", justifyContent: "center", color: C.blue }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 20, color: C.navy, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, color: C.muted, maxWidth: 340 }}>{description}</div>
      </div>
      <div style={{ padding: "8px 20px", background: C.navy, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Coming Soon</div>
    </div>
  );
}

/* ============================================================
   MAIN APP
============================================================ */
export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const { properties, loading, error, mutationState, approveProperty, rejectProperty, featureProperty, deleteProperty } = useAdminProperties();
  const toast = useToast();
  const [users] = useState(MOCK_USERS);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [locationFilters, setLocationFilters] = useState({ state: "", city: "", area: "" });
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/auth");
    }
  }, []);

  // Handle initial errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  // Sync drawer with properties array when properties change
  useEffect(() => {
    if (drawer) {
      const updatedProperty = properties.find((p) => p.id === drawer.id);
      if (updatedProperty) {
        setDrawer(updatedProperty);
      } else {
        setDrawer(null);
      }
    }
  }, [properties]);

  const handleApprove = useCallback(async (id: string | number) => {
    try {
      await approveProperty(id);
      toast.success("Property Approved", 2000);
    } catch (err) {
      toast.error(err?.message || "Failed to approve property");
    }
  }, [approveProperty, toast]);

  const handleReject = useCallback((id: string | number) => {
    setModal({
      type: "warning",
      title: "Reject this listing?",
      message: "This will mark the property as rejected and notify the owner. You can approve it later if needed.",
      confirmLabel: "Yes, Reject",
      onConfirm: async () => {
        try {
          await rejectProperty(id);
          setModal(null);
          toast.success("Property Rejected", 2000);
        } catch (err) {
          toast.error(err?.message || "Failed to reject property");
        }
      },
    });
  }, [rejectProperty, toast]);

  const handleFeature = useCallback(async (id: string | number) => {
    try {
      const prop = properties.find(p => p.id === id);
      if (!prop) {
        toast.error("Property not found in the current list");
        return;
      }
      const newFeaturedStatus = !(prop?.featured);
      await featureProperty(id, newFeaturedStatus);
      toast.success(newFeaturedStatus ? "Marked as Featured" : "Removed from Featured", 2000);
    } catch (err) {
      toast.error(err?.message || "Failed to update property");
    }
  }, [featureProperty, properties, toast]);

  const handleDelete = useCallback((id: string | number) => {
    setModal({
      type: "danger",
      title: "Delete this property?",
      message: "This action is permanent and cannot be undone. The listing will be removed from the platform immediately.",
      confirmLabel: "Delete Permanently",
      onConfirm: async () => {
        try {
          await deleteProperty(id);
          setModal(null);
          toast.success("Property Deleted", 2000);
        } catch (err) {
          toast.error(err?.message || "Failed to delete property");
        }
      },
    });
  }, [deleteProperty, toast]);

  const handleView = useCallback((prop) => {
    setDrawer(prop);
  }, []);

  // Filter properties for table
  const filterMap = { moderation: "all", pending: "PENDING", approved: "APPROVED", rejected: "REJECTED", featured: "featured" };
  const currentFilter = filterMap[active] || "all";
  const filteredProperties = properties.filter(p => {
    const q = search.toLowerCase();
    const searchable = [p.title, p.location, p.submittedBy, p.type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = !search || searchable.includes(q);
    if (!matchesSearch) return false;

    const location = getPropertyLocationMeta(p);
    if (locationFilters.state && location.state !== locationFilters.state) return false;
    if (locationFilters.city && location.city !== locationFilters.city) return false;
    if (locationFilters.area && location.area !== locationFilters.area) return false;

    // Apply status filter to filteredProperties (source of truth)
    if (currentFilter === "featured") {
      if (!p.featured) return false;
    } else if (currentFilter !== "all") {
      if (p.status !== currentFilter) return false;
    }

    return true;
  });

  const isTablePage = ["moderation", "pending", "approved", "rejected", "featured"].includes(active);
  const pendingCount = properties.filter(p => p.status === "PENDING").length;

  const sectionTitles = {
    moderation: { title: "All Properties", sub: `${filteredProperties.length} total listings` },
    pending: { title: "Pending Review", sub: `${filteredProperties.length} awaiting moderation` },
    approved: { title: "Approved Listings", sub: `${filteredProperties.length} live on platform` },
    rejected: { title: "Rejected Listings", sub: `${filteredProperties.length} rejected` },
    featured: { title: "Featured Properties", sub: `${filteredProperties.length} premium slots` },
  };

  return (
    <div style={{ ...sans, display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body, #root { margin: 0; padding: 0; }
        button, input, select { font-family: inherit; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C7D8C8; border-radius: 999px; }
        input:focus { outline: none; }
      `}</style>

      <ToastContainer />

      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} pendingCount={pendingCount}/>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar active={active} collapsed={collapsed} setCollapsed={setCollapsed} searchQuery={search} setSearchQuery={setSearch} properties={properties}/>

        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {/* Section header for table pages */}
          {isTablePage && (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h1 style={{ ...serif, fontWeight: 700, fontSize: 30, color: C.navy, marginBottom: 5 }}>{sectionTitles[active]?.title}</h1>
                <div style={{ fontSize: 13, color: C.muted }}>{sectionTitles[active]?.sub}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", border: `1.5px solid ${C.border}`, borderRadius: 12, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, color: C.textSec, boxShadow: C.shadow }}>
                  <Download size={14}/> Export
                </button>
                {active === "pending" && pendingCount > 0 && (
                  <button onClick={() => {
                    toast.info("Approve All feature is coming soon");
                  }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", border: "none", borderRadius: 12, background: C.success, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: C.shadow }}>
                    <CheckCircle size={14}/> Approve All Pending ({pendingCount})
                  </button>
                )}
              </div>
            </div>
          )}

          {isTablePage && (
            <LocationFilterPanel
              value={locationFilters}
              onChange={setLocationFilters}
              onClear={() => setLocationFilters({ state: "", city: "", area: "" })}
              resultCount={filteredProperties.length}
            />
          )}

          {/* CONTENT */}
          {active === "overview" && <OverviewPage properties={properties} onSetActive={setActive}/>}

          {isTablePage && (
            <PropertyTable
              properties={filteredProperties}
              onApprove={handleApprove}
              onReject={handleReject}
              onFeature={handleFeature}
              onDelete={handleDelete}
              onView={handleView}
              loading={loading}
              filterStatus={currentFilter}
              mutationState={mutationState}
            />
          )}

          {active === "users" && <UsersPage users={users}/>}
          {active === "agents" && <UsersPage users={users.filter(u => u.role === "AGENT")}/>}

          {active === "analytics" && (
            <PlaceholderPage title="Analytics & Reports" icon={<BarChart3 size={32}/>} description="Advanced analytics including property views, conversion rates, city-wise demand, and revenue insights are coming soon." />
          )}
          {active === "settings" && (
            <PlaceholderPage title="Platform Settings" icon={<Settings size={32}/>} description="Configure RERA validation rules, featured slot pricing, moderation workflows, email templates, and more." />
          )}
        </main>
      </div>

      {/* Overlays */}
      <PropertyDrawer
        property={drawer}
        onClose={() => setDrawer(null)}
        onApprove={(id) => { handleApprove(id); }}
        onReject={(id) => { handleReject(id); }}
        onFeature={(id) => { handleFeature(id); }}
        actionLoading={drawer ? mutationState?.[drawer.id]?.loading : false}
      />
      <ConfirmModal
        modal={modal}
        onConfirm={modal?.onConfirm}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
