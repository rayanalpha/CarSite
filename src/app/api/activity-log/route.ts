import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth, unauthorized } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50") || 50));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count(),
    ]);

    return NextResponse.json({ logs, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Failed to fetch activity log" }, { status: 500 });
  }
}
