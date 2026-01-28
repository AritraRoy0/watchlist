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

export async function GET(req: Request) {
  try {
    const res = await fetch(`${getTargetBase()}/watchlist`, {
      method: "GET",
      headers: authHeader(req),
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

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(`${getTargetBase()}/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(req),
      },
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
