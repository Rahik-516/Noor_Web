import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { AchievementsGrid } from "@/components/profile/achievements-grid";
import { GlassCard } from "@/components/ui/glass-card";
import type { UserProfile, ProfileStats, Achievement } from "@/lib/types";

interface PageProps {
    params: Promise<{
        userId: string;
    }>;
}

interface PublicProfileData {
    profile: UserProfile;
    stats: ProfileStats;
    achievements: Array<Achievement & { unlocked: boolean; unlockedAt?: string }>;
}

export const metadata = {
    title: "ব্যবহারকারী প্রোফাইল",
};

async function getPublicProfile(userId: string): Promise<PublicProfileData | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/users/${userId}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching public profile:", error);
        return null;
    }
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { userId } = await params;
    const data = await getPublicProfile(userId);

    if (!data) {
        notFound();
    }

    const { profile, stats, achievements } = data;

    return (
        <section className="space-y-6 pb-12">
            <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">ব্যবহারকারী প্রোফাইল</h1>
            </div>

            <ProfileHeader profile={profile} stats={stats} />

            <div className="grid gap-4 lg:grid-cols-3">
                <GlassCard className="space-y-3 p-6">
                    <h3 className="font-semibold">দৈনিক লক্ষ্য অগ্রগতি</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">আজকের সম্পন্নতা</span>
                            <span className="text-lg font-bold">
                                {stats.goalCompletionPercentageToday}%
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300"
                                style={{ width: `${stats.goalCompletionPercentageToday}%` }}
                            />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="space-y-3 p-6">
                    <h3 className="font-semibold">কোরআন অগ্রগতি</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">পৃষ্ঠা সম্পন্ন</span>
                            <span className="text-lg font-bold">{stats.quranPagesCompleted}</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            {Math.round((stats.quranPagesCompleted / 30) * 100)}% সম্পূর্ণ
                        </p>
                    </div>
                </GlassCard>

                <GlassCard className="space-y-3 p-6">
                    <h3 className="font-semibold">সর্বোচ্চ স্ট্রিক</h3>
                    <div>
                        <p className="text-3xl font-black tracking-tight">{stats.currentStreak}</p>
                        <p className="mt-1 text-xs text-slate-400">দিন চলছে</p>
                    </div>
                </GlassCard>
            </div>

            {achievements.length > 0 && (
                <div>
                    <h2 className="mb-4 text-2xl font-bold">কৃতিত্ব ({achievements.length})</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="rounded-lg border border-white/10 bg-white/5 p-4 text-center transition duration-200 hover:border-white/20 hover:bg-white/[0.06]"
                            >
                                <p className="text-3xl sm:text-4xl">{achievement.emoji}</p>
                                <p className="mt-2 text-xs font-semibold leading-tight sm:text-sm">
                                    {achievement.title}
                                </p>
                                <p className="mt-1 text-[0.7rem] text-slate-400 sm:text-xs">
                                    {achievement.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
