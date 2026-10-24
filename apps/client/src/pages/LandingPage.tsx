import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import type { PropertyResponse, PropertyListResponse } from "@estateos/shared";
import { SpatialStage3D } from "../components/SpatialStage3D.js";
import {
  Building2,
  ArrowRight,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Wrench,
  FileText,
  Activity,
  Key,
  ChevronRight,
  Copy,
  Check,
  TrendingUp,
  Clock,
  Terminal,
  Lock,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [searchCity, setSearchCity] = useState("");
  const [searchBhk, setSearchBhk] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<PropertyResponse[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Interactive UI state
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [activePersonaTab, setActivePersonaTab] = useState<"owner" | "renter" | "tenant">("owner");
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<"lease" | "yield" | "fifo" | "ai">("lease");
  const [simulatorMonthlyRent, setSimulatorMonthlyRent] = useState<number>(45000);
  const [simulatorPaymentAmount, setSimulatorPaymentAmount] = useState<number>(45000);
  const [selectedCityNode, setSelectedCityNode] = useState<string | null>("EstateOS Horizon Tower");

  // Load properties
  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoadingFeatured(true);
        const res = await api<PropertyListResponse>("/properties?limit=3");
        if (res && res.properties && res.properties.length > 0) {
          setFeaturedProperties(res.properties);
        } else {
          // Graceful fallback to demo listings if database is empty
          setFeaturedProperties(FALLBACK_PROPERTIES);
        }
      } catch {
        setFeaturedProperties(FALLBACK_PROPERTIES);
      } finally {
        setLoadingFeatured(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (searchBhk) params.append("bedrooms", searchBhk);
    navigate(`/marketplace?${params.toString()}`);
  };

  const copyCredential = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="relative min-h-screen text-slate-100 bg-[#020617] overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Cyber-Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[35%] -left-40 w-[550px] h-[550px] bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[65%] -right-40 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Top Floating Telemetry & Portal Bar */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 text-xs text-cyan-300 shadow-lg shadow-cyan-950/40">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-semibold tracking-wide">ESTATEOS 2.0</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Spatial Asset Digital Twin & Automation</span>
            </div>

            <div className="flex items-center gap-2.5">
              {user ? (
                <Link
                  to={user.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:shadow-lg hover:shadow-cyan-500/25 transition-all group"
                >
                  <span>Open {user.role === "OWNER" ? "Owner Portal" : "Tenant Portal"}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md shadow-cyan-500/20 transition"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =========================================================================
            HERO SECTION: 3D SPATIAL DIGITAL TWIN STAGE + COMMAND INTERFACE
        ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 lg:pt-10 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Vision & Actions (5 cols) */}
            <div className="lg:col-span-5 text-left z-20 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Zero Brokerage • Institutional-Grade Reliability
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                The Operating System for{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Modern Real Estate.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Move beyond classified ads. Experience interactive 3D spatial discovery, tamper-evident digital leases,
                automated FIFO rent ledgers, instant maintenance routing, and explainable AI tenant-landlord matching.
              </p>

              {/* Instant Search Bar */}
              <div className="bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/30 p-2 rounded-2xl shadow-2xl shadow-cyan-950/40">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 gap-2.5 text-xs">
                    <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Locality or City (e.g. Indiranagar, Whitefield)..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:w-36 flex items-center px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 gap-2 text-xs">
                    <Bed className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={searchBhk}
                      onChange={(e) => setSearchBhk(e.target.value)}
                      className="w-full bg-transparent text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-100">Any BHK</option>
                      <option value="1" className="bg-slate-900 text-slate-100">1 BHK</option>
                      <option value="2" className="bg-slate-900 text-slate-100">2 BHK</option>
                      <option value="3" className="bg-slate-900 text-slate-100">3 BHK</option>
                      <option value="4" className="bg-slate-900 text-slate-100">4+ BHK / Villa</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/25 transition active:scale-95"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </button>
                </form>

                {/* Quick Locality Chips */}
                <div className="flex items-center gap-1.5 pt-2 px-1 text-[11px] text-slate-400 flex-wrap">
                  <span className="text-slate-500">Popular:</span>
                  {["Indiranagar", "Koramangala", "Whitefield", "HSR Layout"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSearchCity(loc);
                        navigate(`/marketplace?city=${encodeURIComponent(loc)}`);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 transition text-[11px]"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Proof Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 backdrop-blur-xl border border-slate-800/80">
                  <div className="text-lg font-black text-cyan-400">₹48.2 Cr+</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">Rental Volume</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 backdrop-blur-xl border border-slate-800/80">
                  <div className="text-lg font-black text-emerald-400">99.4%</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">On-Time FIFO</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 backdrop-blur-xl border border-slate-800/80">
                  <div className="text-lg font-black text-indigo-400">0%</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">Brokerage Fees</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Interactive Spatial Digital Twin (7 cols) */}
            <div className="lg:col-span-7 h-[480px] sm:h-[560px] lg:h-[620px] rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-950/90 shadow-2xl shadow-cyan-950/50 relative group">
              <SpatialStage3D
                onBuildingSelect={(_id, data) => {
                  setSelectedCityNode(data?.name ?? null);
                }}
              />

              {/* Interactive Inspector HUD in 3D Stage */}
              <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800 text-xs shadow-xl">
                  <div className="flex items-center gap-2 px-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-slate-300 text-[11px] font-mono">
                      NODE: <strong className="text-cyan-300">{selectedCityNode}</strong>
                    </span>
                  </div>
                  <Link
                    to="/marketplace"
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-[11px] border border-cyan-500/40 transition flex items-center gap-1"
                  >
                    <span>View Assets</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            LIVE OPERATIONAL TELEMETRY RIBBON
        ========================================================================= */}
        <section className="border-y border-slate-800/80 bg-slate-950/60 backdrop-blur-xl py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 text-center">
              <div className="pt-4 md:pt-0">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Active Digital Leases
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white">1,420+</span>
                <span className="text-[11px] text-emerald-400 block mt-1 font-medium">100% Cryptographic Audit Trail</span>
              </div>
              <div className="pt-4 md:pt-0 md:pl-6">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Average Vacancy Reduction
                </span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-400">18.4 Days</span>
                <span className="text-[11px] text-slate-400 block mt-1 font-medium">Powered by AI Match Engine</span>
              </div>
              <div className="pt-4 md:pt-0 md:pl-6">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Mean Maintenance SLA
                </span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-400">&lt; 4.2 Hours</span>
                <span className="text-[11px] text-emerald-400 block mt-1 font-medium">Automated Vendor Dispatch</span>
              </div>
              <div className="pt-4 md:pt-0 md:pl-6">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Direct Savings to Renters
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">₹3.8 Cr+</span>
                <span className="text-[11px] text-slate-400 block mt-1 font-medium">Zero Brokerage Guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            INTERACTIVE 3D AUTOMATION SIMULATOR (Smart Lease, Yield, FIFO, AI Match)
        ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full-Lifecycle Core Engines</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Built Like an Operating System. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                Not a Classified Bulletin Board.
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
              Interact with the live simulator below to explore how EstateOS automates every financial and operational
              phase of rental property management.
            </p>
          </div>

          {/* Simulator Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
            {[
              { id: "lease", label: "Smart Digital Leases", icon: FileText },
              { id: "yield", label: "Predictive Yield Engine", icon: TrendingUp },
              { id: "fifo", label: "Automated FIFO Ledger", icon: CreditCard },
              { id: "ai", label: "Explainable AI Match", icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSimulatorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSimulatorTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Simulator Active Canvas Screen */}
          <div className="bg-slate-950/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 max-w-5xl mx-auto">
            {activeSimulatorTab === "lease" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    <Lock className="h-3 w-3" />
                    <span>ENGINE: SMART CONTRACT LEASE BUILDER</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Tamper-Evident Digital Agreement</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Eliminate paper leases and notary friction. When an owner generates a lease, EstateOS generates an
                    immutable contract with automated monthly due-date obligation schedules.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>One-click digital signature with tenant Aadhaar / Email OTP</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Security deposit recorded in auditable escrow ledger</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Auto-generates 12 monthly rent obligation records (FIFO-ready)</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Lease Card Preview */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4 font-mono text-xs shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-slate-400">LEASE AGREEMENT ID</span>
                    <span className="text-cyan-400 font-bold">#LS-2026-BLR-094</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">TENANT</span>
                      <span className="text-white font-semibold">Priya Nair</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">MONTHLY RENT</span>
                      <span className="text-emerald-400 font-semibold">₹45,000 / mo</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">BILLING DUE DAY</span>
                      <span className="text-white font-semibold">5th of Every Month</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">ESCROW DEPOSIT</span>
                      <span className="text-cyan-400 font-semibold">₹1,35,000 (Secured)</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 font-bold">STATUS: ACTIVE & SIGNED</span>
                    </div>
                    <span className="text-[10px] text-slate-500">SHA-256 VERIFIED</span>
                  </div>
                </div>
              </div>
            )}

            {activeSimulatorTab === "yield" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    <TrendingUp className="h-3 w-3" />
                    <span>ENGINE: PREDICTIVE ASSET YIELD & ROI</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Dynamic Rental Yield Optimization</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    EstateOS tracks micro-market rent trends and property appreciation to calculate real-time gross yield,
                    net operating income (NOI), and vacancy risk scores.
                  </p>
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-medium">
                      Simulate Monthly Rent: <strong className="text-cyan-300">₹{simulatorMonthlyRent.toLocaleString("en-IN")}</strong>
                    </label>
                    <input
                      type="range"
                      min={20000}
                      max={150000}
                      step={5000}
                      value={simulatorMonthlyRent}
                      onChange={(e) => setSimulatorMonthlyRent(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Interactive Yield Calculator Box */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-4 text-xs shadow-xl">
                  <div className="text-slate-400 font-mono text-[11px] pb-2 border-b border-slate-800">
                    REAL-TIME PERFORMANCE PROJECTION
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">ANNUAL GROSS</span>
                      <span className="text-xl font-black text-white">
                        ₹{(simulatorMonthlyRent * 12).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">ESTIMATED YIELD</span>
                      <span className="text-xl font-black text-emerald-400">
                        {((simulatorMonthlyRent * 12) / 7200000 * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[11px] block">OCCUPANCY PROJECTION</span>
                      <span className="text-cyan-300 font-bold text-sm">98.2% (11.8 Mo / Yr)</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      LOW VACANCY RISK
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSimulatorTab === "fifo" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    <CreditCard className="h-3 w-3" />
                    <span>ENGINE: FIRST-IN-FIRST-OUT (FIFO) RECONCILIATION</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Zero-Error Cashflow Clearing</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    No more manual spreadsheet matching. When a tenant pays, EstateOS automatically allocates the funds to
                    the oldest outstanding rent obligation first, maintaining flawless ledgers.
                  </p>
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-medium">
                      Simulate Inbound Payment: <strong className="text-emerald-400">₹{simulatorPaymentAmount.toLocaleString("en-IN")}</strong>
                    </label>
                    <div className="flex gap-2">
                      {[30000, 45000, 60000, 90000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSimulatorPaymentAmount(amt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                            simulatorPaymentAmount === amt
                              ? "bg-cyan-500 text-slate-950"
                              : "bg-slate-900 text-slate-400 hover:text-white"
                          }`}
                        >
                          ₹{(amt / 1000)}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FIFO Visual Waterfall */}
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">JAN OBLIGATION (DUE ₹45,000)</span>
                      <span className="text-emerald-400 font-bold">
                        {simulatorPaymentAmount >= 45000 ? "FULLY CLEARED (₹45,000)" : `PARTIAL PAID (₹${simulatorPaymentAmount.toLocaleString("en-IN")})`}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                      {simulatorPaymentAmount >= 45000 ? "PAID" : "PARTIAL"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">FEB OBLIGATION (DUE ₹45,000)</span>
                      <span className="text-cyan-400 font-bold">
                        {simulatorPaymentAmount > 45000
                          ? `ALLOCATED ₹${(simulatorPaymentAmount - 45000).toLocaleString("en-IN")}`
                          : "PENDING NEXT CYCLE"}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold">
                      {simulatorPaymentAmount >= 90000 ? "PAID" : simulatorPaymentAmount > 45000 ? "PARTIAL" : "PENDING"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Instant receipt and UPI payout notification dispatched in 0.8s</span>
                  </div>
                </div>
              </div>
            )}

            {activeSimulatorTab === "ai" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    <Sparkles className="h-3 w-3" />
                    <span>ENGINE: EXPLAINABLE AI MATCHING</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Transparent Compatibility Scoring</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Zero guesswork or black-box algorithms. EstateOS calculates compatibility scores based on budget limits,
                    commute preferences, amenity requirements, and verified tenancy history.
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Budget Fit (Within ₹50k target)</span>
                      <span className="font-bold text-emerald-400">98% Match</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[98%]" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2">
                      <span>Location & Tech Park Commute</span>
                      <span className="font-bold text-cyan-400">94% Match</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[94%]" />
                    </div>
                  </div>
                </div>

                {/* AI Explanation Card */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-4 text-xs shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-slate-400">AI MATCH VECTOR</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                      96% OVERALL COMPATIBILITY
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed italic">
                    "This 3BHK in Indiranagar matches your criteria: 7 min from Metro, dedicated EV charging station,
                    verified landlord with 5.0 reliability score, and 0 broker commission."
                  </p>
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center gap-1.5 text-cyan-400 font-semibold text-xs hover:underline pt-2"
                  >
                    <span>View Your Personalized Matches</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            CHOOSE YOUR ROLE: INTERACTIVE PERSONA MATRIX
        ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">Tailored Workspaces</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Who Are You Managing For?</h2>
          </div>

          <div className="flex justify-center gap-3 mb-12">
            {[
              { id: "owner", label: "Property Owners & Landlords", icon: Building2 },
              { id: "renter", label: "Home Seekers & Renters", icon: Search },
              { id: "tenant", label: "Active Tenants", icon: Key },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = activePersonaTab === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePersonaTab(p.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-slate-900 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-950/40"
                      : "bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activePersonaTab === "owner" && (
              <>
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Cashflow & Yield Dashboard</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    View gross monthly revenues, occupancy rates, and past collection trends across your entire portfolio in one pane.
                  </p>
                  <Link to="/owner/dashboard" className="text-xs font-semibold text-cyan-400 flex items-center gap-1 hover:underline pt-2">
                    <span>View Owner Dashboard</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Instant Lease Dispatch</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate tamper-evident digital lease agreements with custom due days, deposit escrow, and automated email signature links.
                  </p>
                  <Link to="/owner/leases/new" className="text-xs font-semibold text-blue-400 flex items-center gap-1 hover:underline pt-2">
                    <span>Create a Lease</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Maintenance Command Desk</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Receive, triage, and resolve maintenance tickets from tenants with internal notes, priority tags, and status timelines.
                  </p>
                  <Link to="/owner/maintenance" className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:underline pt-2">
                    <span>Open Maintenance Desk</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            )}

            {activePersonaTab === "renter" && (
              <>
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Direct Marketplace</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Search 100% verified listings directly with owners. Zero brokerage, transparent deposits, and interactive 3D map views.
                  </p>
                  <Link to="/marketplace" className="text-xs font-semibold text-cyan-400 flex items-center gap-1 hover:underline pt-2">
                    <span>Explore Marketplace</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Explainable AI Recommendations</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Get properties recommended specifically for your budget, commute distance, and lifestyle preferences with transparent match percentages.
                  </p>
                  <Link to="/recommendations" className="text-xs font-semibold text-purple-400 flex items-center gap-1 hover:underline pt-2">
                    <span>View AI Matches</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Instant Tour Scheduling</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Book property viewings directly on the owner's calendar with instant SMS/Email confirmation and status tracking.
                  </p>
                  <Link to="/renter/dashboard" className="text-xs font-semibold text-indigo-400 flex items-center gap-1 hover:underline pt-2">
                    <span>Open Renter Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            )}

            {activePersonaTab === "tenant" && (
              <>
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">One-Click Rent Payments</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pay rent securely via UPI or Card. Instant automated payment receipts, ledger updates, and zero delay.
                  </p>
                  <Link to="/tenant/dashboard" className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:underline pt-2">
                    <span>Open Tenant Dashboard</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Digital Lease Vault</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Access your legal agreement anytime, review terms, inspect escrow deposit status, and sign renewals digitally.
                  </p>
                  <Link to="/tenant/dashboard" className="text-xs font-semibold text-blue-400 flex items-center gap-1 hover:underline pt-2">
                    <span>View Lease Documents</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition group">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Maintenance Ticketing</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Report repairs with photo attachments, track technician dispatch, and get live updates directly on your dashboard.
                  </p>
                  <Link to="/tenant/dashboard" className="text-xs font-semibold text-amber-400 flex items-center gap-1 hover:underline pt-2">
                    <span>Submit Work Order</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* =========================================================================
            FEATURED CURATED PROPERTIES
        ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">Prime Listings</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Spatial Properties</h2>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 hover:text-white hover:border-cyan-500/40 transition"
            >
              <span>View All Properties</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingFeatured
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
                ))
              : featuredProperties.map((prop) => (
                  <Link
                    key={prop.id}
                    to={`/properties/${prop.id}`}
                    className="group rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-950/40 flex flex-col"
                  >
                    <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                      <img
                        src={prop.images?.[0]?.url ?? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
                        VERIFIED DIGITAL TWIN
                      </div>
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md text-white font-black text-sm">
                        ₹{Number(prop.price).toLocaleString("en-IN")}{" "}
                        <span className="text-[10px] font-normal text-slate-400">/ mo</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span>{prop.locality}, {prop.city}</span>
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {prop.title}
                        </h4>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Bed className="h-3.5 w-3.5 text-slate-500" />
                          <span>{prop.bedrooms} BHK</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="h-3.5 w-3.5 text-slate-500" />
                          <span>{prop.bathrooms} Bath</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Square className="h-3.5 w-3.5 text-slate-500" />
                          <span>{prop.areaSqft} sqft</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </section>

        {/* =========================================================================
            ONE-CLICK DEMO CREDENTIALS QUICK LAUNCHER
        ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-800/80">
          <div className="p-8 rounded-3xl bg-slate-950/80 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold mb-2">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Instant Evaluation & Testing Sandbox</span>
                </div>
                <h3 className="text-2xl font-bold text-white">One-Click Role Switcher</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Test the entire EstateOS operating system instantly. Click any credential to copy, or use one-click login.
                </p>
              </div>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/25 transition"
              >
                Go to Sign In Page
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  role: "OWNER / LANDLORD",
                  email: "ananya@estateos.test",
                  pass: "password123",
                  color: "text-cyan-400 border-cyan-500/30",
                  desc: "Owns 3 villas & apartments, active leases, cashflow analytics",
                },
                {
                  role: "TENANT",
                  email: "priya@estateos.test",
                  pass: "password123",
                  color: "text-emerald-400 border-emerald-500/30",
                  desc: "Active lease in Whitefield, monthly rent obligations, maintenance history",
                },
                {
                  role: "RENTER / SEEKER",
                  email: "rahul@estateos.test",
                  pass: "password123",
                  color: "text-purple-400 border-purple-500/30",
                  desc: "Marketplace searcher, saved favourites, AI recommendation preferences",
                },
              ].map((acc) => (
                <div
                  key={acc.email}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${acc.color}`}>
                      {acc.role}
                    </span>
                    <div className="mt-2 text-xs font-mono text-slate-200 break-all">{acc.email}</div>
                    <div className="text-[11px] font-mono text-slate-500">password: {acc.pass}</div>
                    <div className="text-[11px] text-slate-400 mt-2">{acc.desc}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyCredential(`${acc.email} / ${acc.pass}`, acc.email)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedAccount === acc.email ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            FINAL CALL TO ACTION
        ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Upgrade Your Rental Operations?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Join thousands of owners and tenants managing property lifecycle, digital contracts, and automated rent
              clearing with EstateOS.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-sm hover:brightness-110 shadow-xl shadow-cyan-500/25 transition active:scale-95"
              >
                Create Free Account
              </Link>
              <Link
                to="/marketplace"
                className="px-8 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-sm hover:text-white hover:border-slate-700 transition"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Fallback demo properties if server has zero listings
const FALLBACK_PROPERTIES: PropertyResponse[] = [
  {
    id: "demo-prop-1",
    ownerId: "demo-owner",
    title: "Indiranagar Sovereign Luxury Penthouse",
    description: "Panoramic terrace views, smart home automation, high-speed fiber, private lift access.",
    price: 65000,
    depositAmount: 200000,
    city: "Bangalore",
    locality: "Indiranagar",
    address: "100ft Road, 4th Block",
    pincode: "560038",
    propertyType: "APARTMENT",
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2150,
    furnishing: "FULLY_FURNISHED",
    amenities: ["Private Lift", "Power Backup", "Gym", "EV Charger"],
    status: "ACTIVE",
    availability: "AVAILABLE_NOW",
    latitude: 12.9716,
    longitude: 77.6412,
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        publicId: "demo-1",
        sortOrder: 0,
        isPrimary: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-prop-2",
    ownerId: "demo-owner",
    title: "Palm Meadows 4BHK Private Villa",
    description: "Gated community luxury villa with private lawn, solar heating, and home theater setup.",
    price: 95000,
    depositAmount: 300000,
    city: "Bangalore",
    locality: "Whitefield",
    address: "Villa 24, Palm Meadows, ECC Road",
    pincode: "560066",
    propertyType: "VILLA",
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 3600,
    furnishing: "FULLY_FURNISHED",
    amenities: ["Private Garden", "Swimming Pool", "Club House", "Solar Backup"],
    status: "ACTIVE",
    availability: "AVAILABLE_NOW",
    latitude: 12.9698,
    longitude: 77.7499,
    images: [
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
        publicId: "demo-2",
        sortOrder: 0,
        isPrimary: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-prop-3",
    ownerId: "demo-owner",
    title: "Koramangala Minimalist Studio Loft",
    description: "Architectural modern studio loft for tech professionals. Walking distance to Sony World Signal.",
    price: 32000,
    depositAmount: 100000,
    city: "Bangalore",
    locality: "Koramangala",
    address: "42, 80ft Road, 4th Block",
    pincode: "560034",
    propertyType: "STUDIO",
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 750,
    furnishing: "FULLY_FURNISHED",
    amenities: ["Power Backup", "High Speed WiFi", "Security"],
    status: "ACTIVE",
    availability: "AVAILABLE_NOW",
    latitude: 12.9352,
    longitude: 77.6245,
    images: [
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        publicId: "demo-3",
        sortOrder: 0,
        isPrimary: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
