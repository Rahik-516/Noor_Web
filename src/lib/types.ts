export type CityName = "Dhaka" | "Chattogram" | "Rajshahi" | "Khulna" | "Sylhet";

export interface QuranProgressRow {
    id: string;
    user_id: string;
    juz_number: number;
    completed: boolean;
    date_completed: string | null;
}

export interface HadithRow {
    id: string;
    arabic_text: string;
    bengali_text: string;
    source: string;
    day_index: number;
}

export interface DailyGoalRow {
    id: string;
    user_id: string;
    goal_text: string;
    completed: boolean;
}

export interface DailyGoalSetting {
    id: string;
    title: string;
    goal_type: string;
    target_value: number;
    unit: string;
    enabled: boolean;
    is_custom: boolean;
}

export interface DailyGoalProgress {
    goal_id: string;
    progress_date: string;
    completed_value: number;
    completed: boolean;
}

export interface QuranTrackingState {
    mode: "pages" | "surah" | "daily" | "juz";
    payload: Record<string, unknown>;
}

export interface AiAssistantResponse {
    arabicReference: string;
    bengaliTranslation: string;
    shortExplanation: string;
}

export interface RecipeResponse {
    ingredients: string[];
    steps: string[];
    caloriesApprox: string;
    healthTip: string;
}

// ==============================
// PROFILE & ACHIEVEMENTS
// ==============================

export interface UserProfile {
    id: string;
    full_name: string | null;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_profile_public: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface Achievement {
    id: string;
    achievement_key: string;
    title: string;
    description: string;
    emoji: string;
    category: "daily_goals" | "prayer" | "quran" | "consistency" | "milestones";
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    created_at: string;
}

export interface AchievementWithStatus extends Achievement {
    unlocked: boolean;
    unlockedAt?: string;
}

export interface ProfileStats {
    totalGoalsCompleted: number;
    goalCompletionPercentageToday: number;
    quranPagesCompleted: number;
    quranSurahsCompleted: number;
    currentStreak: number;
    totalPrayersCompleted: number;
    profileCompleteness: number; // 0-100%
}
