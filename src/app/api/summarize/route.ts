export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.text) {
      return new Response(
        JSON.stringify({ error: "Missing 'text' in request body" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const res = await fetch("http://127.0.0.1:5000/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: body.text }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(
        JSON.stringify({
          error: "Summary generation failed",
          details: errorText,
        }),
        { status: res.status, headers: { "content-type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in summarization:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to generate summary",
        details: String(err),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
