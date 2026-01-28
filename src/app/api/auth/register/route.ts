import { NextResponse } from "next/server";

function getTargetBase() {
  const target = process.env.API_PROXY_TARGET;
  if (!target) {
    throw new Error("API_PROXY_TARGET is not set");
  }
  return target.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(`${getTargetBase()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const payload = await res.text();
    return new NextResponse(payload, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Proxy failed" },
      { status: 500 }
    );
  }
}
