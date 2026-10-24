import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/auth.js";
import { InteractiveBackgroundCanvas } from "../components/InteractiveBackgroundCanvas.js";
import { GlassTiltCard } from "../components/GlassTiltCard.js";
import { CustomCursor } from "../components/CustomCursor.js";
import {
  Shield,
  User as UserIcon,
  AlertCircle,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
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
        navigate("/marketplace");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] text-slate-100 bg-[#000000] cursor-grid-pattern overflow-hidden flex items-center justify-center px-4 py-10 selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Custom Cursor */}
      <CustomCursor />

      {/* 2. Interactive Twinkling Stars Canvas */}
      <InteractiveBackgroundCanvas />

      {/* 3. Deep Dark Nebula Aurora Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <GlassTiltCard maxTilt={5} className="p-7 sm:p-9 border border-white/10 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-400 items-center justify-center mb-3 shadow-lg shadow-cyan-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create your account</h1>
            <p className="text-xs text-slate-400 mt-1">Join the full-lifecycle property operating system</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Your Role</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "OWNER" })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                    formData.role === "OWNER"
                      ? "bg-cyan-500/15 border-cyan-500/80 text-cyan-300 shadow-md shadow-cyan-500/20"
                      : "bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span>Property Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "RENTER" })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                    formData.role === "RENTER"
                      ? "bg-emerald-500/15 border-emerald-500/80 text-emerald-300 shadow-md shadow-emerald-500/20"
                      : "bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <UserIcon className="h-4 w-4 text-emerald-400" />
                  <span>Renter / Tenant</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vikram@example.com"
                  className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-black/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 shadow-xl shadow-cyan-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Provisioning Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Switch */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition">
              Sign In
            </Link>
          </div>
        </GlassTiltCard>
      </div>
    </div>
  );
}
