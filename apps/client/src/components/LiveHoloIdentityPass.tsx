import React, { useMemo } from "react";
import { GlassTiltCard } from "./GlassTiltCard.js";
import { Shield, Sparkles, Cpu, QrCode, Wifi, CheckCircle2, Building2, UserCheck } from "lucide-react";

interface LiveHoloIdentityPassProps {
  name: string;
  role: "OWNER" | "RENTER";
  email: string;
  phone?: string;
  className?: string;
}

export function LiveHoloIdentityPass({
  name,
  role,
  email,
  phone,
  className = "",
}: LiveHoloIdentityPassProps) {
  const isOwner = role === "OWNER";

  // Deterministic hash generated from the name
  const hash = useMemo(() => {
    const raw = `${name || "ESTATEOS"}:${role}:${email || "NULL"}`;
    let h = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
    return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  }, [name, role, email]);

  // Procedural geometric crest based on hash
  const crestDetails = useMemo(() => {
    const code = name ? name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0) : 42;
    const rotationAngle = (code * 17) % 360;
    const innerRadius = 16 + (code % 8);
    return { rotationAngle, innerRadius };
  }, [name]);

  const displayName = name.trim().length > 0 ? name : "IDENTITY PENDING";
  const displayEmail = email.trim().length > 0 ? email : "genesis.node@estateos.network";

  return (
    <div className={`w-full max-w-md mx-auto perspective-1000 ${className}`}>
      <GlassTiltCard
        maxTilt={8}
        className="relative rounded-3xl p-6 sm:p-7 border border-white/20 bg-gradient-to-b from-slate-900/90 via-black/95 to-slate-950/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden group select-none"
      >
        {/* Holographic Iridescent Sheen Layer */}
        <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-cyan-400/10 via-purple-400/10 to-transparent pointer-events-none -rotate-45 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

        {/* Ambient Corner Plasma Glows */}
        <div
          className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
            isOwner ? "bg-cyan-500/25" : "bg-emerald-500/25"
          }`}
        />
        <div
          className={`absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
            isOwner ? "bg-amber-500/20" : "bg-purple-500/20"
          }`}
        />

        {/* Laser Scanning Line Animation */}
        <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 via-emerald-400 to-transparent animate-[scan_4s_ease-in-out_infinite] opacity-40 pointer-events-none" />

        {/* Header / Network Badges */}
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center border shadow-md transition-colors ${
                isOwner
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-cyan-500/20"
                  : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20"
              }`}
            >
              {isOwner ? <Building2 className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider text-white">EstateOS</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                  GENESIS v2.6
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CRYPTOGRAPHIC PASS MINTED</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-slate-400/80" />
            <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-cyan-300">
              L5 CLEARANCE
            </div>
          </div>
        </div>

        {/* Gold EMV Chip & Procedural Dynamic Crest */}
        <div className="relative z-10 flex items-center justify-between mb-5">
          {/* Holographic Smart Chip */}
          <div className="relative w-12 h-9 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[1.5px] shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-amber-500/30 backdrop-blur-sm rounded-[6px] grid grid-cols-2 grid-rows-2 gap-[1px] p-1 border border-amber-300/40">
              <div className="border-r border-b border-amber-950/40 rounded-tl-[2px]" />
              <div className="border-b border-amber-950/40 rounded-tr-[2px]" />
              <div className="border-r border-amber-950/40 rounded-bl-[2px]" />
              <div className="rounded-br-[2px]" />
            </div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-60">
              <span className="w-1.5 h-0.5 bg-amber-400 rounded-full" />
              <span className="w-2.5 h-0.5 bg-amber-400 rounded-full" />
              <span className="w-1.5 h-0.5 bg-amber-400 rounded-full" />
            </div>
          </div>

          {/* Procedural Generative Crest */}
          <div className="flex items-center gap-2">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={crestDetails.innerRadius + 14}
                  fill="none"
                  stroke={isOwner ? "rgba(6, 182, 212, 0.4)" : "rgba(16, 185, 129, 0.4)"}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={crestDetails.innerRadius + 6}
                  fill="none"
                  stroke={isOwner ? "rgba(245, 158, 11, 0.5)" : "rgba(168, 85, 247, 0.5)"}
                  strokeWidth="1.5"
                />
                <polygon
                  points="50,22 75,65 25,65"
                  fill="none"
                  stroke={isOwner ? "#38bdf8" : "#34d399"}
                  strokeWidth="1.5"
                  transform={`rotate(${crestDetails.rotationAngle} 50 50)`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isOwner ? (
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                ) : (
                  <Shield className="h-4 w-4 text-emerald-300" />
                )}
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500">DID SIGNATURE</div>
              <div className="text-[10px] font-mono text-slate-300 font-bold">#{hash}</div>
            </div>
          </div>
        </div>

        {/* Live Typography: User Name & Role */}
        <div className="relative z-10 space-y-1 mb-5">
          <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>PASSPORT HOLDER</span>
            {name.trim().length > 0 && (
              <span className="flex items-center gap-1 text-emerald-400 text-[8px] font-mono">
                <CheckCircle2 className="h-2.5 w-2.5" />
                SYNCED
              </span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono break-all line-clamp-1 drop-shadow-md">
            {displayName}
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>{displayEmail}</span>
            {phone && <span className="text-slate-500">• {phone}</span>}
          </div>
        </div>

        {/* Role Pill & Decentralized Hash Bar */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">
              CLEARANCE ROLE
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide font-mono ${
                isOwner
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              <Cpu className="h-3 w-3" />
              <span>{isOwner ? "ASSET OPERATOR" : "SMART RESIDENT"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">
                ESCROW NODE
              </div>
              <div className="text-[10px] font-mono text-slate-300">DID:ESTATEOS:2026</div>
            </div>
            <div className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-400">
              <QrCode className="h-6 w-6 text-slate-300" />
            </div>
          </div>
        </div>
      </GlassTiltCard>
    </div>
  );
}
