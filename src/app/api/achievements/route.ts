import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndUnlockAchievements } from "@/lib/profile";

/**
 * POST /api/achievements/check
 * Checks and unlocks achievements based on current user stats
 * Called after significant actions (goal completion, etc.)
 */
export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const unlockedAchievements = await checkAndUnlockAchievements(user.id);

        return NextResponse.json({
            success: true,
            unlockedAchievements,
        });
    } catch (error) {
        console.error("Error checking achievements:", error);
        return NextResponse.json({ error: "Failed to check achievements" }, { status: 500 });
    }
}

/**
 * GET /api/achievements
 * Get all achievements for the current user
 */
export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: allAchievements }, { data: unlockedAchievements }] = await Promise.all([
        supabase
            .from("achievements")
            .select("*")
            .order("created_at", { ascending: true }),
        supabase
            .from("user_achievements")
            .select("achievement_id, unlocked_at")
            .eq("user_id", user.id),
    ]);

    if (!allAchievements) {
        return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }

    const unlockedMap = Object.fromEntries(
        (unlockedAchievements ?? []).map((ua) => [ua.achievement_id, ua.unlocked_at]),
    );

    const achievements = allAchievements.map((achievement) => ({
        ...achievement,
        unlocked: achievement.id in unlockedMap,
        unlockedAt: unlockedMap[achievement.id],
    }));

    return NextResponse.json({ achievements });
}
