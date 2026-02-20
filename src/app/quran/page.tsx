import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuranTracker } from "@/components/quran/quran-tracker";

export default async function QuranPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data } = await supabase
        .from("quran_progress")
        .select("juz_number")
        .eq("user_id", user.id)
        .eq("completed", true);

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">কুরআন সম্পন্ন ট্র্যাকার</h1>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">প্রতিটি পারা ট্র্যাক করুন এবং আপনার অগ্রগতি উদযাপন করুন</p>
            </div>
            <QuranTracker initialCompleted={(data ?? []).map((row) => row.juz_number)} />
        </section>
    );
}
