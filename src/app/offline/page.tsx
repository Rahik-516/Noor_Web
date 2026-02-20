import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export default function OfflinePage() {
    return (
        <section className="py-10">
            <GlassCard className="mx-auto max-w-xl p-8 text-center">
                <h1 className="text-2xl font-bold">আপনি অফলাইনে আছেন</h1>
                <p className="mt-2 text-sm text-slate-300">ইন্টারনেট ফিরে এলে আবার চেষ্টা করুন।</p>
                <Link href="/" className="mt-4 inline-block text-sm underline">
                    হোমে ফিরে যান
                </Link>
            </GlassCard>
        </section>
    );
}
