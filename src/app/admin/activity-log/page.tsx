"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  FolderTree,
  Settings,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  createdAt: string;
}

const actionConfig: Record<string, { label: string; icon: typeof Plus; color: string }> = {
  create: { label: "Created", icon: Plus, color: "text-green-400 bg-green-500/10 border-green-500/20" },
  update: { label: "Updated", icon: Pencil, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  delete: { label: "Deleted", icon: Trash2, color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

const entityIcons: Record<string, typeof Package> = {
  product: Package,
  category: FolderTree,
  settings: Settings,
};

const actionLabels: Record<string, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 30;

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activity-log?page=${p}&limit=${limit}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const totalPages = Math.ceil(total / limit);

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function parseDetails(details: string | null): Record<string, unknown> | null {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all changes made across the admin panel
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLogs(page)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Clock className="h-10 w-10 opacity-30" />
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => {
              const actionCfg = actionConfig[log.action] || actionConfig.update;
              const ActionIcon = actionCfg.icon;
              const EntityIcon = entityIcons[log.entityType] || Package;
              const details = parseDetails(log.details);

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${actionCfg.color}`}
                  >
                    <ActionIcon className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 font-normal capitalize gap-1"
                      >
                        <EntityIcon className="h-3 w-3" />
                        {log.entityType}
                      </Badge>
                      <span className="text-sm font-medium">
                        {actionLabels[log.action] || log.action}
                      </span>
                      {log.entityName && (
                        <>
                          <span className="text-xs text-muted-foreground">&mdash;</span>
                          <span className="text-sm text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                            {log.entityName}
                          </span>
                        </>
                      )}
                      {log.entityId && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #{log.entityId}
                        </span>
                      )}
                    </div>

                    {details && Object.keys(details).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {Object.entries(details).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground font-mono"
                          >
                            {key}: {typeof value === "string" ? value : JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span title={formatDate(log.createdAt)}>
                        {formatTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({total} total entries)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
