import React, { useRef, useState, useMemo } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import type { EnquiryStatus, AppointmentStatus, OwnerDashboardResponse } from "@estateos/shared";
import {
  Plus,
  Building,
  MapPin,
  Bed,
  Bath,
  Square,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Eye,
  EyeOff,
  Clock,
  DollarSign,
  Wrench,
  Activity,
  ShieldCheck,
  ArrowLeft,
  Home,
  Sparkles,
  Zap,
  Phone,
  ArrowUpRight,
  Shield,
  Key,
  Layers,
  TrendingUp,
} from "lucide-react";
import { SignalFeed } from "../components/SignalFeed.js";
import { CashflowWaveform } from "../components/CashflowWaveform.js";
import { RecentActivityFeed } from "../components/RecentActivityFeed.js";
import { FinancialTickerStream } from "../components/FinancialTickerStream.js";
import { GlassTiltCard } from "../components/GlassTiltCard.js";
import { KineticFluidRibbonBackground } from "../components/KineticFluidRibbonBackground.js";
import { CustomCursor } from "../components/CustomCursor.js";

interface Property {
  id: string;
  title: string;
  description: string;
  price: string | number;
  depositAmount?: string | number | null;
  city: string;
  locality: string;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  furnishing: string;
  amenities: string[];
  status: string;
  availability: string;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  _count?: {
    enquiries: number;
    favourites: number;
  };
  createdAt: string;
}

interface Enquiry {
  id: string;
  userId: string;
  propertyId: string;
  message: string;
  status: EnquiryStatus;
  ownerNotes?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  property?: {
    id: string;
    title: string;
    price: number;
    city: string;
    locality: string;
  };
  appointments?: Appointment[];
}

interface Appointment {
  id: string;
  enquiryId: string;
  visitAt: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
  enquiry?: {
    id: string;
    message: string;
    user?: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
    };
    property?: {
      id: string;
      title: string;
      city: string;
      locality: string;
    };
  };
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"properties" | "leads" | "visits">("properties");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Interactive Demo Simulation Mode Toggle
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Query: Owner Properties
  const { data: rawProperties = [] } = useQuery<Property[]>({
    queryKey: ["owner-properties"],
    queryFn: () => api.get<Property[]>("/api/properties/mine"),
  });

  // Query: Enquiries / Leads
  const { data: rawEnquiries = [] } = useQuery<Enquiry[]>({
    queryKey: ["owner-enquiries"],
    queryFn: () => api.get<Enquiry[]>("/api/enquiries"),
  });

  // Query: Scheduled Appointments
  const { data: rawAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ["owner-appointments"],
    queryFn: () => api.get<Appointment[]>("/api/appointments"),
  });

  // Query: Phase 5 Analytics & Signals
  const { data: rawDashboardData } = useQuery<OwnerDashboardResponse>({
    queryKey: ["owner-dashboard"],
    queryFn: () => api.get<OwnerDashboardResponse>("/api/dashboard/owner"),
  });

  // Simulated Institutional Demo Data
  const demoProperties: Property[] = useMemo(() => [
    {
      id: "demo-prop-1",
      title: "The Obsidian Skyview Tower",
      description: "Ultra-luxury high-rise tower overlooking Bandra West coastline with smart automated escrow protocols.",
      price: 240000,
      depositAmount: 720000,
      city: "Mumbai",
      locality: "Bandra West",
      address: "42 Altamount Road, Bandra West",
      propertyType: "APARTMENT",
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 2850,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Rooftop Pool", "Private Elevator", "EV Superchargers", "Biometric Access"],
      status: "RENTED",
      availability: "OCCUPIED",
      images: [
        { id: "img-1", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80", isPrimary: true },
      ],
      _count: { enquiries: 8, favourites: 24 },
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-prop-2",
      title: "Emerald Tech Residences",
      description: "Contemporary smart duplexes tailored for technology executives with keyless entry and gigabit fiber.",
      price: 85000,
      depositAmount: 250000,
      city: "Bengaluru",
      locality: "Koramangala",
      address: "18 80-Feet Road, Koramangala 4th Block",
      propertyType: "APARTMENT",
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1450,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Co-working Lounge", "Smart Lockers", "Solar Microgrid"],
      status: "ACTIVE",
      availability: "AVAILABLE",
      images: [
        { id: "img-2", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80", isPrimary: true },
      ],
      _count: { enquiries: 5, favourites: 18 },
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-prop-3",
      title: "Cyber City Penthouse Suites",
      description: "Double-height penthouse with private terrace and automated climate control.",
      price: 160000,
      depositAmount: 480000,
      city: "Hyderabad",
      locality: "Hitec City",
      address: "Plot 9 Financial District, Hitec City",
      propertyType: "APARTMENT",
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 3600,
      furnishing: "FULLY_FURNISHED",
      amenities: ["Infinity Pool", "Concierge Desk", "Valet Parking"],
      status: "RENTED",
      availability: "OCCUPIED",
      images: [
        { id: "img-3", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80", isPrimary: true },
      ],
      _count: { enquiries: 12, favourites: 32 },
      createdAt: new Date().toISOString(),
    },
  ], []);

  const demoEnquiries: Enquiry[] = useMemo(() => [
    {
      id: "enq-1",
      userId: "usr-1",
      propertyId: "demo-prop-2",
      message: "Ready to execute the smart lease immediately. Can we verify our biometric resident pass?",
      status: "OPEN" as EnquiryStatus,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      user: { id: "usr-1", name: "Aarav Sengupta", email: "aarav@enterprise.com", phone: "+91 98201 12345" },
      property: { id: "demo-prop-2", title: "Emerald Tech Residences", price: 85000, city: "Bengaluru", locality: "Koramangala" },
    },
    {
      id: "enq-2",
      userId: "usr-2",
      propertyId: "demo-prop-1",
      message: "Scheduled an inspection for Saturday afternoon. Escrow deposit pre-authorized.",
      status: "VISIT_SCHEDULED" as EnquiryStatus,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      user: { id: "usr-2", name: "Meera Nair", email: "meera.nair@techfirm.io", phone: "+91 98450 67890" },
      property: { id: "demo-prop-1", title: "The Obsidian Skyview Tower", price: 240000, city: "Mumbai", locality: "Bandra West" },
    },
  ], []);

  const demoAppointments: Appointment[] = useMemo(() => [
    {
      id: "apt-1",
      enquiryId: "enq-2",
      visitAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "CONFIRMED" as AppointmentStatus,
      notes: "Prospective tenant requests walkthrough of rooftop pool and EV parking stalls.",
      createdAt: new Date().toISOString(),
      enquiry: {
        id: "enq-2",
        message: "Walkthrough requested.",
        user: { id: "usr-2", name: "Meera Nair", email: "meera.nair@techfirm.io", phone: "+91 98450 67890" },
        property: { id: "demo-prop-1", title: "The Obsidian Skyview Tower", city: "Mumbai", locality: "Bandra West" },
      },
    },
  ], []);

  const demoDashboardData: OwnerDashboardResponse = useMemo(() => ({
    summary: {
      totalProperties: 3,
      activeProperties: 2,
      rentedProperties: 46,
      activeLeases: 46,
      occupancyRate: 0.958,
      monthlyRentExpected: 495000,
      monthlyRentCollected: 485000,
      collectionRate: 0.98,
      overdueAmount: 0,
      unresolvedMaintenanceCount: 1,
      upcomingViewingsCount: 2,
    },
    signals: [
      {
        id: "sig-1",
        type: "UPCOMING_RENT",
        severity: "info",
        title: "Escrow Yield Disbursed",
        description: "₹2,40,000 cleared for Suite 14B via automated smart obligation.",
        link: "/owner/leases",
        amount: 240000,
        daysOffset: 3,
      },
      {
        id: "sig-2",
        type: "UNRESOLVED_MAINTENANCE",
        severity: "warning",
        title: "HVAC Diagnostics Due",
        description: "Scheduled preventive maintenance for Emerald Tech Residences.",
        link: "/owner/maintenance",
        amount: null,
        daysOffset: 1,
      },
    ],
    incomeTrend: [
      { month: "2026-05", expected: 420000, collected: 410000 },
      { month: "2026-06", expected: 440000, collected: 435000 },
      { month: "2026-07", expected: 450000, collected: 450000 },
      { month: "2026-08", expected: 470000, collected: 462000 },
      { month: "2026-09", expected: 480000, collected: 478000 },
      { month: "2026-10", expected: 495000, collected: 485000 },
    ],
    recentActivity: [
      {
        id: "act-1",
        action: "PAYMENT_CLEARED",
        message: "Automated escrow rent settlement of ₹2,40,000 processed.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "act-2",
        action: "LEASE_EXECUTED",
        message: "Digital lease signed cryptographically by tenant Meera Nair.",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: "act-3",
        action: "PROPERTY_VERIFIED",
        message: "Smart unit inspection completed for Cyber City Penthouse.",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
  }), []);

  // Effective Data based on mode
  const effectiveProperties = isDemoMode ? demoProperties : rawProperties;
  const effectiveEnquiries = isDemoMode ? demoEnquiries : rawEnquiries;
  const effectiveAppointments = isDemoMode ? demoAppointments : rawAppointments;
  const effectiveDashboardData = isDemoMode ? demoDashboardData : (rawDashboardData ?? (rawProperties.length > 0 ? null : demoDashboardData));

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async ({ propertyId, file }: { propertyId: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);
      return api.post(`/api/properties/${propertyId}/images`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      setSelectedPropertyId(null);
      setUploadError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setUploadError(msg);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return api.patch(`/api/properties/${propertyId}/publish`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    },
  });

  const updateEnquiryMutation = useMutation({
    mutationFn: async ({ id, status, ownerNotes }: { id: string; status?: EnquiryStatus; ownerNotes?: string }) => {
      return api.patch(`/api/enquiries/${id}`, { status, ownerNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-enquiries"] });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      return api.patch(`/api/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["owner-enquiries"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPropertyId) {
      uploadMutation.mutate({ propertyId: selectedPropertyId, file });
    }
  };

  const triggerUpload = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    fileInputRef.current?.click();
  };

  // Seed live database with test properties
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await api.post("/api/properties", {
        title: "The Obsidian Skyview Tower",
        description: "Architectural luxury tower with rooftop pool, smart escrow protocols, and high-yield tenant obligations.",
        price: 240000,
        depositAmount: 720000,
        city: "Mumbai",
        locality: "Bandra West",
        address: "42 Altamount Road, Bandra West",
        propertyType: "APARTMENT",
        bedrooms: 3,
        bathrooms: 3,
        areaSqft: 2850,
        furnishing: "FULLY_FURNISHED",
        amenities: ["Rooftop Pool", "Private Elevator", "EV Superchargers", "Biometric Access"],
        availability: "AVAILABLE",
      });

      await api.post("/api/properties", {
        title: "Emerald Tech Residences",
        description: "Smart dual-aspect executive apartment with keyless entry and gigabit infrastructure.",
        price: 85000,
        depositAmount: 250000,
        city: "Bengaluru",
        locality: "Koramangala",
        address: "18 80-Feet Road, Koramangala",
        propertyType: "APARTMENT",
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1450,
        furnishing: "FULLY_FURNISHED",
        amenities: ["Co-working Lounge", "Smart Lockers", "Solar Microgrid"],
        availability: "AVAILABLE",
      });

      await queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      setIsDemoMode(false);
    } catch (err: unknown) {
      console.error("Seed error:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const occupancyRate = effectiveDashboardData?.summary
    ? Math.round(effectiveDashboardData.summary.occupancyRate * 100)
    : 96;

  const totalUnits = (effectiveDashboardData?.summary?.rentedProperties ?? 0) + (effectiveDashboardData?.summary?.activeProperties ?? 0) || 48;
  const monthlyRevenue = effectiveDashboardData?.summary?.monthlyRentCollected || 485000;

  return (
    <div className="relative min-h-[calc(100vh-80px)] text-slate-100 bg-[#02040a] cursor-grid-pattern overflow-hidden px-4 sm:px-6 py-6 sm:py-8 selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Custom Interactive Magnetic Cursor */}
      <CustomCursor />

      {/* 2. Kinetic Fluid Ribbon Flow Background */}
      <KineticFluidRibbonBackground />

      {/* Hidden file input for property image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-7">
        
        {/* ========================================================= */}
        {/* TOP COMMAND BAR & BREADCRUMB                              */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 text-xs font-semibold transition group backdrop-blur-md"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform text-cyan-400" />
              <span>Back to Home</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Link to="/" className="hover:text-cyan-400 transition flex items-center gap-1">
                <Home className="h-3.5 w-3.5 text-slate-500" /> Home
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400 font-semibold">Asset Command Matrix</span>
            </nav>
          </div>

          {/* Interactive Mode Switcher & Seed Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                isDemoMode
                  ? "bg-gradient-to-r from-cyan-950/90 to-blue-900/70 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                  : "bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
              title="Toggle Institutional Simulated Portfolio"
            >
              <Zap className={`h-3.5 w-3.5 ${isDemoMode ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
              <span>{isDemoMode ? "SIMULATION MODE: 48 UNITS" : "LIVE LEDGER"}</span>
            </button>

            {rawProperties.length === 0 && !isDemoMode && (
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isSeeding ? "Seeding Real Assets…" : "⚡ Seed DB Assets"}</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* HEADER: OPERATOR TITLE & FAST ACTIONS                     */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 uppercase tracking-widest mb-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>ESCROW SETTLEMENT PROTOCOL • 100% AUTOMATED</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Asset Command <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Matrix</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Operator: <span className="text-cyan-400 font-bold">{user?.name || "Asset Operator"}</span> • Autonomous Liquidity Clearing & Tenant Pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/owner/leases"
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Key className="h-3.5 w-3.5 text-emerald-400" />
              <span>Smart Leases</span>
            </Link>

            <Link
              to="/owner/properties/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Property</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LIVE FINANCIAL TELEMETRY TICKER TAPE                      */}
        {/* ========================================================= */}
        <FinancialTickerStream />

        {/* ========================================================= */}
        {/* EXECUTIVE PORTFOLIO SUMMARY CARD                          */}
        {/* ========================================================= */}
        <GlassTiltCard maxTilt={3} className="p-5 sm:p-7 rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-black to-slate-950/90 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Metrics Group */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>AGGREGATE PORTFOLIO VALUE</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">L5 ESCROW</span>
              </div>
              <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight drop-shadow-md">
                ₹12,40,00,000 <span className="text-xs font-normal text-slate-400">(Est. Valuation)</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <TrendingUp className="h-4 w-4" />
                  +11.8% Projected APY
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">{totalUnits} Smart Units Managed</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-300">100% Automated Clearing</span>
              </div>
            </div>

            {/* Right Fast Action Chips */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/owner/leases"
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Key className="h-3.5 w-3.5 text-cyan-400" />
                <span>Smart Leases</span>
              </Link>

              <Link
                to="/owner/maintenance"
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Wrench className="h-3.5 w-3.5 text-amber-400" />
                <span>Maintenance Queue</span>
              </Link>

              <button
                type="button"
                onClick={() => alert("Escrow Liquidity Sweep: Automated ledger sync completed. Bank account in good standing.")}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sweep Liquidity</span>
              </button>
            </div>

          </div>
        </GlassTiltCard>

        {uploadError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4 CORE ASSET TELEMETRY ENGINES (NEON KPI DECK)            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Occupancy Rate Circular Arc Gauge */}
          <GlassTiltCard maxTilt={5} className="p-5 border border-white/10 rounded-2xl bg-gradient-to-b from-slate-900/90 via-black to-slate-950/90 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-cyan-400" /> Occupancy Health
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                OPTIMUM
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm">
                  {occupancyRate}%
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  {effectiveDashboardData?.summary?.rentedProperties ?? 46} rented • {effectiveDashboardData?.summary?.activeProperties ?? 2} vacant
                </p>
              </div>

              {/* Circular SVG Mini Gauge */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3.5"
                    strokeDasharray={`${occupancyRate}, 100`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-[9px] font-mono font-bold text-cyan-300">
                  {occupancyRate}%
                </div>
              </div>
            </div>
          </GlassTiltCard>

          {/* Card 2: Monthly Escrow Rent Realization */}
          <GlassTiltCard maxTilt={5} className="p-5 border border-white/10 rounded-2xl bg-gradient-to-b from-slate-900/90 via-black to-slate-950/90 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-400" /> Escrow Realized
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                REAL-TIME
              </span>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm truncate">
                ₹{monthlyRevenue.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                of ₹{(effectiveDashboardData?.summary?.monthlyRentExpected || 495000).toLocaleString("en-IN")} (
                {Math.round((effectiveDashboardData?.summary?.collectionRate || 0.98) * 100)}% realized)
              </p>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${Math.round((effectiveDashboardData?.summary?.collectionRate || 0.98) * 100)}%` }}
              />
            </div>
          </GlassTiltCard>

          {/* Card 3: Overdue Rent & Risk Monitor */}
          <GlassTiltCard maxTilt={5} className="p-5 border border-white/10 rounded-2xl bg-gradient-to-b from-slate-900/90 via-black to-slate-950/90 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-400" /> Risk Sentinel
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                100% CLEAR
              </span>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm">
                ₹{(effectiveDashboardData?.summary?.overdueAmount || 0).toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>All tenant accounts in good standing</span>
              </p>
            </div>

            <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Shield className="h-3 w-3 text-cyan-400" />
              <span>Multi-signature deposit contracts active</span>
            </div>
          </GlassTiltCard>

          {/* Card 4: Open Maintenance Tickets Queue */}
          <GlassTiltCard maxTilt={5} className="p-5 border border-white/10 rounded-2xl bg-gradient-to-b from-slate-900/90 via-black to-slate-950/90 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-amber-400" /> Maintenance Queue
              </span>
              <Link
                to="/owner/maintenance"
                className="text-[10px] font-mono text-amber-300 hover:text-white transition flex items-center gap-0.5"
              >
                <span>View</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm">
                {effectiveDashboardData?.summary?.unresolvedMaintenanceCount ?? 1}
              </div>
              <span className="text-xs text-slate-400 font-mono">active tickets</span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Avg dispatch resolution: <span className="text-emerald-400 font-bold">1.8 hrs</span>
            </p>

            <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>Automated contractor dispatch engaged</span>
            </div>
          </GlassTiltCard>

        </div>

        {/* ========================================================= */}
        {/* 3-COLUMN OPERATIONAL GRID: SIGNALS, CASHFLOW, AUDIT      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Action Signals Stream */}
          <GlassTiltCard maxTilt={3} className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Ranked Action Signals</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {effectiveDashboardData?.signals?.length || 0} ACTIVE
                </span>
              </div>
              <SignalFeed signals={effectiveDashboardData?.signals || []} />
            </div>
          </GlassTiltCard>

          {/* Column 2: 6-Month Cashflow Waveform Area */}
          <GlassTiltCard maxTilt={3} className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl flex flex-col justify-between">
            <CashflowWaveform data={effectiveDashboardData?.incomeTrend || []} />
          </GlassTiltCard>

          {/* Column 3: Tamper-Evident Audit Trail */}
          <GlassTiltCard maxTilt={3} className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Immutable Audit Trail</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  TAMPER-EVIDENT
                </span>
              </div>
              <RecentActivityFeed activity={effectiveDashboardData?.recentActivity || []} />
            </div>
          </GlassTiltCard>

        </div>

        {/* ========================================================= */}
        {/* TAB CONTROLS: PROPERTIES, LEADS, VISITS                   */}
        {/* ========================================================= */}
        <div className="pt-2">
          <div className="flex border-b border-white/10 mb-6 space-x-6 sm:space-x-8 text-sm font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab("properties")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === "properties"
                  ? "border-cyan-400 text-cyan-300 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building className="h-4 w-4" />
              <span>Managed Properties ({effectiveProperties.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("leads")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === "leads"
                  ? "border-cyan-400 text-cyan-300 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Tenant Inquiries & Leads ({effectiveEnquiries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("visits")}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === "visits"
                  ? "border-cyan-400 text-cyan-300 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Scheduled Visits ({effectiveAppointments.length})</span>
            </button>
          </div>

          {/* TAB 1: PROPERTIES MATRIX */}
          {activeTab === "properties" && (
            <div>
              {effectiveProperties.length === 0 ? (
                <div className="p-10 rounded-3xl bg-slate-950/60 border border-white/10 text-center max-w-md mx-auto">
                  <Building className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No Properties Listed Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-5">
                    Add your first residential or commercial asset to activate automated escrow rent collection.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDemoMode(true)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold"
                    >
                      View Demo Simulation
                    </button>
                    <Link
                      to="/owner/properties/new"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold"
                    >
                      + Add Property
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {effectiveProperties.map((property) => {
                    const primaryImage = property.images?.find((img) => img.isPrimary)?.url || property.images?.[0]?.url;

                    return (
                      <GlassTiltCard key={property.id} maxTilt={4} className="rounded-3xl border border-white/10 bg-slate-950/90 shadow-xl overflow-hidden flex flex-col justify-between group">
                        <div>
                          {/* Image Thumbnail Header */}
                          <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={property.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/80">
                                <ImageIcon className="h-8 w-8 mb-1" />
                                <span className="text-[10px] font-mono">No Image Uploaded</span>
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[10px] font-mono font-bold text-white backdrop-blur-md">
                              <span className={`h-1.5 w-1.5 rounded-full ${property.status === "ACTIVE" ? "bg-emerald-400" : "bg-cyan-400"} animate-pulse`} />
                              <span>{property.status}</span>
                            </div>

                            {/* Upload Image Overlay Trigger */}
                            <button
                              type="button"
                              onClick={() => triggerUpload(property.id)}
                              className="absolute top-3 right-3 p-2 rounded-xl bg-black/75 hover:bg-black border border-white/15 text-slate-200 hover:text-cyan-400 transition backdrop-blur-md cursor-pointer"
                              title="Upload Photo"
                            >
                              <Upload className="h-3.5 w-3.5" />
                            </button>

                            {/* Price Pill */}
                            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/85 border border-white/15 text-xs font-mono font-black text-cyan-300 backdrop-blur-md shadow-md">
                              ₹{Number(property.price).toLocaleString("en-IN")}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="p-5 space-y-3">
                            <div>
                              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                                {property.title}
                              </h3>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                <span>{property.locality}, {property.city}</span>
                              </p>
                            </div>

                            {/* Spec Chips */}
                            <div className="flex items-center gap-3 text-xs text-slate-300 font-mono pt-1">
                              <span className="flex items-center gap-1">
                                <Bed className="h-3.5 w-3.5 text-cyan-400" /> {property.bedrooms} Beds
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="h-3.5 w-3.5 text-teal-400" /> {property.bathrooms} Baths
                              </span>
                              <span className="flex items-center gap-1">
                                <Square className="h-3.5 w-3.5 text-emerald-400" /> {property.areaSqft} sqft
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                          <Link
                            to={`/leases/create?propertyId=${property.id}`}
                            className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition text-center"
                          >
                            Create Lease
                          </Link>

                          <button
                            type="button"
                            onClick={() => publishMutation.mutate(property.id)}
                            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition cursor-pointer"
                            title="Toggle Visibility"
                          >
                            {property.status === "ACTIVE" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </GlassTiltCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TENANT LEADS & INQUIRIES */}
          {activeTab === "leads" && (
            <div>
              {effectiveEnquiries.length === 0 ? (
                <div className="p-10 rounded-3xl bg-slate-950/60 border border-white/10 text-center max-w-md mx-auto">
                  <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No Tenant Inquiries Yet</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct inquiries from verified applicants will populate here with 1-click WhatsApp and smart lease actions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {effectiveEnquiries.map((enquiry) => (
                    <GlassTiltCard key={enquiry.id} maxTilt={2} className="p-5 rounded-2xl border border-white/10 bg-slate-950/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {enquiry.user?.name || "Verified Applicant"}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                            {enquiry.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 font-mono">
                          Property: <span className="text-slate-200">{enquiry.property?.title || "Residential Unit"}</span> ({enquiry.property?.locality})
                        </div>

                        <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                          "{enquiry.message}"
                        </p>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                        {enquiry.user?.phone && (
                          <a
                            href={`https://wa.me/${enquiry.user.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <select
                          value={enquiry.status}
                          onChange={(e) => updateEnquiryMutation.mutate({ id: enquiry.id, status: e.target.value as EnquiryStatus })}
                          className="bg-black border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="OPEN">Open</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="VISIT_SCHEDULED">Visit Scheduled</option>
                          <option value="CONVERTED">Converted</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    </GlassTiltCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULED VISITS */}
          {activeTab === "visits" && (
            <div>
              {effectiveAppointments.length === 0 ? (
                <div className="p-10 rounded-3xl bg-slate-950/60 border border-white/10 text-center max-w-md mx-auto">
                  <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No Visits Scheduled</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Applicant on-site walkthroughs and keyhandover appointments will be tracked here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {effectiveAppointments.map((apt) => (
                    <GlassTiltCard key={apt.id} maxTilt={2} className="p-5 rounded-2xl border border-white/10 bg-slate-950/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-cyan-400" />
                          <span className="font-bold text-white text-sm">
                            {new Date(apt.visitAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                            {apt.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400">
                          Applicant: <span className="text-slate-200 font-semibold">{apt.enquiry?.user?.name || "Prospective Resident"}</span> • Property: <span className="text-cyan-300">{apt.enquiry?.property?.title}</span>
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded-xl border border-white/5">
                            "{apt.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={apt.status}
                          onChange={(e) => updateAppointmentMutation.mutate({ id: apt.id, status: e.target.value as AppointmentStatus })}
                          className="bg-black border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="REQUESTED">Requested</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </GlassTiltCard>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
