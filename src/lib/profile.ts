import { createClient as createServerClient } from "@/lib/supabase/server";
import type { ProfileStats, UserProfile, Achievement, UserAchievement } from "@/lib/types";

/**
 * Get user profile with all details
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
        .from("users")
        .select("id, full_name, username, bio, avatar_url, is_profile_public, created_at, updated_at")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    return data;
}

/**
 * Calculate comprehensive profile stats from user data
 */
export async function calculateProfileStats(userId: string): Promise<ProfileStats> {
    const supabase = await createServerClient();

    // Fetch all required data in parallel
    const [
        { data: goalProgress },
        { data: quranData },
        { data: streakData },
        { data: goalSettings },
    ] = await Promise.all([
        // Daily goal completions count
        supabase
            .from("daily_goal_progress")
            .select("id")
            .eq("user_id", userId)
            .eq("completed", true),

        // Quran pages completed
        supabase
            .from("quran_progress")
            .select("id")
            .eq("user_id", userId)
            .eq("completed", true),

        // Current streak
        supabase
            .from("user_streaks")
            .select("streak_count")
            .eq("user_id", userId)
            .maybeSingle(),

        // Goal settings to calculate today's completion
        supabase
            .from("daily_goal_settings")
            .select("id")
            .eq("user_id", userId)
            .eq("enabled", true),
    ]);

    const totalGoalsCompleted = goalProgress?.length ?? 0;

    // Calculate today's completion percentage
    const today = new Date().toLocaleDateString("en-CA");
    const { data: todayProgress } = await supabase
        .from("daily_goal_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("progress_date", today)
        .eq("completed", true);

    const enabledGoalCount = goalSettings?.length ?? 1; // Avoid division by zero
    const todayCompletedCount = todayProgress?.length ?? 0;
    const goalCompletionPercentageToday = Math.round((todayCompletedCount / enabledGoalCount) * 100);

    // Count prayers completed (prayers are goals with type "prayer")
    const { data: prayerGoals } = await supabase
        .from("daily_goal_settings")
        .select("id")
        .eq("user_id", userId)
        .eq("goal_type", "prayer");

    const prayerGoalIds = prayerGoals?.map((g) => g.id) ?? [];

    let totalPrayersCompleted = 0;
    if (prayerGoalIds.length > 0) {
        const { data: prayerProgress } = await supabase
            .from("daily_goal_progress")
            .select("id")
            .eq("user_id", userId)
            .in("goal_id", prayerGoalIds)
            .eq("completed", true);
        totalPrayersCompleted = prayerProgress?.length ?? 0;
    }

    return {
        totalGoalsCompleted,
        goalCompletionPercentageToday,
        quranPagesCompleted: quranData?.length ?? 0,
        quranSurahsCompleted: 0, // Simplified for now; would require detailed Quran schema
        currentStreak: streakData?.streak_count ?? 0,
        totalPrayersCompleted,
        profileCompleteness: calculateProfileCompleteness({}), // Simplified
    };
}

/**
 * Calculate how complete the user's profile is (0-100%)
 */
export function calculateProfileCompleteness(profile: Partial<UserProfile>): number {
    let score = 0;
    if (profile.full_name) score += 25;
    if (profile.username) score += 25;
    if (profile.bio) score += 25;
    if (profile.avatar_url) score += 25;
    return Math.min(score, 100);
}

/**
 * Unlock achievement for a user if not already unlocked
 */
export async function unlockAchievement(
    userId: string,
    achievementKey: string,
): Promise<{ success: boolean; message: string }> {
    const supabase = await createServerClient();

    // Find achievement by key
    const { data: achievement, error: achievementError } = await supabase
        .from("achievements")
        .select("id")
        .eq("achievement_key", achievementKey)
        .single();

    if (achievementError || !achievement) {
        return { success: false, message: "Achievement not found" };
    }

    // Check if already unlocked
    const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", userId)
        .eq("achievement_id", achievement.id)
        .maybeSingle();

    if (existing) {
        return { success: false, message: "Achievement already unlocked" };
    }

    // Unlock the achievement
    const { error: insertError } = await supabase
        .from("user_achievements")
        .insert({
            user_id: userId,
            achievement_id: achievement.id,
        });

    if (insertError) {
        console.error("Error unlocking achievement:", insertError);
        return { success: false, message: "Failed to unlock achievement" };
    }

    return { success: true, message: "Achievement unlocked" };
}

/**
 * Get all achievements with unlock status for a user
 */
export async function getUserAchievementsWithStatus(
    userId: string,
): Promise<Array<Achievement & { unlocked: boolean; unlockedAt?: string }>> {
    const supabase = await createServerClient();

    const { data: allAchievements, error: achievementError } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: true });

    if (achievementError || !allAchievements) {
        return [];
    }

    const { data: unlockedAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", userId);

    const unlockedMap = Object.fromEntries(
        (unlockedAchievements ?? []).map((ua) => [ua.achievement_id, ua.unlocked_at]),
    );

    return allAchievements.map((achievement) => ({
        ...achievement,
        unlocked: achievement.id in unlockedMap,
        unlockedAt: unlockedMap[achievement.id],
    }));
}

/**
 * Check and auto-unlock achievements based on current user stats
 * This should be called after goal/prayer/quran actions
 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
    const supabase = await createServerClient();
    const unlockedAchievements: string[] = [];

    // Get current stats
    const stats = await calculateProfileStats(userId);

    // Check each achievement condition
    const achievementChecks = [
        // First Step: completed first daily goal
        {
            key: "first_goal",
            condition: () => stats.totalGoalsCompleted >= 1,
        },
        // 7 Day Streak
        {
            key: "seven_day_streak",
            condition: () => stats.currentStreak >= 7,
        },
        // 30 Day Streak
        {
            key: "thirty_day_streak",
            condition: () => stats.currentStreak >= 30,
        },
        // Quran Buddy: 5 pages
        {
            key: "quran_buddy",
            condition: () => stats.quranPagesCompleted >= 5,
        },
        // Quran Companion: 50 pages
        {
            key: "quran_companion",
            condition: () => stats.quranPagesCompleted >= 50,
        },
        // Quran Master: 30 Juz
        {
            key: "quran_master",
            condition: () => stats.quranPagesCompleted >= 30,
        },
        // Prayer Seeker: 7 days all prayers
        {
            key: "prayer_seeker",
            condition: async () => {
                const today = new Date().toLocaleDateString("en-CA");
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 6);
                const sevenDaysAgo = startDate.toLocaleDateString("en-CA");

                const { data: prayerGoals } = await supabase
                    .from("daily_goal_settings")
                    .select("id")
                    .eq("user_id", userId)
                    .eq("goal_type", "prayer")
                    .eq("enabled", true);

                if (!prayerGoals || prayerGoals.length < 5) return false;

                const { data: prayerProgress } = await supabase
                    .from("daily_goal_progress")
                    .select("progress_date")
                    .eq("user_id", userId)
                    .in(
                        "goal_id",
                        prayerGoals.map((p) => p.id),
                    )
                    .eq("completed", true)
                    .gte("progress_date", sevenDaysAgo)
                    .lte("progress_date", today);

                // Should have 5 prayers × 7 days = 35 completions minimum
                return (prayerProgress?.length ?? 0) >= 35;
            },
        },
        // Prayer Regular: 30 days all prayers
        {
            key: "prayer_regular",
            condition: async () => {
                const today = new Date().toLocaleDateString("en-CA");
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 29);
                const thirtyDaysAgo = startDate.toLocaleDateString("en-CA");

                const { data: prayerGoals } = await supabase
                    .from("daily_goal_settings")
                    .select("id")
                    .eq("user_id", userId)
                    .eq("goal_type", "prayer")
                    .eq("enabled", true);

                if (!prayerGoals || prayerGoals.length < 5) return false;

                const { data: prayerProgress } = await supabase
                    .from("daily_goal_progress")
                    .select("progress_date")
                    .eq("user_id", userId)
                    .in(
                        "goal_id",
                        prayerGoals.map((p) => p.id),
                    )
                    .eq("completed", true)
                    .gte("progress_date", thirtyDaysAgo)
                    .lte("progress_date", today);

                // Should have 5 prayers × 30 days = 150 completions minimum
                return (prayerProgress?.length ?? 0) >= 150;
            },
        },
        // Milestone Master: 10 goals completed
        {
            key: "milestone_ten_goals",
            condition: () => stats.totalGoalsCompleted >= 10,
        },
        // Goal Achiever: 50 goals completed
        {
            key: "milestone_fifty_goals",
            condition: () => stats.totalGoalsCompleted >= 50,
        },
    ];

    // Check and unlock achievements
    for (const check of achievementChecks) {
        try {
            const conditionMet = await Promise.resolve(check.condition());
            if (conditionMet) {
                const result = await unlockAchievement(userId, check.key);
                if (result.success) {
                    unlockedAchievements.push(check.key);
                }
            }
        } catch (error) {
            console.error(`Error checking achievement ${check.key}:`, error);
        }
    }

    return unlockedAchievements;
}
