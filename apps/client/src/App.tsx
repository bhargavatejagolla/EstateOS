import { useEffect, useState } from "react";
import { HealthResponseSchema } from "@estateos/shared";

type Status = "checking" | "connected" | "degraded" | "unreachable" | "schema-mismatch";

export default function App() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((json) => {
        const parsed = HealthResponseSchema.safeParse(json);
        setStatus(parsed.success ? "connected" : "schema-mismatch");
      })
      .catch(() => setStatus("unreachable"));
  }, []);

  const label: Record<Status, string> = {
    checking: "checking…",
    connected: "connected ✅",
    degraded: "degraded ⚠️",
    unreachable: "unreachable ❌",
    "schema-mismatch": "schema mismatch ⚠️",
  };

  return (
    <main className="min-h-screen bg-ivory-50 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-12 max-w-lg text-center border border-ivory-100">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">EstateOS</h1>
        <p className="text-navy-900/60 mb-8">Phase 1 — Foundation</p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-navy-900/80">API:</span>
          <span className="font-mono bg-ivory-100 px-3 py-1 rounded text-emerald-500">
            {label[status]}
          </span>
        </div>
      </div>
    </main>
  );
}
