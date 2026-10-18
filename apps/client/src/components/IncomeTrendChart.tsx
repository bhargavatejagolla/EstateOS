import type { IncomeTrendPoint } from "@estateos/shared";

interface Props {
  data: IncomeTrendPoint[];
}

export function IncomeTrendChart({ data }: Props) {
  const max = Math.max(...data.flatMap((d) => [d.expected, d.collected]), 1);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
        <span className="font-semibold text-slate-300">Last 6 Months</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-700"></span>
            <span>Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-emerald-400 font-medium">Collected</span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 h-44 pt-2 pb-1 border-b border-slate-800">
        {data.map((d) => {
          const expectedPct = Math.max(4, Math.round((d.expected / max) * 100));
          const collectedPct = Math.max(4, Math.round((d.collected / max) * 100));

          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="flex gap-1 w-full items-end h-full justify-center">
                <div
                  className="w-full max-w-[14px] bg-slate-700/80 hover:bg-slate-600 rounded-t transition"
                  style={{ height: `${expectedPct}%` }}
                  title={`${d.month}: Expected ₹${d.expected.toLocaleString()}`}
                />
                <div
                  className="w-full max-w-[14px] bg-emerald-500 hover:bg-emerald-400 rounded-t transition shadow-sm shadow-emerald-500/20"
                  style={{ height: `${collectedPct}%` }}
                  title={`${d.month}: Collected ₹${d.collected.toLocaleString()}`}
                />
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-400 group-hover:text-slate-200 transition">
                {d.month.slice(5)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 mt-2 text-right">
        CSS Grid bar visualization · Zero external charting dependencies
      </p>
    </div>
  );
}

export default IncomeTrendChart;
