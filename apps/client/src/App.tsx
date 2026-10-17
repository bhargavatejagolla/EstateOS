import React from "react";
import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { Navbar } from "./components/Navbar.js";
import MarketplacePage from "./pages/MarketplacePage.js";
import PropertyDetailPage from "./pages/PropertyDetailPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import LoginPage from "./pages/LoginPage.js";
import OwnerDashboard from "./pages/OwnerDashboard.js";
import RenterDashboard from "./pages/RenterDashboard.js";
import NewPropertyPage from "./pages/NewPropertyPage.js";
import FavouritesPage from "./pages/FavouritesPage.js";

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          {/* Public Marketplace Routes */}
          <Route path="/" element={<MarketplacePage />} />
          <Route path="/search" element={<MarketplacePage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Renter Dashboard & Favourites */}
          <Route
            path="/renter/dashboard"
            element={
              <ProtectedRoute roles={["RENTER", "ADMIN"]}>
                <RenterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute roles={["RENTER", "OWNER", "ADMIN"]}>
                <FavouritesPage />
              </ProtectedRoute>
            }
          />

          {/* Owner Dashboard & Listings */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/properties/new"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <NewPropertyPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<MarketplacePage />} />
        </Routes>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} EstateOS. Full-Lifecycle Rental Operations Platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Marketplace Operational
            </span>
            <span>•</span>
            <span>Phase 3: The Funnel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
