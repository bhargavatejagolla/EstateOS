import React, { useRef, useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";
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
  createdAt: string;
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["owner-properties"],
    queryFn: () => api<Property[]>("/properties/mine"),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ propertyId, file }: { propertyId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api(`/properties/${propertyId}/images`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    },
    onError: (err: Error) => {
      setUploadError(err.message || "Failed to upload image");
    },
  });

  const handleImageSelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPropertyId) {
      uploadMutation.mutate({ propertyId: selectedPropertyId, file });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Owner Command Center
            </span>
            <span className="text-xs text-slate-400">Signed in as {user?.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Portfolio</h1>
          <p className="text-sm text-slate-400 mt-1">Manage listings, photos, and rental availability</p>
        </div>

        <Link
          to="/owner/properties/new"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" /> Add Property
        </Link>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading your properties…</p>
        </div>
      ) : properties.length === 0 ? (
        /* Empty state */
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-16 text-center max-w-xl mx-auto my-12">
          <div className="h-16 w-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No properties published yet</h3>
          <p className="text-sm text-slate-400 mb-6">
            Get started by adding your first rental unit to EstateOS. Upload photos, set pricing, and publish.
          </p>
          <Link
            to="/owner/properties/new"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition"
          >
            <Plus className="h-4 w-4" /> Publish First Property
          </Link>
        </div>
      ) : (
        /* Property Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => {
            const primaryImg = prop.images.find((img) => img.isPrimary) || prop.images[0];
            const isUploading = uploadMutation.isPending && selectedPropertyId === prop.id;

            return (
              <div
                key={prop.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-950 border-b border-slate-800 overflow-hidden group">
                    {primaryImg ? (
                      <img
                        src={primaryImg.url}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                        <ImageIcon className="h-10 w-10 opacity-40" />
                        <span className="text-xs">No photos uploaded yet</span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-slate-700">
                        ₹{Number(prop.price).toLocaleString("en-IN")}/mo
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800 uppercase tracking-wider">
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-1">{prop.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{prop.locality}, {prop.city}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-3.5 w-3.5 text-slate-500" />
                        <span>{prop.bedrooms} BHK</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-3.5 w-3.5 text-slate-500" />
                        <span>{prop.bathrooms} Bath</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Square className="h-3.5 w-3.5 text-slate-500" />
                        <span>{prop.areaSqft} sqft</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {prop.description}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 border-t border-slate-800/60 flex items-center justify-between text-xs mt-3">
                  <div className="text-slate-500">
                    {prop.images.length} {prop.images.length === 1 ? "photo" : "photos"}
                  </div>

                  <button
                    onClick={() => handleImageSelect(prop.id)}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium transition border border-emerald-500/20"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {isUploading ? "Uploading…" : "Upload Photo"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
