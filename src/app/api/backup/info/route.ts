import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireApiAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ exists: false });
  }

  const stats = fs.statSync(dbPath);

  function dirSize(dir: string): number {
    let total = 0;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) total += dirSize(p);
        else total += fs.statSync(p).size;
      }
    } catch {}
    return total;
  }

  const backups: { name: string; size: number; date: string }[] = [];
  if (fs.existsSync(backupDir)) {
    const entries = fs.readdirSync(backupDir, { withFileTypes: true });
    const mapped = entries.map((e) => {
      const p = path.join(backupDir, e.name);
      const s = fs.statSync(p);
      return { name: e.name + (e.isDirectory() ? "/" : ""), size: e.isDirectory() ? dirSize(p) : s.size, date: s.mtime.toISOString(), mtimeMs: s.mtimeMs };
    });
    mapped.sort((a, b) => b.mtimeMs - a.mtimeMs);
    backups.push(...mapped);
  }

  return NextResponse.json({
    exists: true,
    size: stats.size,
    lastModified: stats.mtime.toISOString(),
    backupsDir: backupDir,
    backups,
  });
}
