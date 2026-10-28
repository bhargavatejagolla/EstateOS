import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/auth.js";
import { InteractiveBackgroundCanvas } from "../components/InteractiveBackgroundCanvas.js";
import { GlassTiltCard } from "../components/GlassTiltCard.js";
import { CustomCursor } from "../components/CustomCursor.js";
import { ArchitecturalResidence3D } from "../components/ArchitecturalResidence3D.js";
import { LiveHoloIdentityPass } from "../components/LiveHoloIdentityPass.js";
import {
  User as UserIcon,
  AlertCircle,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  Key,
} from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "OWNER" as "OWNER" | "RENTER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Kinetic Password Strength Meter calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "Awaiting input entropy…", color: "text-slate-500" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: "[LOW • MIN 8 CHARACTERS]", color: "text-rose-400" };
      case 2:
        return { score: 2, label: "[MODERATE • ADD SYMBOL OR NUMBER]", color: "text-amber-400" };
      case 3:
        return { score: 3, label: "[STRONG • HIGH RESISTANCE SECURED]", color: "text-cyan-400" };
      case 4:
      default:
        return { score: 4, label: "[MAXIMUM • CRYPTOGRAPHICALLY SECURE]", color: "text-emerald-400" };
    }
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
      });

      if (formData.role === "OWNER") {
        navigate("/owner/dashboard");
      } else {
        navigate("/renter/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Persona Presets for instantaneous evaluation
  const handlePrefillLandlord = () => {
    setFormData({
      name: "Vikram Malhotra",
      email: "vikram@estateos.test",
      password: "Password123!",
      phone: "+91 98765 43210",
      role: "OWNER",
    });
    setError(null);
  };

  const handlePrefillResident = () => {
    setFormData({
      name: "Sneha Roy",
      email: "sneha@estateos.test",
      password: "Password123!",
      phone: "+91 91234 56789",
      role: "RENTER",
    });
    setError(null);
  };

  const isOwner = formData.role === "OWNER";

  return (
    <div className="relative min-h-[calc(100vh-80px)] text-slate-100 bg-[#000000] cursor-grid-pattern overflow-hidden px-4 py-6 sm:py-8 selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Custom Interactive Magnetic Cursor */}
      <CustomCursor />

      {/* 2. Realistic Astronomical Deep-Space Starfield */}
      <InteractiveBackgroundCanvas />

      {/* 3. Deep Dark Nebula Aurora Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 -translate-x-1/2 w-[700px] h-[700px] blur-[170px] rounded-full transition-colors duration-1000 ${
            isOwner ? "bg-cyan-500/10" : "bg-emerald-500/10"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] blur-[170px] rounded-full transition-colors duration-1000 ${
            isOwner ? "bg-amber-500/8" : "bg-purple-500/8"
          }`}
        />
      </div>

      {/* 4. Main Spatial Split-Deck Gateway */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-2 shadow-sm">
            <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-300">
              Identity Minting Protocol
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span className="text-[10px] font-mono text-slate-400">Ver 2.6</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            Mint Your <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">EstateOS Identity</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
            Automated escrow accounts, verified smart leases, and instant digital residency keys.
          </p>
        </div>

        {/* 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: 3D Architectural Twin + Live Digital Pass    */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-6 space-y-4 order-2 lg:order-1">
            {/* 3D Architectural Modern Residence Tower */}
            <ArchitecturalResidence3D role={formData.role} />

            {/* Live Holographic Identity Pass (Real-Time Synchronized) */}
            <LiveHoloIdentityPass
              name={formData.name}
              role={formData.role}
              email={formData.email}
              phone={formData.phone}
            />
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: The Minting Console (Form + Controls)      */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-6 order-1 lg:order-2">
            <GlassTiltCard maxTilt={3} className="p-5 sm:p-7 border border-white/10 shadow-2xl relative rounded-2xl">
              
              {/* Header inside Form Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Identity Minting Console
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select your role and configure your credentials</p>
                </div>

                {/* Quick Persona Evaluation Chips */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrefillLandlord}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    title="Pre-fill Landlord Demo Credentials"
                  >
                    <span>👑 Demo Landlord</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrefillResident}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    title="Pre-fill Resident Demo Credentials"
                  >
                    <span>🔑 Demo Resident</span>
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                    <div className="font-medium leading-relaxed">{error}</div>
                  </div>
                  {error.toLowerCase().includes("already exists") && (
                    <div className="pl-6">
                      <Link
                        to="/login"
                        state={{ email: formData.email }}
                        className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-bold underline cursor-pointer"
                      >
                        <span>👉 Click here to Sign In with this email</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Account Role Selector */}
                <div>
                  <label className="block text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300 mb-1.5">
                    1. Network Role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "OWNER" })}
                      className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition duration-300 cursor-pointer ${
                        isOwner
                          ? "bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                          : "bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <Building2 className={`h-4 w-4 ${isOwner ? "text-cyan-400" : "text-slate-500"}`} />
                      <div className="text-left">
                        <div className="text-xs font-black">Property Owner</div>
                        <div className="text-[10px] text-slate-400 font-normal">Asset Operator</div>
                      </div>
                      {isOwner && (
                        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "RENTER" })}
                      className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition duration-300 cursor-pointer ${
                        !isOwner
                          ? "bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                          : "bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <Key className={`h-4 w-4 ${!isOwner ? "text-emerald-400" : "text-slate-500"}`} />
                      <div className="text-left">
                        <div className="text-xs font-black">Renter / Tenant</div>
                        <div className="text-[10px] text-slate-400 font-normal">Verified Resident</div>
                      </div>
                      {!isOwner && (
                        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Full Name Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <span className="text-[10px] font-mono text-cyan-400">Syncs with Pass</span>
                  </div>
                  <div className="relative group">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                  </div>
                </div>

                {/* Email Address Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work / Personal Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vikram@estateos.test"
                      className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                  </div>
                </div>

                {/* Password Input + Kinetic Energy Meter */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Access Keyphrase (Password)</label>
                    <span className={`text-[10px] font-mono font-bold ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Kinetic Cybernetic Power Grid Bar */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[1, 2, 3, 4].map((step) => {
                      const isActive = passwordStrength.score >= step;
                      return (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? step === 1
                                ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                                : step === 2
                                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                : step === 3
                                ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                                : "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                              : "bg-slate-800/80"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number <span className="text-slate-500 font-normal">(Optional for SMS Alerts)</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                  </div>
                </div>

                {/* Submit / Mint Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Minting Identity Pass…</span>
                    </>
                  ) : (
                    <>
                      <span>Mint Account & Launch</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Switch */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
                Already registered in the network?{" "}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition">
                  Sign In to Terminal
                </Link>
              </div>
            </GlassTiltCard>
          </div>

        </div>
      </div>
    </div>
  );
}
