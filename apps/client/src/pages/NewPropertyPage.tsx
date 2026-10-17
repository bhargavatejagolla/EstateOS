import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { PropertyCreateSchema, type PropertyType, type Furnishing } from "@estateos/shared";
import { api } from "../lib/api.js";
import {
  Building2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";

export default function NewPropertyPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    depositAmount: "",
    city: "Bangalore",
    locality: "Koramangala",
    address: "",
    pincode: "560034",
    propertyType: "APARTMENT" as PropertyType,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1200,
    furnishing: "SEMI_FURNISHED" as Furnishing,
    amenities: ["Power Backup", "Lift", "Security", "Parking"],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form payload against shared Zod schema
      const validatedPayload = PropertyCreateSchema.parse({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        depositAmount: formData.depositAmount ? Number(formData.depositAmount) : undefined,
        city: formData.city,
        locality: formData.locality,
        address: formData.address,
        pincode: formData.pincode || undefined,
        propertyType: formData.propertyType,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqft: Number(formData.areaSqft),
        furnishing: formData.furnishing,
        amenities: formData.amenities,
      });

      // 1. Create property
      const created = await api<{ id: string }>("/properties", {
        method: "POST",
        body: JSON.stringify(validatedPayload),
      });

      // 2. Upload photo if selected
      if (selectedFile && created?.id) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);
        await api(`/properties/${created.id}/images`, {
          method: "POST",
          body: uploadForm,
        });
      }

      navigate("/owner/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create property listing. Please review the inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        to="/owner/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Portfolio
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Add New Property</h1>
            <p className="text-xs text-slate-400">Validated against shared @estateos/shared Zod schema</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              Property Headline & Overview
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Listing Title (5–200 characters)
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern 3BHK Apartment in Koramangala"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Detailed Description (min 20 characters)
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the unit, lighting, nearby landmarks, metro connectivity, ventilation, and inclusions."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Structure */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              Financials & Layout
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Monthly Rent (₹)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="45000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Security Deposit (₹, Optional)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  placeholder="150000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Property Type</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyType: e.target.value as PropertyType })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">Independent House</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio Flat</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Furnishing Status</label>
                <select
                  value={formData.furnishing}
                  onChange={(e) =>
                    setFormData({ ...formData, furnishing: e.target.value as Furnishing })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="FULLY_FURNISHED">Fully-Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Bedrooms (BHK)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Carpet Area (Sq.Ft.)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={formData.areaSqft}
                  onChange={(e) => setFormData({ ...formData, areaSqft: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              Geographical Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bangalore"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Locality / Neighborhood</label>
                <input
                  type="text"
                  required
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="Koramangala 4th Block"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Flat 302, Palm Grove Heights, 80ft Road"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              Cover Photograph (Cloudinary Upload)
            </h3>

            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition border border-slate-700">
                <Upload className="h-4 w-4" /> Select Cover Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {selectedFile ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              ) : (
                <span className="text-xs text-slate-500">Optional (you can also upload photos from your dashboard)</span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <Link
              to="/owner/dashboard"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? "Publishing Listing…" : "Publish Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
