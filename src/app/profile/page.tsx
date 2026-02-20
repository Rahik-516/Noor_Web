import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, calculateProfileStats, getUserAchievementsWithStatus } from "@/lib/profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { AchievementsGrid } from "@/components/profile/achievements-grid";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export const metadata = {
    title: "আমার প্রোফাইল",
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const [profile, stats, achievements] = await Promise.all([
        getUserProfile(user.id),
        calculateProfileStats(user.id),
        getUserAchievementsWithStatus(user.id),
    ]);

    if (!profile) {
        return (
            <div className="space-y-6 pb-12">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">প্রোফাইল</h1>
                    <p className="text-slate-400">প্রোফাইল লোড করতে পারা যায়নি।</p>
                </div>
            </div>
        );
    }

    return (
        <section className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">আমার প্রোফাইল</h1>
                    <p className="mt-2 text-sm text-slate-300 sm:text-base">
                        আপনার অগ্রগতি এবং অর্জনগুলি দেখুন
                    </p>
                </div>
                <Link href="/profile/edit">
                    <Button variant="secondary" className="gap-2">
                        <Edit className="h-4 w-4" />
                        সম্পাদনা
                    </Button>
                </Link>
            </div>

            <ProfileHeader profile={profile} stats={stats} userEmail={user.email} />

            <div className="grid gap-4 lg:grid-cols-3">
                <GlassCard className="space-y-3 p-6">
                    <h3 className="font-semibold">দৈনিক লক্ষ্য অগ্রগতি</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">আজকের সম্পন্নতা</span>
                            <span className="text-lg font-bold">{stats.goalCompletionPercentageToday}%</span>
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

            <AchievementsGrid achievements={achievements} />
        </section>
    );
}
