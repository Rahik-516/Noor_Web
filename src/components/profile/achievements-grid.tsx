import type { Achievement } from "@/lib/types";
import { GlassCard } from "@/components/ui/glass-card";
import { Lock } from "lucide-react";

interface AchievementsGridProps {
    achievements: Array<Achievement & { unlocked: boolean; unlockedAt?: string }>;
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
    const unlockedAchievements = achievements.filter((a) => a.unlocked);
    const lockedAchievements = achievements.filter((a) => !a.unlocked);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-4 text-2xl font-bold">কৃতিত্ব ({unlockedAchievements.length})</h2>
                {unlockedAchievements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {unlockedAchievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                unlocked={true}
                            />
                        ))}
                    </div>
                ) : (
                    <GlassCard className="p-6 text-center">
                        <p className="text-slate-400">এখনও কোনো কৃতিত্ব অর্জিত হয়নি। শুরু করতে!</p>
                    </GlassCard>
                )}
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-300">
                    আরও কিছু লক করা হয়েছে ({lockedAchievements.length})
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {lockedAchievements.map((achievement) => (
                        <AchievementCard key={achievement.id} achievement={achievement} unlocked={false} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function AchievementCard({
    achievement,
    unlocked,
}: {
    achievement: Achievement;
    unlocked: boolean;
}) {
    const unlockGuide = getAchievementUnlockGuide(achievement);

    return (
        <div
            className={`relative rounded-xl border p-3 transition-all duration-200 sm:p-4 ${unlocked
                ? "glass-card border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10"
                : "border-white/10 bg-white/[0.03]"
                }`}
        >
            {!unlocked && (
                <div className="absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 p-1.5 sm:px-2 sm:py-1">
                    <Lock className="h-3.5 w-3.5 text-slate-300" />
                    <span className="hidden text-[0.6rem] font-medium text-slate-300 sm:inline">লকড</span>
                </div>
            )}

            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2.5 pr-10 sm:pr-12">
                    <p className={`text-2xl sm:text-3xl ${!unlocked ? "opacity-70" : ""}`}>{achievement.emoji}</p>
                    <p className="line-clamp-2 text-xs font-semibold leading-tight sm:text-sm">
                        {achievement.title}
                    </p>
                </div>

                <details className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                    <summary className="cursor-pointer list-none text-[0.68rem] font-medium text-emerald-300 sm:text-xs">
                        {unlocked ? "বিস্তারিত দেখুন" : "কিভাবে সম্পন্ন করবেন"}
                    </summary>
                    <p className="mt-2 text-[0.68rem] leading-relaxed text-slate-300 sm:text-xs">
                        {unlocked ? achievement.description : unlockGuide}
                    </p>
                </details>

                {unlocked && achievement.created_at && (
                    <p className="text-[0.65rem] text-emerald-300/90">অর্জিত হয়েছে</p>
                )}
            </div>
        </div>
    );
}

function getAchievementUnlockGuide(achievement: Achievement) {
    const title = achievement.title.toLowerCase();

    if (achievement.category === "consistency" || title.includes("streak")) {
        return "এই অর্জনটি সম্পন্ন করতে আপনাকে টানা নির্দিষ্ট সংখ্যক দিন দৈনিক লক্ষ্য পূরণ করতে হবে।";
    }

    if (achievement.category === "quran") {
        return "এই অর্জনটি পেতে নিয়মিত কুরআন পড়া এবং নির্ধারিত পৃষ্ঠা/সূরা সম্পন্ন করতে হবে।";
    }

    if (achievement.category === "prayer") {
        return "এই অর্জনের জন্য প্রতিদিন সময়মতো সালাত ট্র্যাক করে ধারাবাহিকভাবে সম্পন্ন করুন।";
    }

    if (achievement.category === "daily_goals") {
        return "এই অর্জনটি আনলক করতে প্রতিদিনের সব লক্ষ্য পূরণ করে অগ্রগতির হার বাড়ান।";
    }

    if (achievement.category === "milestones") {
        return "এই মাইলস্টোন অর্জনের জন্য মোট অগ্রগতির নির্দিষ্ট সীমা পূরণ করতে হবে।";
    }

    return "এই অর্জনটি সম্পন্ন করতে নিয়মিত কার্যক্রম চালিয়ে যান এবং লক্ষ্য পূরণ করুন।";
}
