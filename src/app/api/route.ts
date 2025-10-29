export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Get FormData from frontend
    const formData = await req.formData();

    // Send directly to Flask
    const response = await fetch("http://127.0.0.1:5000/evaluate_ppt", {
      method: "POST",
      body: formData, // Let fetch set content-type automatically
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Error proxying to Flask:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to extract PPT text",
        details: err.message,
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
