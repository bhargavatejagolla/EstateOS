import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import {
  Wrench,
  User,
  Building,
  AlertCircle,
  X,
  History,
} from "lucide-react";
import type { MaintenanceResponse, MaintenanceStatus } from "@estateos/shared";

export function OwnerMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceResponse[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Update Modal
  const [selectedReq, setSelectedReq] = useState<MaintenanceResponse | null>(null);
  const [newStatus, setNewStatus] = useState<MaintenanceStatus>("IN_PROGRESS");
  const [updateNote, setUpdateNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api<MaintenanceResponse[]>("/maintenance");
      setRequests(res);
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      setUpdating(true);
      await api.patch(`/maintenance/${selectedReq.id}`, {
        status: newStatus,
        note: updateNote.trim() || undefined,
      });

      setSelectedReq(null);
      setUpdateNote("");
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const filtered =
    filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Wrench className="h-7 w-7 text-emerald-400" />
          Maintenance Operations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Full audit trail of property issues, technician scheduling, and tenant satisfaction.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {["ALL", "SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === tab
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {tab.replace("_", " ")} ({tab === "ALL" ? requests.length : requests.filter((r) => r.status === tab).length})
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading maintenance tickets...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-500 text-sm">
          No maintenance requests in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      r.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : r.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {r.status.replace("_", " ")}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                    Priority: {r.priority}
                  </span>
                </div>

                <h3 className="font-bold text-white text-lg">{r.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.description}</p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Building className="h-3 w-3" /> Property:
                    </span>
                    <span className="font-semibold text-slate-200">{r.property?.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="h-3 w-3" /> Tenant:
                    </span>
                    <span className="font-semibold text-slate-200">{r.tenant?.name}</span>
                  </div>
                </div>

                {/* Audit Trail / Timeline */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <History className="h-3 w-3 text-emerald-400" /> Resolution Audit Trail ({r.updates.length})
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {r.updates.map((u) => (
                      <div
                        key={u.id}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800/60 text-[11px] text-slate-400"
                      >
                        <div className="flex justify-between font-medium text-slate-300">
                          <span>{u.newStatus}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()} {new Date(u.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {u.note && <p className="text-slate-400 mt-1 italic">"{u.note}"</p>}
                        <span className="text-[10px] text-slate-500 block mt-0.5">By {u.updatedBy?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setSelectedReq(r);
                  setNewStatus(r.status === "SUBMITTED" ? "IN_PROGRESS" : "RESOLVED");
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Update Status & Log Note
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedReq(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Update Maintenance Status</h3>
            <p className="text-xs text-slate-400 mb-6">
              Every status change adds an immutable row to the resolution audit trail.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="IN_PROGRESS">In Progress (e.g. Technician Assigned)</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audit Log Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Electrician scheduled for tomorrow at 10 AM, vendor contact: 9876543210..."
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {updating ? "Logging..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerMaintenancePage;
