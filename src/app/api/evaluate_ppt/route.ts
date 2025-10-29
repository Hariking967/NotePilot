export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const res = await fetch("http://127.0.0.1:5000/evaluate_ppt", {
      method: "POST",
      body: formData, // ✅ Let fetch set Content-Type automatically
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Error in /api/evaluate_ppt:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to extract PPT text",
        details: err.message,
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
