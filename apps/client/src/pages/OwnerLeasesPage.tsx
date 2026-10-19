import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import {
  FileText,
  PlusCircle,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import type { LeaseResponse } from "@estateos/shared";

export function OwnerLeasesPage() {
  const [leases, setLeases] = useState<LeaseResponse[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const res = await api<LeaseResponse[]>("/leases");
      setLeases(res);
    } catch (err: any) {
      setError(err.message || "Failed to load leases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const filteredLeases =
    filter === "ALL" ? leases : leases.filter((l) => l.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "PENDING_ACCEPTANCE":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "ENDED":
      case "TERMINATED":
        return "bg-slate-800 text-slate-400 border-slate-700";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-7 w-7 text-emerald-400" />
            Lease Agreements
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage contractual agreements, occupancy tracking, and rent schedules.
          </p>
        </div>

        <Link
          to="/owner/leases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" /> Create New Lease
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {["ALL", "PENDING_ACCEPTANCE", "ACTIVE", "ENDED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === tab
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {tab.replace("_", " ")} ({tab === "ALL" ? leases.length : leases.filter((l) => l.status === tab).length})
          </button>
        ))}
      </div>

      {/* Leases Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading lease portfolio...
        </div>
      ) : filteredLeases.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center">
          <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No leases in this category</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Create a lease from scratch or convert a won enquiry into a lease.
          </p>
          <Link
            to="/owner/leases/new"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition inline-block"
          >
            Create Lease
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => (
            <div
              key={lease.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                      lease.status
                    )}`}
                  >
                    {lease.status.replace("_", " ")}
                  </span>
                  {lease.acceptanceStatus === "ACCEPTED" ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" /> Accepted
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium">
                      Awaiting Tenant
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base line-clamp-1">
                  {lease.property?.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{lease.property?.city}</p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="h-3 w-3" /> Tenant:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {lease.tenant?.name || "Tenant"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Monthly Rent:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{lease.rentAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Rent Due Day:</span>
                    <span className="text-slate-300">Day {lease.dueDay} of month</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(lease.startDate).toLocaleDateString()} —{" "}
                    {new Date(lease.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                to={`/owner/leases/${lease.id}`}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
              >
                Manage Lease & Payments <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerLeasesPage;
