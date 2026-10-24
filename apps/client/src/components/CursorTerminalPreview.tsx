import React, { useState, useEffect } from "react";
import { Copy, Check, Cpu } from "lucide-react";

export function CursorTerminalPreview() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"contract" | "telemetry">("contract");
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "[SYSTEM] EstateOS Runtime Engine v2.4 initialized...",
    "[AUDIT] Verified cryptographic state on Block #1,492,028",
    "[SOCKET] Connected to Bangalore Spatial Twin Grid (12.9716° N, 77.5946° E)",
  ]);

  useEffect(() => {
    const streamItems = [
      "[FIFO] Cleared Rent Obligation #OBL-9921 for Indiranagar Sovereign (₹65,000)",
      "[ESCROW] Security deposit ₹1,80,000 locked in smart contract vault",
      "[AI_MATCH] Generated 4 high-affinity recommendations for Rahul (Match 96.2%)",
      "[DISPATCH] Maintenance Ticket #M-201 assigned to authorized HVAC partner",
      "[TELEMETRY] Occupancy rate optimized to 99.4% across 1,420 digital twins",
    ];

    let idx = 0;
    const interval = setInterval(() => {
      setTelemetryLogs((prev) => {
        const nextLog = streamItems[idx % streamItems.length];
        idx++;
        if (!nextLog) return prev;
        return [...prev.slice(-6), nextLog];
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const contractCode = `// EstateOS Tamper-Evident Smart Lease Automaton
import { LeaseContract, FIFOAllocation } from "@estateos/core";

export async function executeMonthlyObligation(leaseId: string) {
  const lease = await LeaseContract.verifyDigitalSignature(leaseId);
  const ledger = await FIFOAllocation.distribute({
    amount: lease.monthlyRent,
    dueDay: 5,
    escrowLock: true,
  });
  return { status: "CLEARED_FIFO", auditHash: ledger.sha256 };
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(contractCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl overflow-hidden font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setActiveTab("contract")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                activeTab === "contract"
                  ? "bg-slate-800 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              smart_lease.ts
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                activeTab === "telemetry"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>live_telemetry.log</span>
            </button>
          </div>
        </div>

        <button
          onClick={copyCode}
          className="text-slate-400 hover:text-white p-1 text-[11px] flex items-center gap-1"
          title="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="p-4 overflow-x-auto min-h-[180px] bg-black/95">
        {activeTab === "contract" ? (
          <pre className="text-slate-300 leading-relaxed text-[11px]">
            <code>
              <span className="text-slate-500">// EstateOS Tamper-Evident Smart Lease Automaton</span>
              {"\n"}
              <span className="text-purple-400">import</span> {"{ LeaseContract, FIFOAllocation }"} <span className="text-purple-400">from</span> <span className="text-emerald-400">"@estateos/core"</span>;
              {"\n\n"}
              <span className="text-blue-400">export async function</span> <span className="text-yellow-300">executeMonthlyObligation</span>(leaseId: <span className="text-cyan-400">string</span>) {"{"}
              {"\n"}  <span className="text-purple-400">const</span> lease = <span className="text-purple-400">await</span> LeaseContract.<span className="text-cyan-300">verifyDigitalSignature</span>(leaseId);
              {"\n"}  <span className="text-purple-400">const</span> ledger = <span className="text-purple-400">await</span> FIFOAllocation.<span className="text-cyan-300">distribute</span>({"{"}
              {"\n"}    amount: lease.<span className="text-emerald-400">monthlyRent</span>,
              {"\n"}    dueDay: <span className="text-amber-400">5</span>,
              {"\n"}    escrowLock: <span className="text-emerald-400">true</span>,
              {"\n"}  {"}"});
              {"\n"}  <span className="text-purple-400">return</span> {"{ status: "}
              <span className="text-emerald-400">"CLEARED_FIFO"</span>{", auditHash: ledger.sha256 }"};
              {"\n"}{"}"}
            </code>
          </pre>
        ) : (
          <div className="space-y-1.5 text-[11px] font-mono">
            {telemetryLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300 animate-in fade-in slide-in-from-bottom-1">
                <span className="text-cyan-400 select-none">›</span>
                <span className={log.includes("CLEARED") ? "text-emerald-400" : log.includes("AI_MATCH") ? "text-purple-400" : "text-slate-300"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-1.5 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>TypeScript 5.9 • WebGL2 Engine • SHA-256 Audit</span>
        </span>
        <span className="text-emerald-400 font-semibold">ALL ENGINES ONLINE</span>
      </div>
    </div>
  );
}

export default CursorTerminalPreview;
