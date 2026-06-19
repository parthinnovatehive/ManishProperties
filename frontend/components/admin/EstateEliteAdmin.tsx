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
import { estateApi } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FeaturedBadge } from "@/components/ui/FeaturedBadge";

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

const getPropertyLocationMeta = (property) => {
  const haystack = `${property.location} ${property.title}`.toLowerCase();
  const match = LOCATION_INDEX.find(({ city, area }) =>
    haystack.includes(area.toLowerCase()) || haystack.includes(city.toLowerCase()),
  );

  if (match) return match;

  const stateMatch = Object.keys(LOCATION_HIERARCHY).find((state) => haystack.includes(state.toLowerCase()));
  return { state: stateMatch || "", city: "", area: "" };
};

/* NOTE: Sidebar/TopBar removed from this file.
  The application now uses app/admin/layout.tsx which
  renders AdminSidebar and AdminNavbar centrally.
  EstateEliteAdmin provides dashboard content only:
  stats, filters, tables, drawers, and widgets.
*/

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
  { label: "Total Properties", value: properties.length, icon: <Building2 size={20}/>, color: C.blue, bg: C.bluePale, delta: "" },
  { label: "Pending Review", value: properties.filter(p => p.status === "PENDING").length, icon: <Clock size={20}/>, color: C.warning, bg: C.warningLight, delta: "", urgent: true },
    { label: "Approved", value: properties.filter(p => p.status === "APPROVED").length, icon: <CheckCircle size={20}/>, color: C.success, bg: C.successLight, delta: "" },
    { label: "Rejected", value: properties.filter(p => p.status === "REJECTED").length, icon: <XCircle size={20}/>, color: C.danger, bg: C.dangerLight, delta: "" },
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

/* Simple Confirm Modal used by the admin dashboard */
function ConfirmModal({ modal, onConfirm, onClose }) {
  if (!modal) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 480, background: "#fff", borderRadius: 12, padding: 20, boxShadow: C.shadowLg }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.navy, marginBottom: 8 }}>{modal.title}</div>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 18 }}>{modal.message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff" }}>Cancel</button>
          <button onClick={async () => { await modal.onConfirm?.(); onConfirm?.(); }} style={{ padding: "8px 12px", borderRadius: 8, background: C.danger, color: "#fff" }}>{modal.confirmLabel || "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
============================================================ */
export default function EstateEliteAdmin() {
  const [active, setActive] = useState("overview");
  const { properties, loading, error, mutationState, approveProperty, rejectProperty, featureProperty, deleteProperty } = useAdminProperties();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [locationFilters, setLocationFilters] = useState({ state: "", city: "", area: "" });
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
const [adminCity, setAdminCity] = useState<string | null>(null);
  // Authentication is handled by app/admin/layout.tsx via useRedirectIfUnauthenticated

  // Handle initial errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  useEffect(() => {
    estateApi.users.list().then(setUsers).catch(() => setUsers([]));
  }, []);

  // Get admin's assigned city
useEffect(() => {
  const getAdminCity = async () => {
    try {
      const storedAdmin = localStorage.getItem("adminData");
      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin);
        const citiesData = await estateApi.cities.list<any>();
        const assignedCity = citiesData.find((city: any) => city.admin_id === admin.id);
        if (assignedCity) {
          setAdminCity(assignedCity.id);
          console.log("Admin assigned to city:", assignedCity.name);
        }
      }
    } catch (err) {
      console.error("Failed to get admin city:", err);
    }
  };
  getAdminCity();
}, []);
// Filter properties by admin's city
useEffect(() => {
  if (adminCity) {
    const filtered = properties.filter(p => p.city_id === adminCity);
    setFilteredProperties(filtered);
  } else {
    setFilteredProperties(properties);
  }
}, [properties, adminCity]);

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
    const prop = filteredProperties.find(p => p.id === id);
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
}, [featureProperty, filteredProperties, toast]);

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

const filterMap = { moderation: "all", pending: "PENDING", approved: "APPROVED", rejected: "REJECTED", featured: "featured" };
const currentFilter = filterMap[active] || "all";

// Use filteredProperties (already filtered by city) for the table view
const tableProperties = filteredProperties.filter(p => {
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

  // Apply status filter
  if (currentFilter === "featured") {
    if (!p.featured) return false;
  } else if (currentFilter !== "all") {
    if (p.status !== currentFilter) return false;
  }

  return true;
});


  const isTablePage = ["moderation", "pending", "approved", "rejected", "featured"].includes(active);
  const pendingCount = filteredProperties.filter(p => p.status === "PENDING").length;

  const sectionTitles = {
    moderation: { title: "All Properties", sub: `${filteredProperties.length} total listings` },
    pending: { title: "Pending Review", sub: `${filteredProperties.length} awaiting moderation` },
    approved: { title: "Approved Listings", sub: `${filteredProperties.length} live on platform` },
    rejected: { title: "Rejected Listings", sub: `${filteredProperties.length} rejected` },
    featured: { title: "Featured Properties", sub: `${filteredProperties.length} premium slots` },
  };

  // Render only dashboard content — layout (sidebar/navbar/auth) is provided by app/admin/layout.tsx
  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C7D8C8; border-radius: 999px; }
        input:focus { outline: none; }
      `}</style>

      <ToastContainer />

      <div style={{ minHeight: 360 }}>
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
            </div>
          </div>
        )}

        {isTablePage && (
          <LocationFilterPanel
            value={locationFilters}
            onChange={setLocationFilters}
            onClear={() => setLocationFilters({ state: "", city: "", area: "" })}
            resultCount={tableProperties.length}
          />
        )}

{active === "overview" && <OverviewPage properties={filteredProperties} onSetActive={setActive} />}

        {isTablePage && (
         // Update the PropertyTable call (around line 730)
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
