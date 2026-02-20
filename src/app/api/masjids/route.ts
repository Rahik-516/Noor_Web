import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("masjids")
        .select("id,name,distance_km")
        .order("distance_km", { ascending: true })
        .limit(8);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const responseOut = NextResponse.json({ data: data ?? [] });
    responseOut.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    return responseOut;
}
