import { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import type { YieldEstimate } from "@estateos/shared";
import { TrendingUp, Info, AlertTriangle } from "lucide-react";

interface YieldWidgetProps {
  propertyId: string;
}

export function YieldWidget({ propertyId }: YieldWidgetProps) {
  const [yieldData, setYieldData] = useState<YieldEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchYield() {
      try {
        setLoading(true);
        const data = await api.get<YieldEstimate>(`/api/properties/${propertyId}/yield`);
        setYieldData(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load yield estimate";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchYield();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded mb-2"></div>
        <div className="h-8 w-24 bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (error || !yieldData) {
    return null; // Gracefully degrade if no yield data available
  }

  return (
    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Rental Yield Intelligence
            </span>
            <span className="text-[11px] text-slate-500">
              Based on {yieldData.comparableCount} comparable contracts
            </span>
          </div>
        </div>

        {/* Honesty badge */}
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"
          title="Unverified estimate — not a bank/appraisal certification"
        >
          <AlertTriangle className="h-3 w-3" />
          Operational Estimate
        </span>
      </div>

      {/* Yield Metrics */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Gross Rental Yield</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-400">
              {yieldData.grossYieldPercent.toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-400">/ yr</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Comparable Contracts</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-200">
              {yieldData.comparableCount}
            </span>
            <span className="text-[11px] text-slate-400">active leases</span>
          </div>
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="text-xs text-slate-300 space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Monthly Rent:</span>
          <span className="font-semibold text-slate-200">
            ₹{yieldData.monthlyRent.toLocaleString("en-IN")}/mo
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Estimated Annual Rent:</span>
          <span className="font-semibold text-slate-200">
            ₹{yieldData.annualRent.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Estimated Capital Value:</span>
          <span className="font-semibold text-slate-200">
            ₹{yieldData.purchasePrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
        <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Disclaimer: </strong>
          {yieldData.disclaimer}
        </span>
      </div>
    </div>
  );
}

export default YieldWidget;
