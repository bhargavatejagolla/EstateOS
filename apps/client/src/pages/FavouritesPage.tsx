import React from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import type { PropertyResponse } from "@estateos/shared";
import { Heart, MapPin, Trash2, Bed, Bath, Square, Building2, ArrowLeft, Home } from "lucide-react";

interface FavouriteItem {
  userId: string;
  propertyId: string;
  createdAt: string;
  property: PropertyResponse;
}

export default function FavouritesPage() {
  const queryClient = useQueryClient();

  const { data: favourites = [], isLoading } = useQuery<FavouriteItem[]>({
    queryKey: ["favourites-page"],
    queryFn: () => api.get<FavouriteItem[]>("/api/favourites"),
  });

  const removeMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return api.delete(`/api/favourites/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favourites-page"] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Return to Landing Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 text-xs font-semibold transition group shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform text-emerald-400" />
          <span>Back to Home</span>
        </Link>

        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-emerald-400 transition flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link to="/search" className="hover:text-emerald-400 transition">
            Browse Homes
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-semibold">Saved Properties</span>
        </nav>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
          Saved Properties
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review all the properties you've shortlisted. Compare pricing and enquire directly when ready.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : favourites.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
          <Heart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No saved properties yet</h3>
          <p className="text-sm text-slate-400 mb-6">
            Whenever you find a listing you love, hit the heart icon to save it here for later.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/search"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
            >
              Browse All Homes
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map(({ property }) => {
            const primaryImage =
              property.images?.find((img) => img.isPrimary)?.url ||
              property.images?.[0]?.url ||
              null;

            return (
              <div
                key={property.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        <Building2 className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs">No image available</span>
                      </div>
                    )}

                    <button
                      onClick={() => removeMutation.mutate(property.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-rose-400 hover:text-rose-300 border border-slate-800 transition"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xl font-extrabold text-white">
                        ₹{Number(property.price).toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        {property.propertyType}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base mb-1 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {property.locality}, {property.city}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5 text-slate-500" /> {property.bedrooms} BHK
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5 text-slate-500" /> {property.bathrooms} Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <Square className="h-3.5 w-3.5 text-slate-500" /> {property.areaSqft} sqft
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                  <Link
                    to={`/properties/${property.id}`}
                    className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-semibold text-xs border border-emerald-500/30 hover:border-transparent text-center block transition"
                  >
                    View Details & Enquire
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
