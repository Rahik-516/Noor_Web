import { NextResponse } from "next/server";

export async function GET() {
    const responseOut = NextResponse.json({ status: "ok", app: "নূর" });
    responseOut.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");
    return responseOut;
}
