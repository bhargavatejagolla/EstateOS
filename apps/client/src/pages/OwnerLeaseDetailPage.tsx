import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import { api } from "../lib/api.js";
import {
  CreditCard,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  ArrowLeft,
  X,
  History,
} from "lucide-react";
import type {
  RentObligationResponse,
  PaymentResponse,
} from "@estateos/shared";

export function OwnerLeaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lease, setLease] = useState<any | null>(null);
  const [obligations, setObligations] = useState<RentObligationResponse[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment Recording Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("UPI");
  const [payRef, setPayRef] = useState<string>("");
  const [payNotes, setPayNotes] = useState<string>("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const leaseData = await api<any>(`/leases/${id}`);
      setLease(leaseData);
      setPayAmount(leaseData.rentAmount);

      const obList = await api<RentObligationResponse[]>(`/leases/${id}/obligations`);
      setObligations(obList);

      const payList = await api<PaymentResponse[]>(`/payments?leaseId=${id}`);
      setPayments(payList);
    } catch (err: any) {
      setError(err.message || "Failed to load lease details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleActivateLease = async () => {
    if (!window.confirm("Activate this lease? The property will automatically become RENTED in search.")) {
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/leases/${id}`, { status: "ACTIVE" });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to activate lease");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndLease = async () => {
    if (!window.confirm("End this lease? The property will automatically return to ACTIVE in search.")) {
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/leases/${id}`, { status: "ENDED" });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to end lease");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) {
      alert("Please enter a valid positive payment amount.");
      return;
    }

    try {
      setRecordingPayment(true);
      await api.post("/payments", {
        leaseId: id,
        amount: Number(payAmount),
        method: payMethod,
        reference: payRef.trim() || undefined,
        notes: payNotes.trim() || undefined,
      });

      setShowPayModal(false);
      setPayRef("");
      setPayNotes("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  // FIFO Allocation preview calculation
  const computeFifoPreview = () => {
    let rem = Number(payAmount) || 0;
    const preview: { dueDate: string; applied: number }[] = [];
    for (const ob of obligations) {
      if (rem <= 0) break;
      if (ob.balance <= 0) continue;
      const apply = Math.min(ob.balance, rem);
      preview.push({ dueDate: ob.dueDate, applied: apply });
      rem -= apply;
    }
    return { preview, excess: rem };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-slate-400">
        Loading lease contract & obligations...
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

  const { preview, excess } = computeFifoPreview();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to="/owner/leases"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leases
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200">
                {lease.status}
              </span>
              {lease.acceptanceStatus === "ACCEPTED" ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" /> Accepted by Tenant
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Awaiting Tenant Acceptance
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lease.property?.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Tenant: <span className="text-slate-200 font-semibold">{lease.tenant?.name}</span> ({lease.tenant?.email})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {lease.status === "PENDING_ACCEPTANCE" && lease.acceptanceStatus === "ACCEPTED" && (
              <button
                onClick={handleActivateLease}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {actionLoading ? "Activating..." : "⚡ Activate Lease (Sets Property = RENTED)"}
              </button>
            )}

            {lease.status === "ACTIVE" && (
              <>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" /> Record Payment
                </button>
                <button
                  onClick={handleEndLease}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                >
                  End Lease (Restores Property = ACTIVE)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800 pt-6">
          <div>
            <span className="text-xs text-slate-500">Monthly Rent</span>
            <p className="text-lg font-bold text-emerald-400">₹{lease.rentAmount?.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Security Deposit</span>
            <p className="text-lg font-bold text-slate-200">₹{(lease.depositAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Due Day</span>
            <p className="text-lg font-bold text-slate-200">Day {lease.dueDay} of month</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Duration</span>
            <p className="text-sm font-semibold text-slate-300 mt-1">
              {new Date(lease.startDate).toLocaleDateString()} — {new Date(lease.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Obligations & Payments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Obligations (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Rent Schedule & Obligations ({obligations.length})
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Status is computed dynamically at read time from (amountPaid, amountDue, dueDate).
            </p>

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
                      <td className="py-3 text-emerald-400 font-medium">₹{ob.amountPaid.toLocaleString()}</td>
                      <td className="py-3 font-semibold text-slate-200">₹{ob.balance.toLocaleString()}</td>
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

        {/* Payments History (Right Col) */}
        <div>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-400" />
              Recorded Payments ({payments.length})
            </h3>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No payments recorded yet. Click "Record Payment" to credit this lease.
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-sm">
                        ₹{p.amount.toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {p.method}
                      </span>
                    </div>
                    {p.reference && (
                      <p className="text-[11px] text-slate-400">Ref: {p.reference}</p>
                    )}
                    <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex justify-between">
                      <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                      <span>{p.allocations.length} obligation(s) split</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal with Live FIFO Preview */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              Record Rent Payment
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Payments are automatically allocated using <strong>First-In First-Out (FIFO)</strong> across outstanding obligations.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Amount (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Method <span className="text-rose-400">*</span>
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (IMPS / NEFT)</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/12345/XYZ"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Live FIFO Allocation Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  FIFO Allocation Preview:
                </span>
                {preview.length === 0 ? (
                  <p className="text-slate-500">Enter an amount to see allocation breakdown.</p>
                ) : (
                  preview.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>Due {new Date(p.dueDate).toLocaleDateString()}:</span>
                      <span className="font-bold text-emerald-400">+₹{p.applied.toLocaleString()}</span>
                    </div>
                  ))
                )}
                {excess > 0 && (
                  <div className="flex justify-between text-amber-400 pt-1 border-t border-slate-800">
                    <span>Prepayment / Credit:</span>
                    <span className="font-bold">+₹{excess.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {recordingPayment ? "Allocating..." : "Confirm & Allocate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerLeaseDetailPage;
