import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateProfileStats, getUserAchievementsWithStatus } from "@/lib/profile";

/**
 * GET /api/users/[userId] - Get public profile of a user
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> },
) {
    const { userId } = await params;
    const supabase = await createClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, full_name, username, bio, avatar_url, is_profile_public, created_at, updated_at")
        .eq("id", userId)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    // If profile is not public, only show basic info
    if (!profile.is_profile_public) {
        return NextResponse.json({ error: "এই প্রোফাইল ব্যক্তিগত" }, { status: 403 });
    }

    // Get stats and achievements for public profile
    const [stats, achievements] = await Promise.all([
        calculateProfileStats(userId),
        getUserAchievementsWithStatus(userId),
    ]);

    return NextResponse.json({
        profile,
        stats,
        achievements: achievements.filter((a) => a.unlocked),
    });
}
