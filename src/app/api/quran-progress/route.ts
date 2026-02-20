import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RequestBody {
    juzNumber: number;
    completed: boolean;
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RequestBody;

    if (!Number.isInteger(body.juzNumber) || body.juzNumber < 1 || body.juzNumber > 30) {
        return NextResponse.json({ error: "Invalid juz number" }, { status: 400 });
    }

    if (typeof body.completed !== "boolean") {
        return NextResponse.json({ error: "Invalid completion status" }, { status: 400 });
    }

    const { error } = await supabase.from("quran_progress").upsert(
        {
            user_id: user.id,
            juz_number: body.juzNumber,
            completed: body.completed,
            date_completed: body.completed ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,juz_number" },
    );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
