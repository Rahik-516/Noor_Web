import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { title?: string; lat?: number; lng?: number };

    const title = body.title?.trim();
    if (!title || title.length > 120) {
        return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
        return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const { error } = await supabase.from("iftar_locations").insert({
        title,
        latitude: body.lat,
        longitude: body.lng,
        submitted_by: user.id,
        approved: false,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
