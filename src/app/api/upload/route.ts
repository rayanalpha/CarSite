import { NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { requireApiAuth, unauthorized, checkOrigin } from "@/lib/auth";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const HEIC_MIME = ["image/heic", "image/heif"];
const MAX_SIZE = 30 * 1024 * 1024;

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const WEBP_SIGNATURE = [0x52, 0x49, 0x46, 0x46];

function checkMagicBytes(buffer: Buffer): boolean {
  if (JPEG_SIGNATURE.every((b, i) => buffer[i] === b)) return true;
  if (PNG_SIGNATURE.every((b, i) => buffer[i] === b)) return true;
  if (WEBP_SIGNATURE.every((b, i) => buffer[i] === b)) return true;
  return false;
}

function safeError(err: unknown): string {
  try {
    if (err instanceof Error) return err.message + "\n" + (err.stack || "");
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function POST(request: Request) {
  console.error("[UPLOAD] POST /api/upload called");

  try {
    await requireApiAuth();
  } catch {
    console.error("[UPLOAD] auth failed");
    return unauthorized();
  }

  const originCheck = checkOrigin(request);
  if (originCheck) {
    console.error("[UPLOAD] origin check failed");
    return originCheck;
  }

  try {
    console.error("[UPLOAD] reading formData...");
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.error("[UPLOAD] no file in formData");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name?.toLowerCase() || "";
    const isHeicByExt = fileName.endsWith(".heic") || fileName.endsWith(".heif");
    const isHeicByMime = HEIC_MIME.includes(file.type);
    const isHeic = isHeicByMime || isHeicByExt;

    console.error("[UPLOAD] file name:", fileName, "mime:", file.type, "heic:", isHeic);

    if (!ALLOWED_MIME.includes(file.type) && !isHeic) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, HEIC images allowed" }, { status: 400 });
    }

    console.error("[UPLOAD] reading buffer...");
    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);
    console.error("[UPLOAD] buffer size:", buf.length);

    if (buf.length > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 30MB)" }, { status: 400 });
    }

    if (!isHeic && !checkMagicBytes(buf)) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }

    const ext = isHeic ? "jpg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    console.error("[UPLOAD] creating upload dir...");
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);

    if (isHeic) {
      console.error("[UPLOAD] HEIC path: spawning worker...");
      const tmpFile = path.join(os.tmpdir(), `heic-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.heic`);
      await writeFile(tmpFile, buf);
      console.error("[UPLOAD] temp file written:", tmpFile);

      const workerScript = path.join(process.cwd(), "scripts", "heic-worker.js");
      console.error("[UPLOAD] worker script:", workerScript);
      console.error("[UPLOAD] node:", process.execPath);

      try {
        await new Promise<void>((resolve, reject) => {
          execFile(
            process.execPath,
            [workerScript, tmpFile, filepath],
            { timeout: 60000 },
            (err, _stdout, stderr) => {
              if (err) {
                console.error("[UPLOAD] worker err:", err.message);
                console.error("[UPLOAD] worker stderr:", stderr);
                reject(new Error((stderr || err.message).toString().trim()));
              } else {
                resolve();
              }
            }
          );
        });
      } catch (e) {
        console.error("[UPLOAD] worker threw:", safeError(e));
        await unlink(tmpFile).catch(() => {});
        return NextResponse.json({ error: "HEIC convert: " + safeError(e) }, { status: 500 });
      }

      console.error("[UPLOAD] HEIC conversion succeeded");
    } else {
      console.error("[UPLOAD] non-HEIC: processing with sharp...");
      const sharp = (await import("sharp")).default;
      let pipeline = sharp(buf).rotate().resize(1200, 1200, { fit: "inside", withoutEnlargement: true });

      if (ext === "png") {
        pipeline = pipeline.png();
      } else if (ext === "webp") {
        pipeline = pipeline.webp({ quality: 80 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      }

      await pipeline.toFile(filepath);
      console.error("[UPLOAD] sharp done");
    }

    console.error("[UPLOAD] returning success:", filename);
    return NextResponse.json({ url: `/api/uploads/${filename}` });
  } catch (error) {
    console.error("[UPLOAD] UNHANDLED error:", error);
    const msg = safeError(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
