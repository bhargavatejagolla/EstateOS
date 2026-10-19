import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import {
  FileText,
  CreditCard,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  ArrowLeft,
  ArrowRight,
  Home,
} from "lucide-react";
import type { LeaseResponse, RentObligationResponse, MaintenanceResponse } from "@estateos/shared";

export function TenantDashboard() {
  const [leases, setLeases] = useState<LeaseResponse[]>([]);
  const [activeLease, setActiveLease] = useState<LeaseResponse | null>(null);
  const [obligations, setObligations] = useState<RentObligationResponse[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch user's leases
        const leaseList = await api<LeaseResponse[]>("/leases");
        setLeases(leaseList);

        // Find active lease or most recent lease
        const current = leaseList.find((l) => l.status === "ACTIVE") || leaseList[0] || null;
        setActiveLease(current);

        if (current) {
          // 2. Fetch obligations for this lease
          const obList = await api<RentObligationResponse[]>(`/leases/${current.id}/obligations`);
          setObligations(obList);
        }

        // 3. Fetch maintenance requests
        const maintList = await api<MaintenanceResponse[]>("/maintenance");
        setMaintenance(maintList);
      } catch (err: any) {
        setError(err.message || "Failed to load tenant dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute next unpaid obligation
  const nextDueObligation = obligations.find(
    (ob) => ob.status === "OVERDUE" || ob.status === "PARTIAL" || ob.status === "PENDING"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "OVERDUE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "PARTIAL":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "PENDING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-slate-400">
        Loading your tenancy operations...
      </div>
    );
  }

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
          <span className="text-emerald-400 font-semibold">My Tenancy</span>
        </nav>
      </div>

      {/* Page Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-emerald-400" />
            Tenancy & Rent Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time lease agreements, monthly rent obligations, and maintenance operations.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* No Leases Empty State */}
      {leases.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white">No active lease agreements found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 mb-6">
            When an owner accepts your enquiry and creates a lease agreement, it will appear here for your electronic acceptance.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20"
          >
            Explore Available Homes
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Banner: Rent Due & Obligation Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rent Due Widget */}
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                    Rent Status
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {nextDueObligation
                      ? `₹${nextDueObligation.balance.toLocaleString()} Due`
                      : "All Rent Paid in Full"}
                  </h3>
                </div>
                {nextDueObligation && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                      nextDueObligation.status
                    )}`}
                  >
                    {nextDueObligation.status}
                  </span>
                )}
              </div>

              <div className="my-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-slate-800/80 py-4">
                <div>
                  <span className="text-xs text-slate-500">Monthly Rent</span>
                  <p className="text-base font-bold text-slate-200">
                    ₹{activeLease?.rentAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Due Date</span>
                  <p className="text-base font-bold text-slate-200">
                    {nextDueObligation
                      ? new Date(nextDueObligation.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Security Deposit</span>
                  <p className="text-base font-bold text-slate-200">
                    ₹{(activeLease?.depositAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {nextDueObligation?.status === "OVERDUE" ? (
                    <span className="text-rose-400 font-medium">
                      ⚠️ Overdue by {nextDueObligation.daysOverdue} days. Please pay promptly.
                    </span>
                  ) : nextDueObligation ? (
                    `Rent due on day ${activeLease?.dueDay} of each month`
                  ) : (
                    "Zero outstanding balance on this lease"
                  )}
                </span>
                {activeLease && (
                  <Link
                    to={`/tenant/leases/${activeLease.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    View Rent Schedule <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Active Property Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-emerald-400" /> Current Residence
                </span>
                <h4 className="text-lg font-bold text-white mt-1 line-clamp-1">
                  {activeLease?.property?.title || "Leased Property"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {activeLease?.property?.address}, {activeLease?.property?.city}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lease Status:</span>
                  <span className="font-semibold text-slate-300">{activeLease?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Acceptance:</span>
                  <span className="font-semibold text-emerald-400">
                    {activeLease?.acceptanceStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="text-slate-400">
                    {activeLease
                      ? `${new Date(activeLease.startDate).toLocaleDateString()} - ${new Date(
                          activeLease.endDate
                        ).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
              </div>

              {activeLease && (
                <Link
                  to={`/tenant/leases/${activeLease.id}`}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition block"
                >
                  Manage Lease & Maintenance
                </Link>
              )}
            </div>
          </div>

          {/* Section: All My Leases */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              My Lease Agreements ({leases.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leases.map((lease) => (
                <div
                  key={lease.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {lease.status}
                      </span>
                      {lease.acceptanceStatus === "ACCEPTED" ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5" /> Accepted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Acceptance Pending
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base line-clamp-1">
                      {lease.property?.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{lease.property?.city}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      <div>
                        <span className="text-slate-500">Monthly Rent</span>
                        <p className="font-semibold text-slate-200">
                          ₹{lease.rentAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Due Day</span>
                        <p className="font-semibold text-slate-200">Day {lease.dueDay}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/tenant/leases/${lease.id}`}
                    className={`mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-center transition flex items-center justify-center gap-1.5 ${
                      lease.acceptanceStatus === "PENDING"
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {lease.acceptanceStatus === "PENDING" ? (
                      <>Review & Accept Lease</>
                    ) : (
                      <>View Lease Details</>
                    )}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Maintenance Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-emerald-400" />
                Maintenance Requests ({maintenance.length})
              </h2>
              {activeLease && (
                <Link
                  to={`/tenant/leases/${activeLease.id}#maintenance`}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  + Report New Issue
                </Link>
              )}
            </div>

            {maintenance.length === 0 ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center text-xs text-slate-500">
                No maintenance requests reported. Everything in optimal condition!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maintenance.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : m.status === "IN_PROGRESS"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {m.status}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Priority: {m.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white">{m.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {m.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Updated {new Date(m.createdAt).toLocaleDateString()}</span>
                      <span>{m.updates.length} timeline entries</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantDashboard;
