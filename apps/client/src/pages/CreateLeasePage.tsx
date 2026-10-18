import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { api } from "../lib/api.js";
import { FilePlus, ArrowLeft, Building2, AlertCircle } from "lucide-react";
import type { PropertyResponse } from "@estateos/shared";

export function CreateLeasePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const enquiryId = searchParams.get("enquiryId") || undefined;
  const initialPropertyId = searchParams.get("propertyId") || "";
  const initialTenantId = searchParams.get("tenantId") || "";
  const initialPrice = searchParams.get("price") ? Number(searchParams.get("price")) : 35000;

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [propertyId, setPropertyId] = useState(initialPropertyId);
  const [tenantId, setTenantId] = useState(initialTenantId);

  // Defaults: start today, end 1 year from now
  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  const [startDate, setStartDate] = useState(now.toISOString().split("T")[0] || "");
  const [endDate, setEndDate] = useState(nextYear.toISOString().split("T")[0] || "");
  const [rentAmount, setRentAmount] = useState<number>(initialPrice);
  const [depositAmount, setDepositAmount] = useState<number>(initialPrice * 3);
  const [dueDay, setDueDay] = useState<number>(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await api<{ properties: PropertyResponse[] }>("/properties/my-properties");
        setProperties(res.properties);
        const firstProp = res.properties[0];
        if (!propertyId && firstProp) {
          setPropertyId(firstProp.id);
        }
      } catch {
        // Fallback
      }
    }
    loadProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !tenantId) {
      setError("Please specify both property and tenant ID.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const created = await api<any>("/leases", {
        method: "POST",
        body: JSON.stringify({
          propertyId,
          tenantId,
          enquiryId,
          startDate: new Date(startDate || Date.now()).toISOString(),
          endDate: new Date(endDate || Date.now()).toISOString(),
          rentAmount: Number(rentAmount),
          depositAmount: depositAmount ? Number(depositAmount) : undefined,
          dueDay: Number(dueDay),
        }),
      });

      navigate(`/owner/leases/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create lease");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          to="/owner/leases"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leases
        </Link>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <FilePlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Create New Lease Agreement</h1>
            <p className="text-xs text-slate-400">
              One-click lifecycle transition from lead to active tenancy
            </p>
          </div>
        </div>

        {enquiryId && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
            <span>✨ Pre-filled from winning enquiry #{enquiryId.slice(0, 8)}</span>
            <span className="font-semibold text-slate-300">Enquiry CLOSED_WON</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Property <span className="text-rose-400">*</span>
            </label>
            {properties.length > 0 ? (
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.city}) — Status: {p.status}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="Property ID"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          {/* Tenant ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Tenant User ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. cly..."
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Lease Start Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Lease End Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Monthly Rent (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={rentAmount}
                onChange={(e) => setRentAmount(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                min={0}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Due Day of Month (1–28) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={28}
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            💡 Creating the lease will automatically pre-generate 1 monthly rent obligation row per month with month-end clamping. Tenant will be notified to review and electronically accept.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition disabled:opacity-50"
          >
            {loading ? "Creating Lease..." : "Generate Lease & Monthly Obligations"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateLeasePage;
