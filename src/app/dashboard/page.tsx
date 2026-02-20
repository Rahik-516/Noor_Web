import { redirect } from "next/navigation";
import { RamadanClock } from "@/components/dashboard/ramadan-clock";
import { HadithCard } from "@/components/dashboard/hadith-card";
import { DailyGoals } from "@/components/dashboard/daily-goals";
import { ProgressRing } from "@/components/ui/progress-ring";
import { GlassCard } from "@/components/ui/glass-card";
import { createClient } from "@/lib/supabase/server";
import { calculateQuranProgress } from "@/lib/utils";
import { getTodayHadithIndex } from "@/utils/ramadan";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const todayIndex = getTodayHadithIndex(30);

    const [{ data: quranRows }, { data: hadith }, { data: streak }] =
        await Promise.all([
            supabase
                .from("quran_progress")
                .select("completed")
                .eq("user_id", user.id)
                .eq("completed", true),
            supabase
                .from("hadiths")
                .select("day_index,arabic_text,bengali_text,source")
                .eq("day_index", todayIndex)
                .maybeSingle(),
            supabase.from("user_streaks").select("streak_count").eq("user_id", user.id).maybeSingle(),
        ]);

    const completedJuz = quranRows?.length ?? 0;
    const progress = calculateQuranProgress(completedJuz);

    return (
        <section className="space-y-6 pb-12">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">রমাদান ড্যাশবোর্ড</h1>
                <p className="text-sm text-slate-300 sm:text-base">আসসালামু আলাইকুম, আপনার আজকের অগ্রগতি দেখুন।</p>
            </div>
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
                <RamadanClock />
                <GlassCard className="flex flex-col items-center justify-center p-5 sm:p-6">
                    <ProgressRing progress={progress} label="৩০ পারা ট্র্যাকার" />
                    <p className="mt-3 text-sm text-slate-300">সম্পন্ন: {completedJuz}/30</p>
                </GlassCard>
                <GlassCard className="p-5 sm:p-6">
                    <h3 className="text-base font-semibold sm:text-lg">রমাদান স্ট্রিক</h3>
                    <p className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{streak?.streak_count ?? 0}</p>
                    <p className="mt-2 text-sm text-slate-300">ধারাবাহিক ইবাদত বজায় রাখুন</p>
                </GlassCard>
            </div>
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                <HadithCard
                    arabic={hadith?.arabic_text ?? "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ"}
                    bengali={hadith?.bengali_text ?? "নিশ্চয়ই কাজের ফলাফল নিয়তের উপর নির্ভরশীল।"}
                    source={hadith?.source ?? "সহিহ বুখারি"} dayIndex={hadith?.day_index ?? todayIndex} />
                <DailyGoals />
            </div>
        </section>
    );
}
