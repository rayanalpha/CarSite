"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Upload, HardDrive, Calendar, Database, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BackupInfo {
  exists: boolean;
  size: number;
  lastModified: string;
  backupsDir: string;
  backups: { name: string; size: number; date: string }[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BackupPage() {
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/backup/info");
        if (res.ok) {
          setInfo(await res.json());
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDownload() {
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?(.+?)"?$/);
      const filename = match?.[1] || `carsite-backup-${new Date().toISOString().split("T")[0]}.db`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setStatus({ type: "error", message: "Failed to download backup" });
    }
  }

  async function handleRestore(e: React.FormEvent) {
    e.preventDefault();
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.[0]) return;

    const file = fileInput.files[0];
    if (!file.name.endsWith(".db") && !file.name.endsWith(".sqlite")) {
      setStatus({ type: "error", message: "Invalid file format. Only .db or .sqlite files are accepted." });
      return;
    }

    if (!confirm("Are you sure? This will replace the current database with the uploaded file. An automatic backup of the current database will be created before restoring.")) {
      return;
    }

    setRestoring(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/backup", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: "Database restored successfully!" });
        fileInput.value = "";
      } else {
        setStatus({ type: "error", message: data.error || "Restore failed" });
      }
    } catch {
      setStatus({ type: "error", message: "Restore failed" });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backup & Restore</h1>
        <p className="text-muted-foreground">Download or restore your database</p>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
          role="alert"
        >
          {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {status.message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Backup
            </CardTitle>
            <CardDescription>Download the current SQLite database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : info ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="h-4 w-4" />
                  <span>Size: <strong>{formatSize(info.size)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last modified: <strong>{formatDate(info.lastModified)}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Could not load database info</p>
            )}
            <Button onClick={handleDownload} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download Database
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore Backup
            </CardTitle>
            <CardDescription>Upload a previously downloaded backup</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRestore} className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-400 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>An automatic backup is created before restoring. The database will be unavailable during the process.</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".db,.sqlite"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={restoring}
              />
              <Button type="submit" disabled={restoring} variant="destructive" className="w-full gap-2">
                {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {restoring ? "Restoring..." : "Restore Database"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {info?.backups && info.backups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Auto-Backups
            </CardTitle>
            <CardDescription>
              Automatic backups created before each restore. Stored in <code className="text-xs bg-secondary px-1 py-0.5 rounded">backups/</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {info.backups.map((b) => (
                <div key={b.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                  <span className="text-muted-foreground truncate">{b.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-4">{formatSize(b.size)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
