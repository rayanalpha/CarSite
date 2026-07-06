import { NextResponse } from "next/server";
import { requireApiAuth, unauthorized, checkOrigin, hashPassword, verifyPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { ChangePasswordSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  try {
    const body = await request.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    if (!(await verifyPassword(currentPassword))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    const hashed = hashPassword(newPassword);

    await prisma.setting.upsert({
      where: { key: "admin_password_hash" },
      update: { value: hashed },
      create: { key: "admin_password_hash", value: hashed },
    });

    await logActivity({
      action: "update",
      entityType: "settings",
      entityName: "Admin Password",
      details: "Password changed",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
