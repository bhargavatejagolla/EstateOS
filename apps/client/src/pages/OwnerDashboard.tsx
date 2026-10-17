import React, { useRef, useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
import type { EnquiryStatus, AppointmentStatus } from "@estateos/shared";
import {
  Plus,
  Building,
  MapPin,
  Bed,
  Bath,
  Square,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Eye,
  EyeOff,
  Clock,
  User as UserIcon,
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  price: string | number;
  depositAmount?: string | number | null;
  city: string;
  locality: string;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  furnishing: string;
  amenities: string[];
  status: string;
  availability: string;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  _count?: {
    enquiries: number;
    favourites: number;
  };
  createdAt: string;
}

interface Enquiry {
  id: string;
  userId: string;
  propertyId: string;
  message: string;
  status: EnquiryStatus;
  ownerNotes?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  property?: {
    id: string;
    title: string;
    price: number;
    city: string;
    locality: string;
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
    message: string;
    user?: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
    };
    property?: {
      id: string;
      title: string;
      city: string;
      locality: string;
    };
  };
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"properties" | "leads" | "visits">("properties");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [enquiryId: string]: string }>({});

  // Query: Owner Properties
  const { data: properties = [], isLoading: loadingProperties } = useQuery<Property[]>({
    queryKey: ["owner-properties"],
    queryFn: () => api.get<Property[]>("/api/properties/mine"),
  });

  // Query: Enquiries / Leads
  const { data: enquiries = [], isLoading: loadingEnquiries } = useQuery<Enquiry[]>({
    queryKey: ["owner-enquiries"],
    queryFn: () => api.get<Enquiry[]>("/api/enquiries"),
  });

  // Query: Scheduled Appointments
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["owner-appointments"],
    queryFn: () => api.get<Appointment[]>("/api/appointments"),
  });

  // Mutation: Upload Image
  const uploadMutation = useMutation({
    mutationFn: async ({ propertyId, file }: { propertyId: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);
      return api.post(`/api/properties/${propertyId}/images`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      setSelectedPropertyId(null);
      setUploadError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setUploadError(msg);
    },
  });

  // Mutation: Publish / Unpublish Toggle
  const publishMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return api.patch(`/api/properties/${propertyId}/publish`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    },
  });

  // Mutation: Update Enquiry Status / Notes
  const updateEnquiryMutation = useMutation({
    mutationFn: async ({ id, status, ownerNotes }: { id: string; status?: EnquiryStatus; ownerNotes?: string }) => {
      return api.patch(`/api/enquiries/${id}`, { status, ownerNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-enquiries"] });
    },
  });

  // Mutation: Update Appointment Status
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      return api.patch(`/api/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["owner-enquiries"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPropertyId) {
      uploadMutation.mutate({ propertyId: selectedPropertyId, file });
    }
  };

  const triggerUpload = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Owner Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-emerald-400 font-semibold">{user?.name}</span>. Manage your property listings, tenant leads, and visit appointments.
          </p>
        </div>

        <Link
          to="/owner/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" /> Add New Property
        </Link>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 mb-8 space-x-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("properties")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "properties"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building className="h-4 w-4" />
          My Properties ({properties.length})
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "leads"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Leads & Enquiries ({enquiries.length})
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
      </div>

      {/* Tab 1: Properties */}
      {activeTab === "properties" && (
        <>
          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
              <Building className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No properties listed yet</h3>
              <p className="text-sm text-slate-400 mb-6">
                Post your first rental home to start receiving direct verified enquiries and visit bookings.
              </p>
              <Link
                to="/owner/properties/new"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition"
              >
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const primaryImage =
                  property.images.find((img) => img.isPrimary)?.url ||
                  property.images[0]?.url ||
                  null;

                return (
                  <div
                    key={property.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative h-48 bg-slate-950">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                            <span className="text-xs">No image uploaded</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              property.status === "ACTIVE"
                                ? "bg-emerald-500/90 text-slate-950 shadow-md"
                                : "bg-amber-500/90 text-slate-950 shadow-md"
                            }`}
                          >
                            {property.status}
                          </span>
                        </div>

                        {/* Upload trigger button */}
                        <button
                          onClick={() => triggerUpload(property.id)}
                          disabled={uploadMutation.isPending && selectedPropertyId === property.id}
                          className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-200 hover:text-emerald-400 transition flex items-center gap-1.5"
                          title="Upload image"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>{property.images.length > 0 ? "Add Photo" : "Upload Photo"}</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-xl font-extrabold text-white">
                            ₹{Number(property.price).toLocaleString("en-IN")}
                            <span className="text-xs font-normal text-slate-400">/mo</span>
                          </span>
                          <span className="text-xs text-slate-400">
                            {property.propertyType}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">
                          {property.title}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          {property.locality}, {property.city}
                        </p>

                        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800 text-xs text-slate-300">
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

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => publishMutation.mutate(property.id)}
                        disabled={publishMutation.isPending}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          property.status === "ACTIVE"
                            ? "bg-slate-800 hover:bg-slate-700 text-amber-400"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {property.status === "ACTIVE" ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Publish Now
                          </>
                        )}
                      </button>

                      <Link
                        to={`/properties/${property.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Leads & Enquiries */}
      {activeTab === "leads" && (
        <>
          {loadingEnquiries ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
              <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No enquiries received yet</h3>
              <p className="text-sm text-slate-400">
                Make sure your listings are Published to ACTIVE status so renters can discover and enquire about them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq) => {
                const currentNote =
                  editingNotes[enq.id] !== undefined
                    ? editingNotes[enq.id]
                    : enq.ownerNotes || "";

                return (
                  <div
                    key={enq.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {enq.user?.name || "Renter"}
                          </span>
                          <span className="text-xs text-slate-400">
                            • enquired on <span className="text-emerald-400 font-semibold">{enq.property?.title}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {enq.user?.email} {enq.user?.phone && `| ${enq.user.phone}`}
                        </p>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Status:</span>
                        <select
                          value={enq.status}
                          onChange={(e) =>
                            updateEnquiryMutation.mutate({
                              id: enq.id,
                              status: e.target.value as EnquiryStatus,
                            })
                          }
                          className="bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="VISIT_SCHEDULED">VISIT_SCHEDULED</option>
                          <option value="NEGOTIATING">NEGOTIATING</option>
                          <option value="CLOSED_WON">CLOSED_WON</option>
                          <option value="CLOSED_LOST">CLOSED_LOST</option>
                        </select>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="text-[11px] text-slate-500 font-semibold block mb-1 uppercase tracking-wider">
                        Renter's Message:
                      </span>
                      "{enq.message}"
                    </div>

                    {/* Owner Private Notes (Field-level security protected) */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          Private Owner Notes <span className="text-[10px] text-slate-500">(Never visible to renter)</span>
                        </span>
                        {editingNotes[enq.id] !== undefined && editingNotes[enq.id] !== (enq.ownerNotes || "") && (
                          <button
                            onClick={() =>
                              updateEnquiryMutation.mutate({
                                id: enq.id,
                                ownerNotes: editingNotes[enq.id],
                              })
                            }
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Save Note
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) =>
                          setEditingNotes({ ...editingNotes, [enq.id]: e.target.value })
                        }
                        placeholder="Add private note (e.g. Budget ₹40k, moving next month, verified employment)..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 3: Scheduled Visits */}
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
              <h3 className="text-lg font-bold text-white mb-2">No property visits scheduled</h3>
              <p className="text-sm text-slate-400">
                When renters request visits on your properties, they will appear here for confirmation and management.
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

                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                      Renter: <span className="text-slate-200">{apt.enquiry?.user?.name}</span> ({apt.enquiry?.user?.email})
                    </p>

                    {apt.notes && (
                      <p className="text-xs text-slate-400 italic">Notes: "{apt.notes}"</p>
                    )}
                  </div>

                  {/* Visit actions */}
                  <div className="flex items-center gap-2">
                    {apt.status === "PROPOSED" && (
                      <button
                        onClick={() =>
                          updateAppointmentMutation.mutate({ id: apt.id, status: "CONFIRMED" })
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md"
                      >
                        Confirm Visit
                      </button>
                    )}

                    {apt.status === "CONFIRMED" && (
                      <button
                        onClick={() =>
                          updateAppointmentMutation.mutate({ id: apt.id, status: "COMPLETED" })
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition shadow-md"
                      >
                        Mark Completed
                      </button>
                    )}

                    {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                      <button
                        onClick={() =>
                          updateAppointmentMutation.mutate({ id: apt.id, status: "CANCELLED" })
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs transition"
                      >
                        Cancel
                      </button>
                    )}
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
