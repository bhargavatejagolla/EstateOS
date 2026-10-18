import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import type { PropertyResponse, PropertyListResponse } from "@estateos/shared";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  Sparkles,
  Map as MapIcon,
  LayoutGrid,
  Navigation,
  ArrowRight,
} from "lucide-react";

export default function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Filters state
  const [city, setCity] = useState("");
  const [q, setQ] = useState("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [furnishing, setFurnishing] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (q) params.append("q", q);
      if (bedrooms) params.append("bedrooms", bedrooms);
      if (propertyType) params.append("propertyType", propertyType);
      if (furnishing) params.append("furnishing", furnishing);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sortBy) params.append("sortBy", sortBy);
      params.append("limit", "24");

      const res = await api.get<PropertyListResponse>(`/api/properties?${params.toString()}`);
      setProperties(res.properties);
      setTotal(res.total);
    } catch {
      // In case of error, default to empty list
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [city, q, bedrooms, propertyType, furnishing, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleToggleFavourite = async (propertyId: string, currentFav: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    // Optimistic UI update
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isFavourited: !currentFav } : p))
    );

    try {
      if (currentFav) {
        await api.delete(`/api/favourites/${propertyId}`);
      } else {
        await api.post(`/api/favourites/${propertyId}`, {});
      }
    } catch {
      // Revert if error
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, isFavourited: currentFav } : p))
      );
    }
  };

  const handleResetFilters = () => {
    setCity("");
    setQ("");
    setBedrooms("");
    setPropertyType("");
    setFurnishing("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Direct Owner Rentals — Zero Brokerage
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Find verified homes for rent with verified operations.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8">
            Enquire directly with landlords, request in-person or virtual property tours, and sign transparent digital leases.
          </p>

          {/* Quick Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700/80 shadow-xl">
            <div className="flex-1 flex items-center px-4 gap-3 bg-slate-900 rounded-xl border border-slate-800">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by locality, project name, or keyword..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full py-3 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center px-4 gap-2 bg-slate-900 rounded-xl border border-slate-800 sm:w-48">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder="City (e.g. Bangalore)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-3 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" /> Filter Properties
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Bedrooms */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Bedrooms (BHK)</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">Independent House</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio Flat</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Furnishing Status</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Any Furnishing</option>
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="FULLY_FURNISHED">Fully-Furnished</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Price Range (₹ / Month)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Available Homes</h2>
          <p className="text-xs text-slate-400">
            {loading ? "Searching..." : `Showing ${properties.length} of ${total} active listings`}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                viewMode === "grid"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grid
            </button>
            <button
              onClick={() => {
                setViewMode("map");
                if (!selectedPinId && properties[0]) {
                  setSelectedPinId(properties[0].id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                viewMode === "map"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Map View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="newest">Newly Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Display: Grid vs Map */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl h-96 animate-pulse"
            ></div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
          <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No properties matched your criteria</h3>
          <p className="text-sm text-slate-400 mb-6">
            Try adjusting your price range, locality search, or clear your filters to see all available homes.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "map" ? (
        /* Map View Mode: Split Map Canvas & Selected Property Preview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Map Locality Radar / Canvas */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden min-h-[520px] flex flex-col justify-between shadow-2xl">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Top Map Bar */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                <span className="text-xs font-bold text-white">
                  Locality Cluster View • {city || "All Localities"}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {properties.length} Geo Pins Loaded
              </span>
            </div>

            {/* Interactive Locality Map Pins Display */}
            <div className="relative z-10 py-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {properties.map((prop, idx) => {
                const isSelected = (selectedPinId || properties[0]?.id) === prop.id;
                return (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedPinId(prop.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                            isSelected ? "bg-emerald-400 animate-ping" : "bg-slate-600"
                          }`}
                        />
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">
                          {prop.locality}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {prop.bedrooms} BHK
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1 pt-2 border-t border-slate-800/60">
                      <span className="text-sm font-extrabold text-emerald-400">
                        ₹{(prop.price / 1000).toFixed(0)}k<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {prop.propertyType.toLowerCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Map Canvas Footer Note */}
            <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" /> Click any pin to inspect listing details
              </span>
              <span>Coordinates verified from property address</span>
            </div>
          </div>

          {/* Selected Property Preview Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            {(() => {
              const activeProp =
                properties.find((p) => p.id === (selectedPinId || properties[0]?.id)) ||
                properties[0];
              if (!activeProp) return null;

              const activePrimaryImg =
                activeProp.images.find((img) => img.isPrimary)?.url ||
                activeProp.images[0]?.url ||
                null;

              return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                  {/* Photo */}
                  <div className="relative h-48 bg-slate-950">
                    {activePrimaryImg ? (
                      <img
                        src={activePrimaryImg}
                        alt={activeProp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        <Building2 className="h-10 w-10 mb-1 opacity-40" />
                        <span className="text-xs">No photos uploaded</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                        {activeProp.propertyType}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-2xl font-extrabold text-white">
                          ₹{activeProp.price.toLocaleString("en-IN")}
                          <span className="text-xs text-slate-400 font-normal"> / mo</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-base mb-1 line-clamp-1">
                        {activeProp.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {activeProp.locality}, {activeProp.city}
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-xs text-slate-300">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-slate-500" />
                          <span>{activeProp.bedrooms} BHK</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-slate-500" />
                          <span>{activeProp.bathrooms} Bath</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-3.5 w-3.5 text-slate-500" />
                          <span>{activeProp.areaSqft} sqft</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/properties/${activeProp.id}`}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 text-center flex items-center justify-center gap-1.5"
                    >
                      View Full Listing <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* Standard Grid View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => {
            const primaryImage =
              prop.images.find((img) => img.isPrimary)?.url ||
              prop.images[0]?.url ||
              null;

            return (
              <div
                key={prop.id}
                className="group bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col"
              >
                {/* Image Banner */}
                <div className="relative h-56 bg-slate-950 overflow-hidden">
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 text-slate-600">
                      <Building2 className="h-10 w-10 mb-2 opacity-40" />
                      <span className="text-xs">No photos uploaded</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                      {prop.propertyType}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
                      {prop.furnishing.replace("_", " ")}
                    </span>
                  </div>

                  {/* Favourite Button */}
                  <button
                    onClick={(e) => handleToggleFavourite(prop.id, !!prop.isFavourited, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-rose-400 transition"
                    title={prop.isFavourited ? "Remove from saved" : "Save property"}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        prop.isFavourited ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                  </button>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-lg font-bold text-white">
                      ₹{prop.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400 font-normal"> / month</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-emerald-400 transition">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {prop.locality}, {prop.city}
                    </p>

                    {/* Specs Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-slate-500" />
                        <span>{prop.bedrooms} BHK</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-slate-500" />
                        <span>{prop.bathrooms} Bath</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Square className="h-4 w-4 text-slate-500" />
                        <span>{prop.areaSqft} sqft</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-5 pt-2 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {prop.depositAmount ? (
                        <span>Deposit: ₹{prop.depositAmount.toLocaleString("en-IN")}</span>
                      ) : (
                        <span>Negotiable deposit</span>
                      )}
                    </div>
                    <Link
                      to={`/properties/${prop.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-semibold text-xs border border-emerald-500/30 hover:border-transparent transition duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
