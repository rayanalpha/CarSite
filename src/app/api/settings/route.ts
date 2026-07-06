import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { requireApiAuth, unauthorized, checkOrigin } from "@/lib/auth";
import { ALLOWED_SETTING_KEYS } from "@/lib/validation";
import { ensureProtocol } from "@/lib/utils";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return NextResponse.json(map);
}

export async function PUT(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch {
    return unauthorized();
  }

  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  try {
    const data: Record<string, string> = await request.json();

    for (const [key, value] of Object.entries(data)) {
      if (!ALLOWED_SETTING_KEYS.includes(key as typeof ALLOWED_SETTING_KEYS[number])) {
        return NextResponse.json({ error: `Unknown setting key: ${key}` }, { status: 400 });
      }
      const finalValue = key.startsWith("social_") && key.endsWith("_url") ? ensureProtocol(value) : value;
      await prisma.setting.upsert({
        where: { key },
        update: { value: finalValue },
        create: { key, value: finalValue },
      });
    }

    logActivity({
      action: "update",
      entityType: "settings",
      entityName: "Site Settings",
      details: JSON.stringify(Object.keys(data)),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
