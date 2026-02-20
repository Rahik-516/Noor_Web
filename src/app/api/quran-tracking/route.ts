import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("quran_tracking")
        .select("mode,payload")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        mode: data?.mode ?? "pages",
        payload: data?.payload ?? {},
    });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { mode?: string; payload?: Record<string, unknown> };
    const mode = body.mode ?? "pages";
    const payload = body.payload ?? {};

    const { error } = await supabase
        .from("quran_tracking")
        .upsert(
            {
                user_id: user.id,
                mode,
                payload,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
        );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
