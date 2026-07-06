import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, setSession, verifyPassword, clearSession, getSession, checkOrigin } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  const body = await request.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!(await verifyPassword(parsed.data.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = generateToken();
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.session.create({ data: { token, expiresAt } });
  } catch {
    // DB unavailable — proceed with cookie-only session
  }

  await setSession(token);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ authenticated: !!session });
}
