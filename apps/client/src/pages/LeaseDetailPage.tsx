import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { api } from "../lib/api.js";
import {
  FileText,
  CreditCard,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  X,
  Upload,
} from "lucide-react";
import type {
  LeaseResponse,
  RentObligationResponse,
  MaintenanceResponse,
} from "@estateos/shared";

export function LeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lease, setLease] = useState<any | null>(null);
  const [obligations, setObligations] = useState<RentObligationResponse[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Acceptance Modal State
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptedByName, setAcceptedByName] = useState("");
  const [accepting, setAccepting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Maintenance Modal State
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintTitle, setMaintTitle] = useState("");
  const [maintDesc, setMaintDesc] = useState("");
  const [maintPriority, setMaintPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [submittingMaint, setSubmittingMaint] = useState(false);

  const loadLease = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const leaseData = await api<any>(`/leases/${id}`);
      setLease(leaseData);

      const obList = await api<RentObligationResponse[]>(`/leases/${id}/obligations`);
      setObligations(obList);

      const maintList = await api<MaintenanceResponse[]>(`/maintenance?propertyId=${leaseData.propertyId}`);
      setMaintenance(maintList);
    } catch (err: any) {
      setError(err.message || "Failed to load lease");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLease();
  }, [id]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#10b981"; // emerald-500
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleAcceptLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedByName.trim()) {
      alert("Please enter your legal name to accept.");
      return;
    }

    try {
      setAccepting(true);
      let signatureDataUrl: string | undefined;
      const canvas = canvasRef.current;
      if (canvas) {
        signatureDataUrl = canvas.toDataURL("image/png");
      }

      await api.post(`/leases/${id}/accept`, {
        acceptedByName: acceptedByName.trim(),
        signatureDataUrl,
      });

      setShowAcceptModal(false);
      await loadLease();
    } catch (err: any) {
      alert(err.message || "Failed to accept lease");
    } finally {
      setAccepting(false);
    }
  };

  const handleReportMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintTitle.trim() || !maintDesc.trim()) {
      alert("Please enter a title and description.");
      return;
    }

    try {
      setSubmittingMaint(true);
      await api.post("/maintenance", {
        leaseId: id,
        title: maintTitle.trim(),
        description: maintDesc.trim(),
        priority: maintPriority,
      });

      setShowMaintModal(false);
      setMaintTitle("");
      setMaintDesc("");
      await loadLease();
    } catch (err: any) {
      alert(err.message || "Failed to submit maintenance request");
    } finally {
      setSubmittingMaint(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-slate-400">
        Loading lease contract...
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-rose-400">
        <AlertCircle className="h-10 w-10 mx-auto mb-2" />
        {error || "Lease not found"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Navigation & Back */}
      <div className="mb-6">
        <Link
          to="/tenant/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tenancy Dashboard
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200">
                Status: {lease.status}
              </span>
              {lease.acceptanceStatus === "ACCEPTED" ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" /> Electronically Accepted
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pending Your Acceptance
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lease.property?.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {lease.property?.address}, {lease.property?.city}
            </p>
          </div>

          {/* Action: Accept Lease Button */}
          {lease.acceptanceStatus === "PENDING" && (
            <button
              onClick={() => setShowAcceptModal(true)}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
            >
              Review & Accept Agreement
            </button>
          )}
        </div>

        {/* Accepted Audit Trail Banner */}
        {lease.acceptanceStatus === "ACCEPTED" && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tamper-evident Acceptance Record</p>
                <p className="text-sm font-semibold text-white">
                  Acknowledged & Signed by <span className="text-emerald-400">{lease.acceptedByName}</span> on{" "}
                  {new Date(lease.acceptedByTenantAt).toLocaleString()}
                </p>
              </div>
            </div>
            {lease.signatureDataUrl && (
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <img
                  src={lease.signatureDataUrl}
                  alt="Tenant Signature"
                  className="h-8 max-w-[150px] object-contain invert"
                />
              </div>
            )}
          </div>
        )}

        {/* Quick Contract Specs */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800 pt-6">
          <div>
            <span className="text-xs text-slate-500">Monthly Rent</span>
            <p className="text-lg font-bold text-slate-200">₹{lease.rentAmount?.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Security Deposit</span>
            <p className="text-lg font-bold text-slate-200">
              ₹{(lease.depositAmount || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Rent Due Day</span>
            <p className="text-lg font-bold text-slate-200">Day {lease.dueDay} of month</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Lease Window</span>
            <p className="text-sm font-semibold text-slate-300 mt-1">
              {new Date(lease.startDate).toLocaleDateString()} —{" "}
              {new Date(lease.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Obligations & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Monthly Rent Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  Monthly Rent Obligations ({obligations.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Status is derived dynamically at read time from payment allocations.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Due Date</th>
                    <th className="pb-3 font-semibold">Amount Due</th>
                    <th className="pb-3 font-semibold">Amount Paid</th>
                    <th className="pb-3 font-semibold">Balance</th>
                    <th className="pb-3 font-semibold">Derived Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {obligations.map((ob) => (
                    <tr key={ob.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-medium text-white">
                        {new Date(ob.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">₹{ob.amountDue.toLocaleString()}</td>
                      <td className="py-3 text-emerald-400 font-medium">
                        ₹{ob.amountPaid.toLocaleString()}
                      </td>
                      <td className="py-3 font-medium text-slate-200">
                        ₹{ob.balance.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            ob.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : ob.status === "OVERDUE"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : ob.status === "PARTIAL"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {ob.status}
                          {ob.status === "OVERDUE" && ` (${ob.daysOverdue}d)`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Maintenance Operations */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-emerald-400" />
                Maintenance
              </h3>
              {lease.status === "ACTIVE" && (
                <button
                  onClick={() => setShowMaintModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  + Report Issue
                </button>
              )}
            </div>

            {lease.status !== "ACTIVE" && (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 mb-4">
                ℹ️ Maintenance requests can be submitted once this lease is activated by the owner.
              </p>
            )}

            <div className="space-y-3">
              {maintenance.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No issues reported for this home.
                </p>
              ) : (
                maintenance.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-slate-500 text-[10px]">{m.priority}</span>
                    </div>
                    <h4 className="font-semibold text-white">{m.title}</h4>
                    <p className="text-slate-400 line-clamp-2">{m.description}</p>
                    <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex justify-between">
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                      <span>{m.updates.length} updates logged</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Modal with Canvas Signature */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAcceptModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Accept Lease Agreement</h3>
                <p className="text-xs text-slate-400">Electronic acknowledgment & lock</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-6 leading-relaxed">
              By typing your legal name and signing below, you acknowledge and agree to lease terms of{" "}
              <strong className="text-emerald-400">₹{lease.rentAmount?.toLocaleString()}/month</strong> for{" "}
              {lease.property?.title}. Once accepted, this contract is locked against further edits.
            </p>

            <form onSubmit={handleAcceptLease} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Legal Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhargava Teja Golla"
                  value={acceptedByName}
                  onChange={(e) => setAcceptedByName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Draw Signature (Optional Canvas)
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition"
                  >
                    Clear pad
                  </button>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-28 block"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accepting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {accepting ? "Signing..." : "Confirm & Accept"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Submission Modal */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowMaintModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-emerald-400" />
              Report Maintenance Issue
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Owner will be notified immediately and an audit log will track the resolution.
            </p>

            <form onSubmit={handleReportMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Issue Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kitchen tap leaking"
                  value={maintTitle}
                  onChange={(e) => setMaintTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={maintPriority}
                  onChange={(e) => setMaintPriority(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue, location in the house, and when it started..."
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMaint}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {submittingMaint ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaseDetailPage;
