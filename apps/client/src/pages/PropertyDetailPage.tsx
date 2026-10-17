import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import type { PropertyResponse, EnquiryResponse } from "@estateos/shared";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  CheckCircle2,
  Calendar,
  Send,
  Building2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enquiry & Appointment form state
  const [enquiryMessage, setEnquiryMessage] = useState(
    "Hi, I am interested in renting this property. Is it available for inspection?"
  );
  const [existingEnquiry, setExistingEnquiry] = useState<EnquiryResponse | null>(null);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Visit scheduling state
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("11:00");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.get<PropertyResponse>(`/api/properties/${id}`);
      setProperty(data);
      const firstImg = data.images?.[0];
      if (firstImg) {
        setSelectedImage(firstImg.url);
      }
    } catch {
      setError("Property not found or unavailable");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkExistingEnquiry = useCallback(async () => {
    if (!user || user.role !== "RENTER" || !id) return;
    try {
      const enquiries = await api.get<EnquiryResponse[]>(`/api/enquiries?propertyId=${id}`);
      const firstEnq = enquiries?.[0];
      if (firstEnq) {
        setExistingEnquiry(firstEnq);
      }
    } catch {
      // Ignore if not found
    }
  }, [user, id]);

  useEffect(() => {
    fetchProperty();
    checkExistingEnquiry();
  }, [fetchProperty, checkExistingEnquiry]);

  const handleToggleFavourite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!property) return;

    const currentFav = !!property.isFavourited;
    setProperty({ ...property, isFavourited: !currentFav });

    try {
      if (currentFav) {
        await api.delete(`/api/favourites/${property.id}`);
      } else {
        await api.post(`/api/favourites/${property.id}`, {});
      }
    } catch {
      setProperty({ ...property, isFavourited: currentFav });
    }
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!id) return;

    setEnquiryLoading(true);
    setError(null);
    try {
      const res = await api.post<EnquiryResponse>("/api/enquiries", {
        propertyId: id,
        message: enquiryMessage,
      });
      setExistingEnquiry(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send enquiry";
      setError(msg);
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingEnquiry || !visitDate) return;

    setVisitLoading(true);
    setError(null);
    try {
      const isoDatetime = new Date(`${visitDate}T${visitTime}:00`).toISOString();
      await api.post("/api/appointments", {
        enquiryId: existingEnquiry.id,
        visitAt: isoDatetime,
        notes: visitNotes || undefined,
      });
      setVisitSuccess(true);
      await checkExistingEnquiry();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to schedule visit";
      setError(msg);
    } finally {
      setVisitLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!property) return;
    try {
      const updated = await api.patch<PropertyResponse>(`/api/properties/${property.id}/publish`, {});
      setProperty(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400">
        Loading property details...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Property Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || "This listing is not available."}</p>
        <Link
          to="/"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwnerOfProperty = user?.id === property.ownerId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button & Action header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFavourite}
            className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-medium transition ${
              property.isFavourited
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                property.isFavourited ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
            {property.isFavourited ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos, Overview & Specs (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 sm:h-[450px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <Building2 className="h-16 w-16 mb-2 opacity-40" />
                  <span className="text-sm">No photos uploaded for this property</span>
                </div>
              )}

              {/* Status Pill */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                  {property.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700">
                  {property.availability.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {property.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative h-20 w-28 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      selectedImage === img.url ? "border-emerald-500" : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Specs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
                <span>{property.propertyType}</span>
                <span>•</span>
                <span>{property.furnishing.replace("_", " ")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {property.title}
              </h1>
              <p className="text-sm text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                {property.address}, {property.locality}, {property.city}
                {property.pincode && ` - ${property.pincode}`}
              </p>
            </div>

            {/* Key Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Bedrooms</span>
                <span className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                  <Bed className="h-4 w-4 text-emerald-400" /> {property.bedrooms} BHK
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Bathrooms</span>
                <span className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                  <Bath className="h-4 w-4 text-emerald-400" /> {property.bathrooms} Baths
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Carpet Area</span>
                <span className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                  <Square className="h-4 w-4 text-emerald-400" /> {property.areaSqft} sqft
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Furnishing</span>
                <span className="text-sm font-bold text-white capitalize">
                  {property.furnishing.toLowerCase().replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                About this Home
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  Amenities & Facilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Funnel Actions (1 col) */}
        <div className="space-y-6">
          {/* Price & Deposit Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6 pb-6 border-b border-slate-800">
              <span className="text-xs text-slate-400 block mb-1 font-medium">Monthly Rent</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  ₹{property.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>

              {property.depositAmount && (
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                  <span>Security Deposit:</span>
                  <span className="font-semibold text-slate-200">
                    ₹{property.depositAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Owner Profile Card */}
            {property.owner && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mb-2">
                  Listed By Owner
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                    {property.owner.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      {property.owner.name}
                      <span title="Verified Owner">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">{property.owner.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Funnel Action Card */}
            {isOwnerOfProperty ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>Listing Status</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        property.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    {property.status === "ACTIVE"
                      ? "This property is visible to renters in marketplace search."
                      : "This property is currently in DRAFT and hidden from public search."}
                  </p>
                </div>

                <button
                  onClick={handlePublishToggle}
                  className={`w-full py-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                    property.status === "ACTIVE"
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  {property.status === "ACTIVE" ? "Unpublish to Draft" : "Publish to Marketplace"}
                </button>

                <Link
                  to="/owner/dashboard"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center block transition"
                >
                  Manage in Owner Dashboard
                </Link>
              </div>
            ) : user && user.role === "RENTER" ? (
              <div className="space-y-4">
                {existingEnquiry ? (
                  <div className="space-y-4">
                    {/* Enquiry Status Box */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> Enquiry Submitted
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-emerald-500/30 text-emerald-300">
                          {existingEnquiry.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{existingEnquiry.message}"</p>
                    </div>

                    {/* Schedule Visit Form */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-400" /> Book / Request Property Visit
                      </h4>

                      {visitSuccess ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          Visit requested! The owner has been notified.
                        </div>
                      ) : (
                        <form onSubmit={handleScheduleVisit} className="space-y-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Visit Date
                            </label>
                            <input
                              type="date"
                              required
                              value={visitDate}
                              onChange={(e) => setVisitDate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Preferred Time
                            </label>
                            <input
                              type="time"
                              required
                              value={visitTime}
                              onChange={(e) => setVisitTime(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Notes for Owner (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Coming with family, interested in 1-year lease"
                              value={visitNotes}
                              onChange={(e) => setVisitNotes(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={visitLoading}
                            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs transition shadow-lg shadow-emerald-500/20"
                          >
                            {visitLoading ? "Booking..." : "Request Visit Appointment"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendEnquiry} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5 text-emerald-400" /> Send Enquiry to Landlord
                      </span>
                      <span className="text-[11px] text-slate-500">Free Direct Lead</span>
                    </div>

                    <textarea
                      rows={3}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Write your message to the owner..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />

                    <button
                      type="submit"
                      disabled={enquiryLoading}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {enquiryLoading ? "Sending..." : "Enquire Directly"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <Clock className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Interested in this property?</h4>
                <p className="text-xs text-slate-400">
                  Sign in or create a renter account to message the landlord directly and book an inspection visit.
                </p>
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
