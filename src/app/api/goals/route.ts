import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndUnlockAchievements } from "@/lib/profile";

export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) {
        return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    const [{ data: settings }, { data: progress }] = await Promise.all([
        supabase
            .from("daily_goal_settings")
            .select("id,title,goal_type,target_value,unit,enabled,is_custom")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
        supabase
            .from("daily_goal_progress")
            .select("goal_id,progress_date,completed_value,completed")
            .eq("user_id", user.id)
            .eq("progress_date", date),
    ]);

    return NextResponse.json({
        settings: settings ?? [],
        progress: progress ?? [],
        date,
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

    const body = (await request.json()) as {
        goalId?: string;
        date?: string;
        completedValue?: number;
        completed?: boolean;
    };

    if (!body.goalId || !body.date) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const completedValue = Number(body.completedValue ?? 0);
    const completed = Boolean(body.completed);

    const { error } = await supabase
        .from("daily_goal_progress")
        .upsert(
            {
                user_id: user.id,
                goal_id: body.goalId,
                progress_date: body.date,
                completed_value: completedValue,
                completed,
            },
            { onConflict: "user_id,goal_id,progress_date" },
        );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check for unlocked achievements
    const unlockedAchievements = await checkAndUnlockAchievements(user.id);

    return NextResponse.json({ success: true, unlockedAchievements });
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
        id?: string;
        title?: string;
        goalType?: string;
        targetValue?: number;
        unit?: string;
        enabled?: boolean;
        isCustom?: boolean;
    };

    if (!body.title || !body.goalType || !body.unit) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const targetValue = Number(body.targetValue ?? 1);
    if (!Number.isFinite(targetValue) || targetValue <= 0) {
        return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    const { error } = await supabase
        .from("daily_goal_settings")
        .upsert(
            {
                id: body.id,
                user_id: user.id,
                title: body.title,
                goal_type: body.goalType,
                target_value: targetValue,
                unit: body.unit,
                enabled: body.enabled ?? true,
                is_custom: body.isCustom ?? false,
            },
            { onConflict: "user_id,title" },
        );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase
        .from("daily_goal_settings")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
