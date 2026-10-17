import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import type { EnquiryStatus, AppointmentStatus, PropertyResponse } from "@estateos/shared";
import {
  Calendar,
  MessageSquare,
  Heart,
  Clock,
  MapPin,
  Trash2,
  ArrowRight,
} from "lucide-react";

interface Enquiry {
  id: string;
  userId: string;
  propertyId: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    price: number;
    city: string;
    locality: string;
    images?: Array<{ id: string; url: string }>;
  };
  appointments?: Appointment[];
}

interface Appointment {
  id: string;
  enquiryId: string;
  visitAt: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
  enquiry?: {
    id: string;
    property?: {
      id: string;
      title: string;
      city: string;
      locality: string;
    };
  };
}

interface FavouriteItem {
  userId: string;
  propertyId: string;
  createdAt: string;
  property: PropertyResponse;
}

export default function RenterDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"enquiries" | "visits" | "saved">("enquiries");

  // Query: Renter Enquiries
  const { data: enquiries = [], isLoading: loadingEnquiries } = useQuery<Enquiry[]>({
    queryKey: ["renter-enquiries"],
    queryFn: () => api.get<Enquiry[]>("/api/enquiries"),
  });

  // Query: Renter Appointments
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["renter-appointments"],
    queryFn: () => api.get<Appointment[]>("/api/appointments"),
  });

  // Query: Renter Favourites
  const { data: favourites = [], isLoading: loadingFavourites } = useQuery<FavouriteItem[]>({
    queryKey: ["renter-favourites"],
    queryFn: () => api.get<FavouriteItem[]>("/api/favourites"),
  });

  // Mutation: Cancel Appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/api/appointments/${id}`, { status: "CANCELLED" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renter-appointments"] });
    },
  });

  // Mutation: Remove Favourite
  const removeFavouriteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return api.delete(`/api/favourites/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renter-favourites"] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Renter Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Welcome back, <span className="text-emerald-400 font-semibold">{user?.name}</span>. Track your rental applications, scheduled visits, and saved homes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8 space-x-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("enquiries")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "enquiries"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          My Enquiries ({enquiries.length})
        </button>

        <button
          onClick={() => setActiveTab("visits")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "visits"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Scheduled Visits ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "saved"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Heart className="h-4 w-4" />
          Saved Homes ({favourites.length})
        </button>
      </div>

      {/* Tab 1: Enquiries */}
      {activeTab === "enquiries" && (
        <>
          {loadingEnquiries ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
              <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No enquiries sent yet</h3>
              <p className="text-sm text-slate-400 mb-6">
                Browse our marketplace and send a direct enquiry to any landlord with zero brokerage.
              </p>
              <Link
                to="/"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400">Enquiry on property:</span>
                      <h3 className="font-bold text-white text-lg">{enq.property?.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        {enq.property?.locality}, {enq.property?.city} • ₹{Number(enq.property?.price).toLocaleString("en-IN")}/mo
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          enq.status === "NEW"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : enq.status === "CONTACTED"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : enq.status === "VISIT_SCHEDULED"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : enq.status === "CLOSED_WON"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {enq.status}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Your Message:
                    </span>
                    "{enq.message}"
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Sent on {new Date(enq.createdAt).toLocaleDateString("en-IN")}
                    </span>

                    <Link
                      to={`/properties/${enq.propertyId}`}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
                    >
                      View Property & Book Visit <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Visits */}
      {activeTab === "visits" && (
        <>
          {loadingAppointments ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
              <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No visits scheduled</h3>
              <p className="text-sm text-slate-400">
                You can schedule inspection visits on any property you've enquired about.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {apt.status}
                      </span>
                      <span className="font-bold text-white text-base">
                        {apt.enquiry?.property?.title || "Property Visit"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      {new Date(apt.visitAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {apt.enquiry?.property?.locality}, {apt.enquiry?.property?.city}
                    </p>

                    {apt.notes && (
                      <p className="text-xs text-slate-400 italic">Notes: "{apt.notes}"</p>
                    )}
                  </div>

                  {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                    <button
                      onClick={() => cancelAppointmentMutation.mutate(apt.id)}
                      disabled={cancelAppointmentMutation.isPending}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold transition"
                    >
                      Cancel Visit
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 3: Saved Homes */}
      {activeTab === "saved" && (
        <>
          {loadingFavourites ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-72 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : favourites.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
              <Heart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No saved homes yet</h3>
              <p className="text-sm text-slate-400 mb-6">
                Click the heart icon on any listing to save it here for quick access later.
              </p>
              <Link
                to="/"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition"
              >
                Find Homes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favourites.map(({ property }) => (
                <div
                  key={property.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xl font-extrabold text-white">
                        ₹{Number(property.price).toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </span>
                      <button
                        onClick={() => removeFavouriteMutation.mutate(property.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-white text-base mb-1">{property.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {property.locality}, {property.city}
                    </p>

                    <div className="text-xs text-slate-400">
                      {property.bedrooms} BHK • {property.bathrooms} Bath • {property.areaSqft} sqft
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
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
