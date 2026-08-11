import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ActivityLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/activity-logs").then((res) => setLogs(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-muted)] py-6">No activity recorded yet</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="flex items-start justify-between text-sm border-b border-gray-50 dark:border-gray-800/50 pb-2">
              <div>
                <p className="dark:text-white"><span className="font-medium">{log.user?.name}</span> {log.action}</p>
                {log.details && <p className="text-xs text-[var(--color-muted)]">{log.details}</p>}
              </div>
              <span className="text-xs text-[var(--color-muted)] shrink-0 ml-3">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}