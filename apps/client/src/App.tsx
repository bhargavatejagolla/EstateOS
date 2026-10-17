import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router";
import { useAuth } from "./lib/auth.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import RegisterPage from "./pages/RegisterPage.js";
import LoginPage from "./pages/LoginPage.js";
import OwnerDashboard from "./pages/OwnerDashboard.js";
import NewPropertyPage from "./pages/NewPropertyPage.js";
import { Building2, LogOut, ArrowRight, Sparkles } from "lucide-react";

export function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Building2 className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Estate<span className="text-emerald-400">OS</span>
              </span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Phase 2
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "OWNER" && (
                  <Link
                    to="/owner/dashboard"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition"
                  >
                    Dashboard
                  </Link>
                )}

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="font-medium text-white">{user.name}</span>
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

      {/* Main Content Router */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
                  <Sparkles className="h-3.5 w-3.5" /> Phase 2 Product Operational
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-3xl mx-auto">
                  Connected Rental Operations with{" "}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Authenticated Workflows
                  </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Owners register, authenticate via rotating JWTs, manage listings with Cloudinary photo uploads, and control inventory.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  {user ? (
                    user.role === "OWNER" ? (
                      <Link
                        to="/owner/dashboard"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
                      >
                        Open Owner Dashboard <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300">
                        Signed in as Renter ({user.email}). Renter discovery arriving in Phase 3.
                      </div>
                    )
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
                      >
                        Register as Owner <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/login"
                        className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium transition"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute role="OWNER">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/properties/new"
            element={
              <ProtectedRoute role="OWNER">
                <NewPropertyPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 EstateOS. Full-Lifecycle Rental Operations.</p>
          <div className="flex items-center gap-4">
            <span>Status: Phase 2 Active</span>
            <span>•</span>
            <span>RBAC & Cloudinary Media</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
