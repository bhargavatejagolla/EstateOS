import React from "react";
import { Link, useNavigate } from "react-router";
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Building2 className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Estate<span className="text-emerald-400">OS</span>
              </span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Phase 5
              </span>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-300">
            <Link
              to="/"
              className="hover:text-emerald-400 transition flex items-center gap-1.5"
            >
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link
              to="/search"
              className="hover:text-emerald-400 transition flex items-center gap-1.5"
            >
              <Search className="h-4 w-4" /> Browse Homes
            </Link>
            {user && (
              <>
                <Link
                  to="/recommendations"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" /> For You
                </Link>
                <Link
                  to="/favourites"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <Heart className="h-4 w-4" /> Saved Homes
                </Link>
              </>
            )}
            {user?.role === "OWNER" && (
              <>
                <Link
                  to="/owner/leases"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" /> Leases
                </Link>
                <Link
                  to="/owner/maintenance"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <Wrench className="h-4 w-4" /> Maintenance
                </Link>
              </>
            )}
            {(user?.role === "TENANT" || user?.role === "RENTER") && (
              <Link
                to="/tenant/dashboard"
                className="hover:text-emerald-400 transition flex items-center gap-1.5"
              >
                <CreditCard className="h-4 w-4" /> My Lease & Rent
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />

              {user.role === "OWNER" && (
                <>
                  <Link
                    to="/owner/dashboard"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" /> Dashboard
                  </Link>
                  <Link
                    to="/owner/properties/new"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Post Property
                  </Link>
                </>
              )}

              {user.role === "RENTER" && (
                <Link
                  to="/renter/dashboard"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition"
                >
                  <Calendar className="h-3.5 w-3.5" /> Enquiries & Visits
                </Link>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-medium text-white max-w-[100px] truncate">{user.name}</span>
                <span className="text-slate-500">({user.role})</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg transition shadow-lg shadow-emerald-500/20"
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
