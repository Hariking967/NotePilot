import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse incoming multipart/form-data using the Web Request FormData API
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const originalName = (file as any).name || "upload.bin";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;

    // Create upload dir
    const uploadsDir = path.resolve(process.cwd(), "tmp", "uploads");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);

    // file.arrayBuffer() is available in Next's Request FormData File
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.promises.writeFile(filePath, buffer);

    // For local/dev only: return the absolute server path so you can analyze it
    // In production, consider returning a safe relative path or an ID instead
    return NextResponse.json({
      ok: true,
      serverPath: filePath,
      filename,
      originalName,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("upload/local error", err);
    return NextResponse.json(
      { ok: false, error: (err as any)?.message || String(err) },
      { status: 500 }
    );
  }
}
