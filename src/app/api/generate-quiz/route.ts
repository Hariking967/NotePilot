export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;

    const res = await fetch("http://127.0.0.1:5000/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Error in /api/generate-quiz:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to generate quiz",
        details: err.message,
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
