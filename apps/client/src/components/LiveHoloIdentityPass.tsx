import React, { useMemo } from "react";
import { GlassTiltCard } from "./GlassTiltCard.js";
import { Shield, Sparkles, Wifi, CheckCircle2, Building2, UserCheck, QrCode } from "lucide-react";

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

  // Deterministic cryptographic signature from name & role
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

  const displayName = name.trim().length > 0 ? name : "ANONYMOUS IDENTITY PENDING";
  const displayEmail = email.trim().length > 0 ? email : "genesis.node@estateos.network";

  return (
    <div className={`w-full perspective-1000 ${className}`}>
      <GlassTiltCard
        maxTilt={6}
        className="relative rounded-2xl p-5 sm:p-6 border border-white/15 bg-gradient-to-br from-slate-900/95 via-black to-slate-950/95 shadow-2xl overflow-hidden group select-none"
      >
        {/* Subtle Iridescent Rainbow Glare Effect */}
        <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-cyan-400/10 via-purple-400/10 to-transparent pointer-events-none -rotate-45 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

        {/* Dynamic Atmospheric Glows */}
        <div
          className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-colors duration-700 ${
            isOwner ? "bg-cyan-500/20" : "bg-emerald-500/20"
          }`}
        />
        <div
          className={`absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-colors duration-700 ${
            isOwner ? "bg-amber-500/15" : "bg-purple-500/15"
          }`}
        />

        {/* Top Header & Hologram Brand */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center border shadow-sm ${
                isOwner
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                  : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
              }`}
            >
              {isOwner ? <Building2 className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-white">EstateOS</span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-bold">
                  VERIFIED PASS
                </span>
              </div>
              <div className="text-[8px] font-mono text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ESCROW SMART KEYCARD</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="h-3.5 w-3.5 text-slate-400" />
            <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-cyan-300">
              L5 CLEARANCE
            </div>
          </div>
        </div>

        {/* Gold EMV Contact Chip & Holographic Seal */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          {/* Realistic Gold EMV Chip */}
          <div className="relative w-11 h-8 rounded-md bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[1px] shadow-sm">
            <div className="w-full h-full bg-amber-500/30 rounded-[5px] grid grid-cols-2 grid-rows-2 gap-[1px] p-0.5 border border-amber-300/40">
              <div className="border-r border-b border-amber-950/40" />
              <div className="border-b border-amber-950/40" />
              <div className="border-r border-amber-950/40" />
              <div />
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300">
              {isOwner ? <Sparkles className="h-3 w-3 text-cyan-400" /> : <Shield className="h-3 w-3 text-emerald-400" />}
              <span>{isOwner ? "ASSET OPERATOR" : "SMART RESIDENT"}</span>
            </div>
            <div className="text-right">
              <div className="text-[7px] font-mono uppercase text-slate-500">DID HASH</div>
              <div className="text-[9px] font-mono text-slate-300 font-bold">#{hash}</div>
            </div>
          </div>
        </div>

        {/* Live Typography: User Name & Role */}
        <div className="relative z-10 space-y-0.5 mb-3">
          <div className="text-[8px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>DIGITAL KEYCARD HOLDER</span>
            {name.trim().length > 0 && (
              <span className="flex items-center gap-0.5 text-emerald-400 text-[8px] font-mono">
                <CheckCircle2 className="h-2.5 w-2.5" />
                ACTIVE
              </span>
            )}
          </div>
          <div className="text-lg font-black tracking-tight text-white font-mono truncate drop-shadow-sm">
            {displayName}
          </div>
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {displayEmail} {phone ? `• ${phone}` : ""}
          </div>
        </div>

        {/* Bottom Bar: Smart QR Protocol */}
        <div className="relative z-10 pt-2.5 border-t border-white/10 flex items-center justify-between">
          <div className="text-[8px] font-mono text-slate-400">
            NETWORK: <span className="text-slate-200">ESTATEOS MAINNET</span> • 100% ESCROW PROTECTED
          </div>
          <QrCode className="h-4 w-4 text-slate-400" />
        </div>
      </GlassTiltCard>
    </div>
  );
}
