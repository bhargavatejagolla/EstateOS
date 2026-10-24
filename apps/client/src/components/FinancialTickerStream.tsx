import React from "react";
import { ShieldCheck, ArrowUpRight, Activity } from "lucide-react";

interface TickerItem {
  id: string;
  type: "yield" | "escrow" | "lease" | "clearing";
  text: string;
  highlight: string;
  isPositive?: boolean;
}

export function FinancialTickerStream() {
  const tickerItems: TickerItem[] = [
    { id: "1", type: "escrow", text: "ESCROW CONTRACT #8841 SETTLED", highlight: "₹2,40,000 DISBURSED", isPositive: true },
    { id: "2", type: "yield", text: "MUMBAI SKYVIEW TOWER", highlight: "100% OCCUPIED • +12.4% YIELD", isPositive: true },
    { id: "3", type: "lease", text: "SMART LEASE EXECUTION", highlight: "DID:ESTATEOS:7FDC VERIFIED", isPositive: true },
    { id: "4", type: "clearing", text: "AUTOMATED ESCROW ENGINE", highlight: "0s LATENCY • 100% AUDIT COMPLIANT", isPositive: true },
    { id: "5", type: "yield", text: "BENGALURU TECH RESIDENCES", highlight: "₹85,000 CLEARED ON-CHAIN", isPositive: true },
    { id: "6", type: "escrow", text: "MULTI-SIG SECURITY DEPOSIT", highlight: "₹7,20,000 LOCKED IN ESCROW", isPositive: true },
  ];

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl py-2 px-3 shadow-lg select-none flex items-center">
      {/* Live Badge */}
      <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-1">
          <Activity className="h-3 w-3 text-cyan-400" />
          TELEMETRY
        </span>
      </div>

      {/* Marquee Track */}
      <div className="overflow-hidden flex-1 relative flex items-center">
        <div className="flex items-center gap-8 whitespace-nowrap animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused]">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">{item.text}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-0.5">
                <ArrowUpRight className="h-2.5 w-2.5 text-emerald-400" />
                {item.highlight}
              </span>
              <span className="text-slate-700 mx-1">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Protocol Badge */}
      <div className="hidden sm:flex items-center gap-1.5 pl-4 border-l border-white/10 shrink-0 text-[10px] font-mono text-slate-400">
        <ShieldCheck className="h-3 w-3 text-emerald-400" />
        <span>LEDGER v2.6</span>
      </div>
    </div>
  );
}

export default FinancialTickerStream;
