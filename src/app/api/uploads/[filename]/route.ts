import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safe = filename.replace(/\.\.\//g, "").replace(/\.\.\\/g, "").replace(/\//g, "").replace(/\\/g, "");
  const filepath = path.join(process.cwd(), "public", "uploads", safe);

  try {
    const buffer = await fs.readFile(filepath);
    const ext = path.extname(filepath).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" :
      ext === ".webp" ? "image/webp" :
      ext === ".gif" ? "image/gif" :
      ext === ".svg" ? "image/svg+xml" :
      "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
