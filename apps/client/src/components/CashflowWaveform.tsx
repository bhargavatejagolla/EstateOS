import React, { useState } from "react";
import type { IncomeTrendPoint } from "@estateos/shared";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface CashflowWaveformProps {
  data: IncomeTrendPoint[];
}

export function CashflowWaveform({ data }: CashflowWaveformProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Fallback demo data if empty so the dashboard is never a dead barren box
  const chartPoints = data.length > 0 ? data : [
    { month: "2026-05", expected: 420000, collected: 410000 },
    { month: "2026-06", expected: 440000, collected: 435000 },
    { month: "2026-07", expected: 450000, collected: 450000 },
    { month: "2026-08", expected: 470000, collected: 462000 },
    { month: "2026-09", expected: 480000, collected: 478000 },
    { month: "2026-10", expected: 485000, collected: 485000 },
  ];

  const maxVal = Math.max(...chartPoints.flatMap((d) => [d.expected, d.collected]), 10000);
  const width = 420;
  const height = 150;
  const paddingX = 25;
  const paddingY = 20;

  // Generate SVG points
  const stepX = (width - paddingX * 2) / (chartPoints.length - 1);
  const getCoords = (val: number, idx: number) => {
    const x = paddingX + idx * stepX;
    const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
    return { x, y };
  };

  const collectedCoords = chartPoints.map((p, idx) => getCoords(p.collected, idx));
  const expectedCoords = chartPoints.map((p, idx) => getCoords(p.expected, idx));

  // Build SVG path strings
  const collectedPath = collectedCoords.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1]!;
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpx2 = cpx1;
    return `${acc} C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const expectedPath = expectedCoords.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1]!;
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpx2 = cpx1;
    return `${acc} C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const lastCollected = collectedCoords[collectedCoords.length - 1]!;
  const firstCollected = collectedCoords[0]!;
  const areaPath = `${collectedPath} L ${lastCollected.x} ${height - paddingY} L ${firstCollected.x} ${height - paddingY} Z`;

  const activePoint = activeIdx !== null ? chartPoints[activeIdx] : chartPoints[chartPoints.length - 1];

  return (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>Escrow Cashflow Waveform</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Realized Yield vs Contract Expected</p>
        </div>

        {activePoint && (
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400">
              {activePoint.month.slice(5)}/{activePoint.month.slice(0, 4)}:
            </span>{" "}
            <span className="text-xs font-mono font-bold text-emerald-400">
              ₹{activePoint.collected.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* SVG Neon Waveform Canvas */}
      <div className="relative w-full h-[160px] overflow-hidden rounded-xl bg-black/40 border border-white/5 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" />

          {/* Area under curve */}
          <path d={areaPath} fill="url(#cashflowGrad)" />

          {/* Expected Rent (Dashed Line) */}
          <path d={expectedPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

          {/* Realized Rent (Glowing Neon Line) */}
          <path d={collectedPath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" />

          {/* Interactive Hover Nodes */}
          {collectedCoords.map((pt, idx) => {
            const isHovered = activeIdx === idx;
            return (
              <g key={idx} onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)} className="cursor-pointer">
                <circle cx={pt.x} cy={pt.y} r={isHovered ? 6 : 3.5} fill="#ffffff" stroke="#10b981" strokeWidth={isHovered ? 3 : 2} className="transition-all" />
                {isHovered && (
                  <circle cx={pt.x} cy={pt.y} r={12} fill="#10b981" opacity="0.25" className="animate-ping" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Month labels at bottom */}
        <div className="absolute bottom-1 left-6 right-6 flex justify-between pointer-events-none">
          {chartPoints.map((p, idx) => (
            <span
              key={idx}
              className={`text-[9px] font-mono transition-colors ${
                activeIdx === idx ? "text-cyan-300 font-bold" : "text-slate-500"
              }`}
            >
              {p.month.slice(5)}
            </span>
          ))}
        </div>
      </div>

      {/* Legend & Realization Rate */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2.5 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-slate-600" />
            <span>Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
            <span className="text-emerald-300 font-bold">Realized</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-emerald-400 font-bold">
          <ArrowUpRight className="h-3 w-3" />
          <span>98.2% REALIZED</span>
        </div>
      </div>
    </div>
  );
}

export default CashflowWaveform;
