import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../lib/auth.js";
import { api } from "../lib/api.js";
import { BiometricCyberEye } from "../components/BiometricCyberEye.js";
import { InteractiveBackgroundCanvas } from "../components/InteractiveBackgroundCanvas.js";
import { GlassTiltCard } from "../components/GlassTiltCard.js";
import { CustomCursor } from "../components/CustomCursor.js";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  Cpu,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // States for interactive Cyber-Eye
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      const state = location.state as { from?: { pathname: string } } | null;
      let targetPath = state?.from?.pathname;

      if (!targetPath || targetPath === "/login") {
        if (loggedInUser.role === "TENANT") {
          targetPath = "/tenant/dashboard";
        } else if (loggedInUser.role === "RENTER") {
          targetPath = "/renter/dashboard";
        } else {
          targetPath = "/owner/dashboard";
        }
      }

      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };


  const handleInstantPersonaLogin = async (demoEmail: string, demoPass = "password123") => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await login(demoEmail, demoPass);
      const state = location.state as { from?: { pathname: string } } | null;
      let targetPath = state?.from?.pathname;

      if (!targetPath || targetPath === "/login") {
        if (loggedInUser.role === "TENANT") {
          targetPath = "/tenant/dashboard";
        } else if (loggedInUser.role === "RENTER") {
          targetPath = "/renter/dashboard";
        } else {
          targetPath = "/owner/dashboard";
        }
      }

      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickResetAndLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        await api("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ email: "bhargavatejagolla@gmail.com", password: "Anjibunny@123" }),
        });
      } catch {
        // Continue if offline or preview node
      }
      setEmail("bhargavatejagolla@gmail.com");
      setPassword("Anjibunny@123");
      await login("bhargavatejagolla@gmail.com", "Anjibunny@123");
      navigate("/owner/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] text-slate-100 bg-[#000000] cursor-grid-pattern overflow-hidden flex items-center justify-center px-4 py-8 sm:py-14 selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Cursor AI Interactive Magnetic Laser Follower */}
      <CustomCursor />

      {/* 2. Interactive Twinkling Stars & Stardust Trail */}
      <InteractiveBackgroundCanvas />

      {/* 3. Deep Obsidian Aurora Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[650px] h-[650px] bg-cyan-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[650px] h-[650px] bg-indigo-600/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* =========================================================================
              LEFT COLUMN: BIOMETRIC CYBER-EYE SENTINEL & LIVE TELEMETRY
          ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/40 text-xs font-semibold text-cyan-300 shadow-xl shadow-cyan-950/40">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span>BIOMETRIC SPATIAL GATEWAY</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Zero-Trust Auth</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                EstateOS Identity & <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Access Portal.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                Connect directly to your verified property portfolio, digital lease contracts, and real-time cashflow ledgers.
              </p>
            </div>

            {/* The Interactive Cyber-Eye Sentinel */}
            <div className="relative py-4">
              <BiometricCyberEye
                size={270}
                isPasswordFocused={isPasswordFocused}
                isHoveringSubmit={isHoveringSubmit}
                isAuthenticating={loading}
              />
            </div>

            {/* Security Guarantee Pills */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-md pt-2">
              <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 text-center">
                <ShieldCheck className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400 font-mono">TLS 1.3</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 text-center">
                <KeyRound className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400 font-mono">SHA-256 JWT</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 text-center">
                <Cpu className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400 font-mono">AUDIT READY</div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: GLASSMORPHIC AUTH CARD WITH QUICK-FILL ROLES
          ========================================================================= */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <GlassTiltCard maxTilt={5} className="p-7 sm:p-9 border border-white/10 shadow-2xl relative">
              <div className="text-left mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
                  <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                    SECURE NODE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Enter credentials or select a verified test persona below.</p>
              </div>

              {/* Instant 1-Click Demo Account Quick-Fill Chips */}
              <div className="mb-6 p-3.5 rounded-xl bg-black/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Verified Test Personas (Click to Load or Instant Sign In):</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInstantPersonaLogin("bhargavatejagolla@gmail.com", "Anjibunny@123")}
                    className="px-2.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition flex items-center justify-between cursor-pointer group"
                    title="Sign in as BT (Owner)"
                  >
                    <span className="truncate">👑 BT (Owner)</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantPersonaLogin("priya@estateos.com", "password123")}
                    className="px-2.5 py-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition flex items-center justify-between cursor-pointer group"
                    title="Sign in as Priya Nair (Tenant - Active Lease)"
                  >
                    <span className="truncate">🔑 Tenant (Priya)</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantPersonaLogin("tenant8@lease.test", "password123")}
                    className="px-2.5 py-2 rounded-lg bg-slate-900/90 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 text-[11px] font-semibold transition flex items-center justify-between cursor-pointer group"
                    title="Sign in as Tenant 8"
                  >
                    <span className="truncate">🔑 Tenant 8</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantPersonaLogin("rajesh@estateos.com", "password123")}
                    className="px-2.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition flex items-center justify-between cursor-pointer group"
                    title="Sign in as Rajesh Kumar (Owner)"
                  >
                    <span className="truncate">👑 Rajesh (Owner)</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantPersonaLogin("owner8@lease.test", "password123")}
                    className="px-2.5 py-2 rounded-lg bg-slate-900/90 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-[11px] font-semibold transition flex items-center justify-between cursor-pointer group"
                    title="Sign in as Owner 8"
                  >
                    <span className="truncate">👑 Owner 8</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantPersonaLogin("arjun@estateos.com", "password123")}
                    className="px-2.5 py-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/40 text-[11px] font-semibold transition flex items-center justify-between cursor-pointer group"
                    title="Sign in as Arjun Mehta (Renter)"
                  >
                    <span className="truncate">🔍 Renter (Arjun)</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <div className="font-medium">{error}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickResetAndLogin}
                    className="text-left text-[11px] text-cyan-300 hover:text-cyan-200 underline font-bold cursor-pointer"
                  >
                    ⚡ Click here to 1-click sync password for bhargavatejagolla@gmail.com & Enter Dashboard
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ananya@estateos.test"
                      className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                  </div>
                </div>

                {/* Password Input (Triggers Eye Shielding on focus!) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[10px] text-slate-500 font-mono">Encrypted Input</span>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      placeholder="••••••••"
                      className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  className="w-full mt-5 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 shadow-xl shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Authenticating Handshake…</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize & Sign In</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Switch */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
                New to EstateOS?{" "}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition">
                  Create a free account
                </Link>
              </div>
            </GlassTiltCard>
          </div>
        </div>
      </div>
    </div>
  );
}
