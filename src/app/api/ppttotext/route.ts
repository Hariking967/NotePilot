import fs from "fs";
import os from "os";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ppt_path = body?.ppt_path || body?.pptPath || body?.filePath;
    if (!ppt_path) {
      return new Response(
        JSON.stringify({ error: "Missing required field 'ppt_path'" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Proxy to local service
    const res = await fetch("http://127.0.0.1:5000/ppttotext", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ppt_path }),
    });

    const text = await res.text();
    const headers: Record<string, string> = {};
    const ct = res.headers.get("content-type");
    if (ct) headers["content-type"] = ct;
    return new Response(text, { status: res.status, headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
