import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";
import { Role, PropertyStatus, LeaseStatus } from "@estateos/shared";
import {
  Building2,
  CheckCircle2,
  Database,
  Layers,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  database: string;
}

export function App() {
  const { data: health, isLoading, error } = useQuery<HealthData>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await api.get("/health");
      return res.data;
    },
    refetchInterval: 10000,
  });

  const lifecycleStages = [
    { title: "Discovery", desc: "Search & map exploration", color: "from-blue-500/20 to-cyan-500/20" },
    { title: "Enquiry", desc: "Direct tenant-owner dialog", color: "from-cyan-500/20 to-teal-500/20" },
    { title: "Visit", desc: "Conflict-free appointment scheduling", color: "from-teal-500/20 to-emerald-500/20" },
    { title: "Lease", desc: "Non-overlapping active contracts", color: "from-emerald-500/20 to-green-500/20" },
    { title: "Rent", desc: "Deterministic ledger & obligations", color: "from-green-500/20 to-amber-500/20" },
    { title: "Maintenance", desc: "Real-time ticketing & resolution", color: "from-amber-500/20 to-rose-500/20" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Estate<span className="text-emerald-400">OS</span></span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">v1.0-foundation</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health?.status === "ok" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              </span>
              <span className="text-slate-300 font-mono">
                API: {isLoading ? "connecting..." : health?.status === "ok" ? "online" : "checking"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Phase 1 Foundation Verified
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            The Operating System for <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Rental Operations</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Eliminating fragmented spreadsheets, detached chat messages, and isolated CRUD. EstateOS connects the complete rental lifecycle in one deterministic, type-safe platform.
          </p>
        </div>

        {/* Live Monorepo & System Health Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Fullstack Type Safety</h3>
                <p className="text-xs text-slate-400">@estateos/shared</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Synchronized Zod schemas and TypeScript types shared across client and server boundaries.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Role: {Role.OWNER}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Property: {PropertyStatus.AVAILABLE}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Lease: {LeaseStatus.ACTIVE}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">PostgreSQL & Prisma</h3>
                <p className="text-xs text-slate-400">Relational Core Schema</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              16 normalized tables with foreign keys, cascading rules, and composite indexes.
            </p>
            <div className="text-xs font-mono text-slate-300 flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span>Database Engine:</span>
              <span className="text-emerald-400 font-semibold">{health?.database || "PostgreSQL 16+"}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">API Runtime</h3>
                <p className="text-xs text-slate-400">Express 5 + Node 24</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Stateless JWT authentication, Zod request validation, and OpenAPI 3.0 documentation.
            </p>
            <div className="text-xs font-mono text-slate-300 flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span>Status:</span>
              <span className={health?.status === "ok" ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {health?.status === "ok" ? `Active (${health.uptimeSeconds}s)` : error ? "Offline" : "Polling..."}
              </span>
            </div>
          </div>
        </div>

        {/* The Lifecycle Pipeline */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                The Connected Rental Operations Workflow
              </h2>
              <p className="text-xs text-slate-400">EstateOS is engineered as an unbroken single-product pipeline</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {lifecycleStages.map((stage, i) => (
              <div
                key={stage.title}
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                    <span>0{i + 1}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">{stage.title}</h4>
                  <p className="text-xs text-slate-400 leading-snug">{stage.desc}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center text-[10px] text-emerald-400 font-medium">
                  Phase Ready <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 EstateOS. Designed for production-grade rental operations.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300">Monorepo: apps/client + apps/server + packages/shared</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
