import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import type { PropertyResponse, PropertyListResponse } from "@estateos/shared";
import AeroShards from "../components/AeroShards.js";
import {
  Building2,
  ArrowRight,
  ArrowUp,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  CreditCard,
  Wrench,
  FileText,
  Activity,
  Key,
  Users,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [featuredProperties, setFeaturedProperties] = useState<PropertyResponse[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [searchBhk, setSearchBhk] = useState("");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [activePersonaTab, setActivePersonaTab] = useState<"owner" | "renter" | "tenant">("owner");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoadingFeatured(true);
        const res = await api.get<PropertyListResponse>("/api/properties?limit=3&sortBy=newest");
        setFeaturedProperties(res.properties);
      } catch {
        // Fallback gracefully
        setFeaturedProperties([]);
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
    navigate(`/search?${params.toString()}`);
  };

  const copyCredential = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[100px] right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section with AeroShards 600px Stage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        <div
          className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-950/90 shadow-2xl shadow-purple-950/40"
          style={{ width: '100%', height: '600px', position: 'relative' }}
        >
          {/* AeroShards WebGPU + Canvas2D Animation Layer */}
          <AeroShards
            shardColor="#896ABD"
            accentColor="#A855F7"
            placement="full"
            material="glass"
            markers="plus"
            count={1300}
            depthOfField={0.75}
            vignette={0.3}
            mouseInteraction
            pulseOnClick
            holdToGather
            lightMode={false}
            shardSize={1}
            spread={1}
            twist={1}
            billow={1}
            speed={1}
            scale={1}
            glow={0.35}
            grain={0.06}
            intro
            mouseStrength={0.6}
            parallax={0.5}
            paused={false}
          />

          {/* Foreground Hero HUD & Content */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10">
            {/* Top Bar with Back Option & Shards Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2 pointer-events-auto">
              {user ? (
                <Link
                  to={user.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard"}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition shadow-lg group"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to {user.role === "OWNER" ? "Owner Dashboard" : "Tenant Portal"}</span>
                </Link>
              ) : (
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition shadow-lg group"
                >
                  <Search className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Back to Marketplace Search</span>
                </Link>
              )}

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 backdrop-blur-md border border-purple-500/30 text-[11px] font-medium text-purple-300 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span>WebGPU 3D AeroShards • 1,300 Glass Prisms</span>
              </div>
            </div>

            {/* Center Core Hero Content */}
            <div className="max-w-3xl mx-auto text-center pointer-events-auto my-auto py-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-3 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>EstateOS 2.0 • Full-Lifecycle Rental Operations</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Zero Brokerage</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3 leading-[1.15]">
                The Property Operating System for{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                  Modern Renting.
                </span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto mb-5 leading-relaxed font-normal">
                Move beyond classifieds. Connect discovery, lead pipelines, tamper-evident digital leases,
                automated FIFO rent ledgers, and owner reliability intelligence.
              </p>

              {/* Floating Search Bar */}
              <div className="max-w-2xl mx-auto bg-slate-950/85 backdrop-blur-2xl border border-purple-500/30 p-2 sm:p-2.5 rounded-2xl shadow-2xl shadow-black/80 mb-4">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 gap-2 text-xs">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter city or locality (e.g. Bangalore, Indiranagar)..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:w-36 flex items-center px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 gap-2 text-xs">
                    <Bed className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={searchBhk}
                      onChange={(e) => setSearchBhk(e.target.value)}
                      className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">Any BHK</option>
                      <option value="1" className="bg-slate-900">1 BHK</option>
                      <option value="2" className="bg-slate-900">2 BHK</option>
                      <option value="3" className="bg-slate-900">3 BHK</option>
                      <option value="4" className="bg-slate-900">4+ BHK</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Search className="h-3.5 w-3.5" /> Find Homes
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/search"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 hover:scale-105 flex items-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" /> Browse Homes
                </Link>
                {user ? (
                  <Link
                    to={user.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard"}
                    className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition flex items-center gap-1.5"
                  >
                    My Dashboard <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition flex items-center gap-1.5"
                  >
                    <Key className="h-3.5 w-3.5 text-emerald-400" /> Get Started Free
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Floating Feature Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pointer-events-auto">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition">
                <span className="text-base sm:text-lg font-black text-white block">0%</span>
                <span className="text-[10px] text-slate-400">Zero Brokerage</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition">
                <span className="text-base sm:text-lg font-black text-emerald-400 block">FIFO</span>
                <span className="text-[10px] text-slate-400">Automated Split Ledger</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 transition">
                <span className="text-base sm:text-lg font-black text-purple-400 block">100%</span>
                <span className="text-[10px] text-slate-400">Tamper-Evident Leases</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-teal-500/40 transition">
                <span className="text-base sm:text-lg font-black text-teal-400 block">&lt; 24h</span>
                <span className="text-[10px] text-slate-400">Direct Landlord Tours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Handpicked verified spaces
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trending Bangalore Listings
            </h2>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
          >
            View all listings in marketplace <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
            <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No properties available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => {
              const primaryImg =
                prop.images?.find((i) => i.isPrimary)?.url ||
                prop.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

              return (
                <div
                  key={prop.id}
                  className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-48 bg-slate-950 overflow-hidden">
                      <img
                        src={primaryImg}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                          {prop.propertyType}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-sm font-extrabold text-white">
                        ₹{prop.price.toLocaleString("en-IN")}<span className="text-[11px] font-normal text-slate-400">/mo</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-emerald-400 transition">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        {prop.locality}, {prop.city}
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800 text-xs text-slate-300">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-slate-500" />
                          <span>{prop.bedrooms} BHK</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-slate-500" />
                          <span>{prop.bathrooms} Bath</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-3.5 w-3.5 text-slate-500" />
                          <span>{prop.areaSqft} sqft</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {prop.depositAmount ? `Deposit: ₹${prop.depositAmount.toLocaleString("en-IN")}` : "Direct Owner"}
                    </span>
                    <Link
                      to={`/properties/${prop.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/20 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Full-Lifecycle 5-Stage Architecture Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <Layers className="h-4 w-4" /> End-to-End Operating System
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Not just a marketplace. A complete rental lifecycle.
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Every step is connected through immutable database transactions and automated financial ledgers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Stage 1 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 block mb-2">STAGE 01</span>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Discovery & Map Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verified listings, interactive locality map pins, and transparent zero-brokerage pricing directly from owners.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-emerald-400 font-semibold">
              Phase 2 & 3 • Verified
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-teal-400 block mb-2">STAGE 02</span>
              <div className="h-10 w-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Intent & Tours</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct lead messaging, private landlord notes, and synchronized in-person inspection tour booking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-teal-400 font-semibold">
              Phase 3 • Lead Funnel
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 block mb-2">STAGE 03</span>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Digital Leases</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Convert winning leads to contracts in 1 click. Tamper-evident electronic acceptance and month-end due date clamping.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-emerald-400 font-semibold">
              Phase 4 • Electronic Audit
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 block mb-2">STAGE 04</span>
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Automated Ledgers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                FIFO payment splitting across overdue and upcoming obligations. Partial payment allocations and maintenance tickets.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-amber-400 font-semibold">
              Phase 4 • Operations
            </div>
          </div>

          {/* Stage 5 */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 block mb-2">STAGE 05</span>
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Reliability Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Priority-ranked action signals (critical &rarr; info), 6-month cashflow realization trends, and explainable recommendations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-blue-400 font-semibold">
              Phase 5 • Intelligence
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Switcher / Persona Deep Dive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <Users className="h-4 w-4" /> Built for all participants
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailored Experiences for Every Role
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Switch tabs below to see how EstateOS empowers landlords, renters, and tenants.
          </p>

          {/* Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-6 gap-1">
            <button
              onClick={() => setActivePersonaTab("owner")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                activePersonaTab === "owner"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              For Property Owners
            </button>
            <button
              onClick={() => setActivePersonaTab("renter")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                activePersonaTab === "renter"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              For Home Seekers
            </button>
            <button
              onClick={() => setActivePersonaTab("tenant")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                activePersonaTab === "tenant"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              For Active Tenants
            </button>
          </div>
        </div>

        {/* Tab 1: Owner Persona */}
        {activePersonaTab === "owner" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12">
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Landlord & Portfolio Management
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Eliminate spreadsheets. Manage property operations with automated signals.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The Owner Dashboard automatically synthesizes data across all your units into actionable priorities. Know who owes you rent, which units are vacant, and what viewings are coming up in the next 24 hours.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Real-time Occupancy & Collection Rates with live mathematical formula tooltips</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Deterministic Ranked Action Signals: Critical (Overdue rent) &rarr; Warning &rarr; Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>6-Month Cashflow Realization Trend (built with pure Tailwind CSS Grid)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/owner/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  Explore Owner Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Mockup Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" /> Owner Operations Preview
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">LIVE SIGNALS</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Occupancy Rate</span>
                  <span className="text-2xl font-black text-white">83%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">5 rented • 1 vacant</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Rent Realized</span>
                  <span className="text-2xl font-black text-emerald-400">₹2.45L</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">92% collection rate</span>
                </div>
              </div>

              {/* Sample Signal */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Rent Overdue: ₹45,000</span>
                    <span className="text-[11px] text-slate-300">10 days overdue • Unit 4B Indiranagar</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  CRITICAL
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Renter Persona */}
        {activePersonaTab === "renter" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12">
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Transparent Home Discovery
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Zero spam. Direct landlord conversations & inspection scheduling.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Find verified homes with verified specs. No broker commission, no phantom listings. Book inspection visits directly onto the landlord’s calendar and receive explainable recommendations based on what you actually shortlist.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Explainable Content-Based Recommendations with factual reason badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Direct In-App Enquiry & Tour Coordination with real-time status</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Locality Map Cluster View with transparent price tags</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  Browse Available Homes <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Mockup Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-teal-400" /> Explainable Recommendation Badge
                </span>
                <span className="text-[10px] text-teal-400 font-mono">100% EXPLAINABLE</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">Luxury 3BHK Penthouse</h4>
                    <span className="text-xs text-slate-400">Indiranagar, Bangalore</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-400">₹65,000/mo</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Why this matches you:
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Located in Bangalore where you saved 2 homes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Matches your 3 BHK preference</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tenant Persona */}
        {activePersonaTab === "tenant" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12">
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Active Tenancy & Operations
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Transparent rent ledgers, electronic leases & instant maintenance.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                No more text messages asking if rent arrived. View your full digital lease agreement, monitor upcoming monthly dues, track past payment allocations, and file maintenance tickets with real-time status updates.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Tamper-Evident Digital Lease Acceptance audit trail</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automated rent due dates with month-end clamping (28/30/31)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Online maintenance ticketing with photo attachment & status tracking</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/tenant/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  View Tenant Portal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Mockup Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-amber-400" /> Tenant Ledger Preview
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">ACTIVE CONTRACT</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Next Rent Obligation</span>
                  <span className="text-xl font-bold text-white">₹45,000</span>
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> Due in 4 days (May 5, 2026)
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  PENDING
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>Geyser thermostat ticket</span>
                </div>
                <span className="text-amber-400 font-bold text-[11px]">IN PROGRESS</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Honest Comparison Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" /> Radical Transparency
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How EstateOS Compares
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Why legacy classifieds fail and why full-lifecycle operations win.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-3xl overflow-hidden">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4 sm:p-5">Feature / Guarantee</th>
                <th className="p-4 sm:p-5 text-slate-500">Traditional Classifieds</th>
                <th className="p-4 sm:p-5 text-emerald-400 font-bold bg-emerald-500/5 border-x border-emerald-500/20">
                  EstateOS Platform
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Brokerage & Commissions</td>
                <td className="p-4 sm:p-5 text-rose-400">1 to 2 months rent fee</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/20">
                  Zero Brokerage (Direct Owner)
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Lease Agreement</td>
                <td className="p-4 sm:p-5 text-slate-400">Offline stamp paper or disconnected PDFs</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/20">
                  Tamper-Evident Electronic Acceptance & Audit Trail
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Rent Tracking & Ledgers</td>
                <td className="p-4 sm:p-5 text-slate-400">Unstructured WhatsApp bank screenshots</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/20">
                  Automated FIFO Obligation Splitting & Receipts
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Owner Operational Analytics</td>
                <td className="p-4 sm:p-5 text-slate-400">None (listing platform stops at enquiry)</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/20">
                  Ranked Priority Signals + 6-Month Cashflow Realization
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">AI Recommendations</td>
                <td className="p-4 sm:p-5 text-slate-400">Opaque sponsored ads</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/5 border-x border-emerald-500/20">
                  100% Explainable Rule-Based Matching (Zero Black-Box)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Quick-Test Demo Banner (for Viva / Evaluators) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-8 sm:p-12 shadow-2xl overflow-hidden">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 inline-block">
              🎓 Viva & Evaluator Sandbox
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Test Any Role Instantly With Seeded Data
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Click any demo account below to copy credentials and test the live end-to-end operational workflows. Password for all: <code className="bg-slate-950 px-2 py-0.5 rounded text-emerald-400">password123</code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => copyCredential("rajesh@estateos.com", "owner")}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Owner Account</span>
                  <span className="text-xs font-semibold text-white">rajesh@estateos.com</span>
                </div>
                {copiedAccount === "owner" ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                )}
              </button>

              <button
                onClick={() => copyCredential("arjun@estateos.com", "renter")}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Renter Account</span>
                  <span className="text-xs font-semibold text-white">arjun@estateos.com</span>
                </div>
                {copiedAccount === "renter" ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                )}
              </button>

              <button
                onClick={() => copyCredential("priya@estateos.com", "tenant")}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Tenant Account</span>
                  <span className="text-xs font-semibold text-white">priya@estateos.com</span>
                </div>
                {copiedAccount === "tenant" ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                Go to Sign In
              </Link>
              <Link
                to="/search"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                Browse Marketplace First
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all duration-300 shadow-2xl shadow-emerald-500/20 group flex items-center gap-2 text-xs font-bold hover:scale-105 active:scale-95"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
          <span className="hidden sm:inline">Back to Top</span>
        </button>
      )}
    </div>
  );
}
