import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../lib/auth.js";
import { NotificationBell } from "./NotificationBell.js";
import {
  Building2,
  LogOut,
  Heart,
  Calendar,
  PlusCircle,
  LayoutDashboard,
  Search,
  FileText,
  Wrench,
  CreditCard,
  Sparkles,
  Home,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 pt-3 pb-1 pointer-events-auto">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex items-center justify-between transition-all">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
              <Building2 className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div className="flex items-center">
              <span className="text-lg font-black tracking-tight text-white">
                Estate<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">OS</span>
              </span>
              <span className="ml-2.5 hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                2.0
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                isActive("/")
                  ? "bg-white/[0.08] text-white border border-white/10"
                  : "hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Home className="h-3.5 w-3.5 text-cyan-400" />
              <span>Home</span>
            </Link>

            <Link
              to="/marketplace"
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                isActive("/marketplace") || isActive("/search")
                  ? "bg-white/[0.08] text-white border border-white/10"
                  : "hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Search className="h-3.5 w-3.5 text-blue-400" />
              <span>Browse Homes</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/recommendations"
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    isActive("/recommendations")
                      ? "bg-white/[0.08] text-white border border-white/10"
                      : "hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>For You</span>
                </Link>

                <Link
                  to="/favourites"
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    isActive("/favourites")
                      ? "bg-white/[0.08] text-white border border-white/10"
                      : "hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  <span>Saved</span>
                </Link>
              </>
            )}

            {user?.role === "OWNER" && (
              <>
                <Link
                  to="/owner/leases"
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    isActive("/owner/leases")
                      ? "bg-white/[0.08] text-white border border-white/10"
                      : "hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Leases</span>
                </Link>

                <Link
                  to="/owner/maintenance"
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    isActive("/owner/maintenance")
                      ? "bg-white/[0.08] text-white border border-white/10"
                      : "hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5 text-amber-400" />
                  <span>Maintenance</span>
                </Link>
              </>
            )}

            {(user?.role === "TENANT" || user?.role === "RENTER") && (
              <Link
                to="/tenant/dashboard"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  isActive("/tenant/dashboard")
                    ? "bg-white/[0.08] text-white border border-white/10"
                    : "hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
                <span>My Lease & Rent</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Actions & User Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />

              {user.role === "OWNER" && (
                <>
                  <Link
                    to="/owner/dashboard"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-200 transition"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/owner/properties/new"
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 transition"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Post Property</span>
                  </Link>
                </>
              )}

              {user.role === "RENTER" && (
                <Link
                  to="/renter/dashboard"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Enquiries & Visits</span>
                </Link>
              )}

              {/* User Identity Chip */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white max-w-[90px] truncate">{user.name}</span>
                <span className="text-slate-500 text-[10px]">({user.role})</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
