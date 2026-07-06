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

  const backups: { name: string; size: number; date: string }[] = [];
  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter((f) => f.endsWith(".db")).sort().reverse();
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const fileStats = fs.statSync(filePath);
      backups.push({
        name: file,
        size: fileStats.size,
        date: fileStats.mtime.toISOString(),
      });
    }
  }

  return NextResponse.json({
    exists: true,
    size: stats.size,
    lastModified: stats.mtime.toISOString(),
    backupsDir: backupDir,
    backups,
  });
}
