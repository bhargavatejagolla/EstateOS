import React from "react";
import {
  FileText,
  DollarSign,
  Wrench,
  Building,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";

interface AuditEvent {
  id: string;
  action: string;
  message: string;
  createdAt: string;
}

interface RecentActivityFeedProps {
  activity: AuditEvent[];
}

export function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
  if (activity.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <Activity className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-white">No Recent Operations</h4>
        <p className="text-xs text-slate-400 mt-1">
          System events and audit records will populate here automatically.
        </p>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    if (action.includes("PAYMENT")) {
      return {
        icon: <DollarSign className="h-3.5 w-3.5 text-emerald-400" />,
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    }
    if (action.includes("LEASE")) {
      return {
        icon: <FileText className="h-3.5 w-3.5 text-teal-400" />,
        badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      };
    }
    if (action.includes("MAINTENANCE")) {
      return {
        icon: <Wrench className="h-3.5 w-3.5 text-amber-400" />,
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    }
    if (action.includes("PROPERTY")) {
      return {
        icon: <Building className="h-3.5 w-3.5 text-blue-400" />,
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    }
    return {
      icon: <CheckCircle className="h-3.5 w-3.5 text-slate-400" />,
      badge: "bg-slate-800 text-slate-300 border-slate-700",
    };
  };

  return (
    <div className="space-y-3">
      {activity.slice(0, 7).map((item) => {
        const style = getActionBadge(item.action);
        const dateStr = new Date(item.createdAt).toLocaleString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3"
          >
            <div className={`p-2 rounded-lg border shrink-0 ${style.badge}`}>
              {style.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {item.action.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {dateStr}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {item.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RecentActivityFeed;
