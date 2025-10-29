import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { pptscore } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "file is required" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanName = (file.name || "upload.pptx").replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
    const filename = `${Date.now()}-${cleanName}`;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (!serviceKey)
      return NextResponse.json(
        { error: "Supabase service key not configured" },
        { status: 500 }
      );

    const uploadUrl = `https://jddapdhaavlrxdkrymwd.supabase.co/storage/v1/object/pptbucket/${encodeURIComponent(
      filename
    )}`;

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type":
          file.type ||
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Length": String(buffer.length),
      },
      body: buffer,
    });

    if (!putRes.ok) {
      const txt = await putRes.text();
      return NextResponse.json(
        {
          error: `Supabase upload failed: ${putRes.status} ${putRes.statusText} - ${txt}`,
        },
        { status: 502 }
      );
    }

    const publicUrl = `https://jddapdhaavlrxdkrymwd.supabase.co/storage/v1/object/public/pptbucket/${encodeURIComponent(
      filename
    )}`;

    // Try to persist DB record using session from incoming headers
    try {
      const session = await auth.api.getSession({
        headers: request.headers as any,
      });
      const userId =
        (session as any)?.user?.id ||
        (session as any)?.userId ||
        (session as any)?.id ||
        (session as any)?.sub;
      if (userId) {
        await db
          .insert(pptscore)
          .values({ userId, pptUrl: publicUrl, score: "pending" });
      }
    } catch (err) {
      console.warn("Failed to persist pptscore record", err);
    }

    return NextResponse.json({ ok: true, publicUrl, filename });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
