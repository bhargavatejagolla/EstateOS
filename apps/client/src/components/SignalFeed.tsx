import React from "react";
import { Link } from "react-router";
import type { DashboardSignal } from "@estateos/shared";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface SignalFeedProps {
  signals: DashboardSignal[];
}

export function SignalFeed({ signals }: SignalFeedProps) {
  if (signals.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-white">All Clear</h4>
        <p className="text-xs text-slate-400 mt-1">
          No urgent actions required. All obligations, vacancies, and maintenance items are in order.
        </p>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />,
        };
      case "warning":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />,
        };
      default:
        return {
          bg: "bg-teal-500/10 border-teal-500/30 text-teal-400",
          badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
          icon: <Info className="h-4 w-4 shrink-0 text-teal-400" />,
        };
    }
  };

  const formatOffset = (offset?: number) => {
    if (offset === undefined) return null;
    if (offset < 0) {
      return `${Math.abs(offset)}d overdue`;
    }
    if (offset === 0) {
      return "Due today";
    }
    return `In ${offset}d`;
  };

  return (
    <div className="space-y-3">
      {signals.map((sig, idx) => {
        const style = getSeverityStyle(sig.severity);
        const offsetLabel = formatOffset(sig.daysOffset);

        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-all ${style.bg} hover:border-slate-700 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {style.icon}
                  <span className="text-xs font-bold text-white line-clamp-1">{sig.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {offsetLabel && (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                      {offsetLabel}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${style.badge}`}
                  >
                    {sig.severity}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3">{sig.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              {sig.amount != null ? (
                <span className="font-bold text-white text-xs">
                  ₹{sig.amount.toLocaleString("en-IN")}
                </span>
              ) : (
                <span />
              )}

              {sig.link && (
                <Link
                  to={sig.link}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  Take Action <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SignalFeed;
