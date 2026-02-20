"use client";

import { useEffect, useMemo, useState } from "react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { GlassCard } from "@/components/ui/glass-card";

interface QuranTrackerProps {
    initialCompleted?: number[];
}

type QuranMode = "pages" | "surah" | "daily" | "juz";

const MODES: Array<{ id: QuranMode; label: string }> = [
    { id: "pages", label: "পৃষ্ঠা" },
    { id: "surah", label: "সূরা+আয়াত" },
    { id: "daily", label: "দৈনিক লক্ষ্য" },
    { id: "juz", label: "পারা" },
];

const STORAGE_KEY = "noor:quran-tracking";
const TOTAL_PAGES = 604;

function getLocalDate() {
    return new Date().toLocaleDateString("en-CA");
}

export function QuranTracker({ initialCompleted = [] }: QuranTrackerProps) {
    const [mode, setMode] = useState<QuranMode>("pages");
    const [payload, setPayload] = useState<Record<string, unknown>>({});
    const [completedJuz, setCompletedJuz] = useState<number[]>(initialCompleted);

    const today = getLocalDate();

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as { mode?: QuranMode; payload?: Record<string, unknown> };
            if (parsed.mode) setMode(parsed.mode);
            if (parsed.payload) setPayload(parsed.payload);
        }

        void (async () => {
            try {
                const response = await fetch("/api/quran-tracking");
                if (!response.ok) return;
                const data = (await response.json()) as { mode?: QuranMode; payload?: Record<string, unknown> };
                if (data.mode) setMode(data.mode);
                if (data.payload) setPayload(data.payload);
            } catch {
                // Offline fallback
            }
        })();
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, payload }));
        const timeout = setTimeout(() => {
            fetch("/api/quran-tracking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode, payload }),
            }).catch(() => null);
        }, 600);

        return () => clearTimeout(timeout);
    }, [mode, payload]);

    const pagesState = useMemo(() => {
        const lastDate = String(payload.lastDate ?? today);
        return {
            currentPage: Number(payload.currentPage ?? 1),
            dailyGoal: Number(payload.dailyGoal ?? 5),
            todayPages: lastDate === today ? Number(payload.todayPages ?? 0) : 0,
            lastDate,
        };
    }, [payload, today]);

    const surahState = useMemo(() => {
        return {
            surah: Number(payload.surah ?? 1),
            fromAyah: Number(payload.fromAyah ?? 1),
            toAyah: Number(payload.toAyah ?? 7),
            lastRead: String(payload.lastRead ?? ""),
        };
    }, [payload]);

    const dailyState = useMemo(() => {
        const lastDate = String(payload.dailyLastDate ?? today);
        return {
            dailyGoal: Number(payload.dailyGoalPages ?? 5),
            todayPages: lastDate === today ? Number(payload.dailyPages ?? 0) : 0,
            lastDate,
        };
    }, [payload, today]);

    const pageProgress = Math.min(100, Math.round((pagesState.currentPage / TOTAL_PAGES) * 100));
    const dailyProgress = dailyState.dailyGoal
        ? Math.min(100, Math.round((dailyState.todayPages / dailyState.dailyGoal) * 100))
        : 0;

    function updatePayload(next: Record<string, unknown>) {
        setPayload((prev) => ({ ...prev, ...next }));
    }

    async function toggleJuz(juzNumber: number) {
        const exists = completedJuz.includes(juzNumber);
        const nextCompleted = exists
            ? completedJuz.filter((value) => value !== juzNumber)
            : [...completedJuz, juzNumber];

        setCompletedJuz(nextCompleted);

        await fetch("/api/quran-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ juzNumber, completed: !exists }),
        });
    }

    function renderPages() {
        return (
            <GlassCard className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-semibold">পৃষ্ঠা ট্র্যাকিং</h4>
                        <p className="text-xs text-slate-400">বর্তমান পৃষ্ঠা: {pagesState.currentPage}</p>
                    </div>
                    <ProgressRing progress={pageProgress} label="সম্পন্ন" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm text-slate-300">
                        বর্তমান পৃষ্ঠা
                        <input
                            type="number"
                            min={1}
                            max={TOTAL_PAGES}
                            value={pagesState.currentPage}
                            onChange={(event) => updatePayload({ currentPage: Number(event.target.value) || 1 })}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                        />
                    </label>
                    <label className="text-sm text-slate-300">
                        দৈনিক লক্ষ্য (পৃষ্ঠা)
                        <input
                            type="number"
                            min={1}
                            value={pagesState.dailyGoal}
                            onChange={(event) => updatePayload({ dailyGoal: Number(event.target.value) || 1 })}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                        />
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min={0}
                        value={pagesState.todayPages}
                        onChange={(event) => updatePayload({ todayPages: Number(event.target.value) || 0 })}
                        className="w-32 rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const nextPage = Math.min(TOTAL_PAGES, pagesState.currentPage + pagesState.todayPages);
                            updatePayload({
                                currentPage: nextPage,
                                todayPages: 0,
                                lastDate: today,
                            });
                        }}
                        className="rounded-lg bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white"
                    >
                        আজকের পড়া যোগ করুন
                    </button>
                </div>
            </GlassCard>
        );
    }

    function renderSurah() {
        return (
            <GlassCard className="space-y-4 p-5">
                <h4 className="text-base font-semibold">সূরা ও আয়াত ট্র্যাকিং</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm text-slate-300">
                        সূরা
                        <input
                            type="number"
                            min={1}
                            max={114}
                            value={surahState.surah}
                            onChange={(event) => updatePayload({ surah: Number(event.target.value) || 1 })}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                        />
                    </label>
                    <label className="text-sm text-slate-300">
                        শুরু আয়াত
                        <input
                            type="number"
                            min={1}
                            value={surahState.fromAyah}
                            onChange={(event) => updatePayload({ fromAyah: Number(event.target.value) || 1 })}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                        />
                    </label>
                    <label className="text-sm text-slate-300">
                        শেষ আয়াত
                        <input
                            type="number"
                            min={1}
                            value={surahState.toAyah}
                            onChange={(event) => updatePayload({ toAyah: Number(event.target.value) || 1 })}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                        />
                    </label>
                </div>

                <button
                    type="button"
                    onClick={() => updatePayload({ lastRead: `সূরা ${surahState.surah} : ${surahState.fromAyah}-${surahState.toAyah}` })}
                    className="rounded-lg bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white"
                >
                    আজকের পাঠ সংরক্ষণ করুন
                </button>

                {surahState.lastRead ? (
                    <p className="text-sm text-slate-300">সর্বশেষ: {surahState.lastRead}</p>
                ) : null}
            </GlassCard>
        );
    }

    function renderDaily() {
        return (
            <GlassCard className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-semibold">দৈনিক তিলাওয়াত লক্ষ্য</h4>
                        <p className="text-xs text-slate-400">আজ পড়া হয়েছে {dailyState.todayPages} পৃষ্ঠা</p>
                    </div>
                    <ProgressRing progress={dailyProgress} label="আজকের অগ্রগতি" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm text-slate-300">
                        দৈনিক লক্ষ্য (পৃষ্ঠা)
                        <input
                            type="number"
                            min={1}
                            value={dailyState.dailyGoal}
                            onChange={(event) => updatePayload({ dailyGoalPages: Number(event.target.value) || 1 })}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                        />
                    </label>
                    <label className="text-sm text-slate-300">
                        আজকের পৃষ্ঠা
                        <input
                            type="number"
                            min={0}
                            value={dailyState.todayPages}
                            onChange={(event) => updatePayload({ dailyPages: Number(event.target.value) || 0 })}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2"
                        />
                    </label>
                </div>

                <button
                    type="button"
                    onClick={() => updatePayload({ dailyLastDate: today })}
                    className="rounded-lg bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white"
                >
                    আজকের অগ্রগতি সেভ করুন
                </button>
            </GlassCard>
        );
    }

    function renderJuz() {
        const progress = Math.round((completedJuz.length / 30) * 100);
        return (
            <section className="space-y-4">
                <GlassCard className="flex flex-col items-center p-6">
                    <ProgressRing progress={progress} label="সম্পন্ন" />
                    <p className="mt-3 text-sm text-slate-300">{completedJuz.length} / 30 পারা</p>
                </GlassCard>
                <div className="grid grid-cols-5 gap-2 md:grid-cols-6 lg:grid-cols-10">
                    {Array.from({ length: 30 }, (_, index) => {
                        const juz = index + 1;
                        const isCompleted = completedJuz.includes(juz);

                        return (
                            <button
                                key={juz}
                                onClick={() => toggleJuz(juz)}
                                className={`rounded-lg border px-2 py-3 text-sm transition ${isCompleted
                                        ? "border-emerald-300 bg-emerald-400/30 text-emerald-50"
                                        : "border-white/20 bg-white/5"
                                    }`}
                            >
                                পারা {juz}
                            </button>
                        );
                    })}
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {MODES.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setMode(item.id)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === item.id ? "bg-emerald-500/80 text-white" : "bg-white/10 text-slate-200"
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {mode === "pages" && renderPages()}
            {mode === "surah" && renderSurah()}
            {mode === "daily" && renderDaily()}
            {mode === "juz" && renderJuz()}

            <GlassCard className="p-4 text-sm">
                <p className="font-medium">শেয়ার কার্ড</p>
                <p className="mt-1 text-slate-300">আমি এখন পর্যন্ত {pageProgress}% কুরআন সম্পন্ন করেছি। #নূর</p>
            </GlassCard>
        </section>
    );
}
