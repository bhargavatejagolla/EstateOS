import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import type { RecommendationsResponse } from "@estateos/shared";
import { getPropertyImageUrl, onImageError } from "../lib/image.js";
import {
  Sparkles,
  MapPin,
  Bed,
  CheckCircle2,
  Building,
  Heart,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Home,
} from "lucide-react";

export default function RecommendationsPage() {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecs() {
      try {
        setLoading(true);
        const res = await api.get<RecommendationsResponse>("/recommendations");
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }
    fetchRecs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
          <span className="text-emerald-400 font-semibold">For You</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Reliability Engine · Content-Based
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Recommended Homes For You
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Explainable recommendations derived from your real shortlist and lead activity. Zero black-box neural networks.
        </p>

        {data && data.basedOn.cities.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-200">Derived from your activity:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {data.basedOn.favourites} saved listings
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {data.basedOn.enquiries} enquiries
            </span>
            <span className="text-slate-500">•</span>
            <span>Target cities:</span>
            {data.basedOn.cities.map((city) => (
              <span
                key={city}
                className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium"
              >
                {city}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-slate-800/60 border border-slate-700/50" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {!loading && data && data.data.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <Heart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200">No Recommendations Yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
            Start shortlisting properties or submitting enquiries in the marketplace. EstateOS will
            instantly build a factual profile and suggest homes matching your preferences.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
          >
            Browse Marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!loading && data && data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((rec) => (
            <div
              key={rec.propertyId}
              className="group flex flex-col bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition shadow-lg hover:shadow-xl"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-slate-800 overflow-hidden">
                {rec.imageUrl ? (
                  <img
                    src={getPropertyImageUrl(rec.imageUrl)}
                    alt={rec.title}
                    onError={onImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800/80">
                    <Building className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-emerald-400">
                  ₹{rec.price.toLocaleString()}/mo
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-base group-hover:text-emerald-400 transition line-clamp-1">
                    {rec.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" /> {rec.city}
                    </span>
                    {rec.bedrooms !== undefined && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5 text-slate-500" /> {rec.bedrooms} BHK
                      </span>
                    )}
                  </div>

                  {/* Reasons box — Explainability proof */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Why this matches you:
                    </div>
                    <ul className="space-y-1.5">
                      {rec.reasons.map((r, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{r.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  to={`/properties/${rec.propertyId}`}
                  className="w-full text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 transition flex items-center justify-center gap-1.5 group-hover:border-emerald-500/30"
                >
                  View Property Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Honesty note */}
      <div className="mt-12 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
        <p>
          💡 <strong className="text-slate-400">Honesty Guard:</strong> Every recommendation is matched using
          explicit rule-based signals from your activity. Properties that match no rules are never returned.
        </p>
      </div>
    </div>
  );
}
