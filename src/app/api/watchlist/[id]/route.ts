import { NextResponse } from "next/server";

function getTargetBase() {
  const target = process.env.API_PROXY_TARGET;
  if (!target) {
    throw new Error("API_PROXY_TARGET is not set");
  }
  return target.replace(/\/+$/, "");
}

function authHeader(req: Request): HeadersInit {
  const header = req.headers.get("authorization");
  return header ? { Authorization: header } : {};
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const res = await fetch(`${getTargetBase()}/watchlist/${id}`, {
      method: "DELETE",
      headers: authHeader(req),
    });

    const payload = await res.text();
    return new NextResponse(payload, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (err: any) {
    console.error("Proxy /watchlist DELETE failed:", err);
    return NextResponse.json(
      { error: err?.message || "Proxy failed" },
      { status: 502 }
    );
  }
}
