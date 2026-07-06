import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, unauthorized, checkOrigin } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  const dbPath = path.join(process.cwd(), "prisma", "dev.db");

  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: "Database file not found" }, { status: 404 });
  }

  const file = fs.readFileSync(dbPath);
  const stats = fs.statSync(dbPath);
  const date = new Date().toISOString().split("T")[0];

  return new Response(file, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="carsite-backup-${date}.db"`,
      "Content-Length": String(stats.size),
    },
  });
}

export async function POST(request: Request) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".db") && !file.name.endsWith(".sqlite")) {
    return NextResponse.json({ error: "Invalid file format. Only .db or .sqlite files are accepted." }, { status: 400 });
  }

  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum 100MB." }, { status: 400 });
  }

  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const backupDir = path.join(process.cwd(), "backups");

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    let autoBackupName: string | null = null;
    if (fs.existsSync(dbPath)) {
      autoBackupName = `pre-restore-${Date.now()}.db`;
      fs.copyFileSync(dbPath, path.join(backupDir, autoBackupName));
    }

    await prisma.$disconnect();

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dbPath, buffer);

    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      if (autoBackupName && fs.existsSync(path.join(backupDir, autoBackupName))) {
        fs.copyFileSync(path.join(backupDir, autoBackupName), dbPath);
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
      }
      return NextResponse.json({ error: "Invalid database file. Previous backup restored automatically." }, { status: 400 });
    }

    await logActivity({
      action: "restore",
      entityType: "system",
      entityName: "Database",
      details: "Database restored from backup",
    });

    return NextResponse.json({ success: true });
  } catch {
    try {
      await prisma.$connect();
    } catch {}
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
