export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filePath = body?.filePath;
  const fields = body?.fields || [];

    if (!filePath) {
      return new Response(JSON.stringify({ error: "filePath required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // 1) Convert PPT -> text via local service
    const pptRes = await fetch("http://127.0.0.1:5000/ppttotext", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ppt_path: filePath }),
    });

    if (!pptRes.ok) {
      const txt = await pptRes.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: "ppttotext failed", detail: txt }),
        {
          status: 502,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const pptCT = pptRes.headers.get("content-type") || "";
    let textContent: string;
    if (pptCT.includes("application/json")) {
      const j = await pptRes.json();
      // try common fields
      textContent = j.text || j.content || JSON.stringify(j);
    } else {
      textContent = await pptRes.text();
    }

    // 2) Call evaluation service
    // fields may be array of strings or objects; normalize into {Pillar_Title, Critique}
    const extra_pillars = (fields || []).map((f: any) => {
      if (typeof f === "string") return { Pillar_Title: f, Critique: "" };
      const title = f.Pillar_Title || f.Title || f.text || f.name || "";
      const critique = f.Critique || f.critique || f.Comment || f.comment || "";
      return { Pillar_Title: title, Critique: critique };
    });

    const evalRes = await fetch("http://127.0.0.1:5000/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_content: textContent, extra_pillars }),
    });

    const evalText = await evalRes.text();

    // forward status and content-type
    const headers: Record<string, string> = {};
    const ct = evalRes.headers.get("content-type");
    if (ct) headers["content-type"] = ct;

    return new Response(evalText, { status: evalRes.status, headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
