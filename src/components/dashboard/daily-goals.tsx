"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import type { DailyGoalProgress, DailyGoalSetting } from "@/lib/types";

const DEFAULT_GOALS: Array<Omit<DailyGoalSetting, "id">> = [
    { title: "ফজর সালাত", goal_type: "prayer", target_value: 1, unit: "ওয়াক্ত", enabled: true, is_custom: false },
    { title: "যোহর সালাত", goal_type: "prayer", target_value: 1, unit: "ওয়াক্ত", enabled: true, is_custom: false },
    { title: "আসর সালাত", goal_type: "prayer", target_value: 1, unit: "ওয়াক্ত", enabled: true, is_custom: false },
    { title: "মাগরিব সালাত", goal_type: "prayer", target_value: 1, unit: "ওয়াক্ত", enabled: true, is_custom: false },
    { title: "ইশা সালাত", goal_type: "prayer", target_value: 1, unit: "ওয়াক্ত", enabled: true, is_custom: false },
    { title: "কুরআন তিলাওয়াত", goal_type: "quran", target_value: 5, unit: "পৃষ্ঠা", enabled: true, is_custom: false },
    { title: "যিকির", goal_type: "dhikr", target_value: 15, unit: "মিনিট", enabled: true, is_custom: false },
];

const DEFAULT_GOALS_LIST: Array<Omit<DailyGoalSetting, "id">> = Array.isArray(DEFAULT_GOALS) ? DEFAULT_GOALS : [];

const PRAYER_ORDER = ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"];
const CITY_STORAGE_KEY = "noor:selected-city";
const GOALS_STORAGE_KEY = "noor:daily-goals";
const GOALS_PROGRESS_KEY = "noor:daily-goals-progress";
const GOAL_PREFS_KEY = "noor:goal-notification-prefs";
const GOAL_NOTIFY_KEY = "noor:goal-notify-state";

function getLocalDate() {
    return new Date().toLocaleDateString("en-CA");
}

function parseTimeToMinutes(value: string | null | undefined) {
    // The prayer API can return malformed values; avoid render-time crashes.
    if (typeof value !== "string") return 0;
    const dividerIndex = value.indexOf(":");
    if (dividerIndex < 0) return 0;
    const hours = Number(value.slice(0, dividerIndex));
    const minutes = Number(value.slice(dividerIndex + 1));
    return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function safeParseJson<T>(value: string | null, fallback: T): T {
    if (!value) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

export function DailyGoals() {
    const [settings, setSettings] = useState<DailyGoalSetting[]>([]);
    const [progress, setProgress] = useState<DailyGoalProgress[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [customTarget, setCustomTarget] = useState(10);
    const [customUnit, setCustomUnit] = useState("বার");
    const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string } | null>(null);
    const [notificationPrefs, setNotificationPrefs] = useState({ prayer: true, goals: true, quran: true });

    const [today, setToday] = useState<string | null>(null);

    useEffect(() => {
        // Hydration-safe date initialization for App Router.
        setToday(getLocalDate());
    }, []);

    useEffect(() => {
        const storedPrefs = safeParseJson<{ prayer?: boolean; goals?: boolean; quran?: boolean } | null>(
            localStorage.getItem(GOAL_PREFS_KEY),
            null,
        );
        if (storedPrefs) {
            setNotificationPrefs({
                prayer: storedPrefs.prayer ?? true,
                goals: storedPrefs.goals ?? true,
                quran: storedPrefs.quran ?? true,
            });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(GOAL_PREFS_KEY, JSON.stringify(notificationPrefs));
    }, [notificationPrefs]);

    useEffect(() => {
        if (!today) return;

        async function loadGoals() {
            try {
                const response = await fetch(`/api/goals?date=${today}`);
                if (!response.ok) throw new Error("Failed to load goals");
                const payload = (await response.json()) as {
                    settings?: DailyGoalSetting[];
                    progress?: DailyGoalProgress[];
                };
                const payloadSettings = Array.isArray(payload.settings) ? payload.settings : [];
                const payloadProgress = Array.isArray(payload.progress) ? payload.progress : [];

                if (!payloadSettings.length) {
                    const seeded = DEFAULT_GOALS_LIST.map((goal) => ({
                        ...goal,
                        id: `seed-${goal.title}`,
                    }));
                    setSettings(seeded);
                    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(seeded));

                    await Promise.all(
                        DEFAULT_GOALS_LIST.map((goal) =>
                            fetch("/api/goals", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    title: goal.title,
                                    goalType: goal.goal_type,
                                    targetValue: goal.target_value,
                                    unit: goal.unit,
                                    enabled: goal.enabled,
                                    isCustom: goal.is_custom,
                                }),
                            }),
                        ),
                    );
                } else {
                    setSettings(payloadSettings);
                    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(payloadSettings));
                }

                setProgress(payloadProgress);
                localStorage.setItem(GOALS_PROGRESS_KEY, JSON.stringify({ date: today, progress: payloadProgress }));
            } catch {
                const storedSettings = localStorage.getItem(GOALS_STORAGE_KEY);
                const storedProgress = localStorage.getItem(GOALS_PROGRESS_KEY);

                if (storedSettings) {
                    const parsedSettings = safeParseJson<DailyGoalSetting[] | null>(storedSettings, null);
                    if (Array.isArray(parsedSettings) && parsedSettings.length) {
                        setSettings(parsedSettings);
                    } else {
                        setSettings(
                            DEFAULT_GOALS_LIST.map((goal) => ({
                                ...goal,
                                id: `local-${goal.title}`,
                            })),
                        );
                    }
                } else {
                    setSettings(
                        DEFAULT_GOALS_LIST.map((goal) => ({
                            ...goal,
                            id: `local-${goal.title}`,
                        })),
                    );
                }

                if (storedProgress) {
                    const parsed = safeParseJson<{ date?: string; progress?: DailyGoalProgress[] } | null>(
                        storedProgress,
                        null,
                    );
                    const progressData = parsed?.progress;
                    setProgress(parsed?.date === today && Array.isArray(progressData) ? progressData : []);
                } else {
                    setProgress([]);
                }
            } finally {
                // Avoid render-time crashes by only rendering goal lists after data is resolved.
                setIsReady(true);
            }
        }

        void loadGoals();
    }, [today]);

    useEffect(() => {
        async function loadPrayerTimes() {
            const city = localStorage.getItem(CITY_STORAGE_KEY) ?? "Dhaka";
            const response = await fetch(`/api/prayer-times?city=${encodeURIComponent(city)}`);
            if (!response.ok) return;
            const payload = (await response.json()) as { data?: { timings?: Record<string, string> } };
            const timings = payload.data?.timings;
            if (!timings) return;
            setPrayerTimes({
                Fajr: timings.Fajr ?? "00:00",
                Dhuhr: timings.Dhuhr ?? "00:00",
                Asr: timings.Asr ?? "00:00",
                Maghrib: timings.Maghrib ?? "00:00",
                Isha: timings.Isha ?? "00:00",
            });
        }

        void loadPrayerTimes();
    }, []);

    const currentPrayerIndex = useMemo(() => {
        if (!prayerTimes) return -1;
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        const prayerMinutes = [
            parseTimeToMinutes(prayerTimes.Fajr),
            parseTimeToMinutes(prayerTimes.Dhuhr),
            parseTimeToMinutes(prayerTimes.Asr),
            parseTimeToMinutes(prayerTimes.Maghrib),
            parseTimeToMinutes(prayerTimes.Isha),
        ];

        for (let i = prayerMinutes.length - 1; i >= 0; i -= 1) {
            if (minutes >= prayerMinutes[i]) return i;
        }

        // Before Fajr, keep Isha as active from previous day
        return 4;
    }, [prayerTimes]);

    const mergedGoals = useMemo(() => {
        const safeSettings = Array.isArray(settings) ? settings : [];
        const safeProgress = Array.isArray(progress) ? progress : [];

        return safeSettings.map((goal) => {
            const progressRow = safeProgress.find((item) => item.goal_id === goal.id);
            const completedValue = progressRow?.completed_value ?? 0;
            const completed = progressRow?.completed ?? false;

            const isPrayer = goal.goal_type === "prayer";
            const prayerIndex = PRAYER_ORDER.findIndex((name) => goal.title.includes(name));
            const isFuturePrayer = isPrayer && currentPrayerIndex !== -1 && prayerIndex > currentPrayerIndex;
            const isActivePrayer = isPrayer && prayerIndex === currentPrayerIndex;

            return {
                ...goal,
                completedValue,
                completed,
                isFuturePrayer,
                isActivePrayer,
            };
        });
    }, [settings, progress, currentPrayerIndex]);

    useEffect(() => {
        if (!("Notification" in window)) return;

        const requestPermission = async () => {
            if (Notification.permission === "default") {
                await Notification.requestPermission();
            }
        };

        void requestPermission();
    }, []);

    useEffect(() => {
        if (!prayerTimes) return;
        if (!("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        const notifyState = safeParseJson<Record<string, string>>(localStorage.getItem(GOAL_NOTIFY_KEY), {});

        const notifyOnce = (key: string, title: string, body: string) => {
            const last = notifyState[key];
            const nowKey = new Date().toLocaleString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false });
            if (last === nowKey) return;
            notifyState[key] = nowKey;
            localStorage.setItem(GOAL_NOTIFY_KEY, JSON.stringify(notifyState));
            new Notification(title, { body });
        };

        const interval = setInterval(() => {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            const prayerEntries = [
                { key: "Fajr", label: "ফজর", time: parseTimeToMinutes(prayerTimes.Fajr) },
                { key: "Dhuhr", label: "যোহর", time: parseTimeToMinutes(prayerTimes.Dhuhr) },
                { key: "Asr", label: "আসর", time: parseTimeToMinutes(prayerTimes.Asr) },
                { key: "Maghrib", label: "মাগরিব", time: parseTimeToMinutes(prayerTimes.Maghrib) },
                { key: "Isha", label: "ইশা", time: parseTimeToMinutes(prayerTimes.Isha) },
            ];

            if (notificationPrefs.prayer) {
                prayerEntries.forEach((prayer) => {
                    if (prayer.time - minutes === 10) {
                        notifyOnce(`prayer-${prayer.key}`, "নামাজের সময়", `${prayer.label} নামাজ ১০ মিনিট পর।`);
                    }
                });
            }

            if (notificationPrefs.goals) {
                const incomplete = mergedGoals.filter((goal) => goal.enabled && !goal.completed);
                if (incomplete.length && now.getHours() === 20 && now.getMinutes() === 0) {
                    notifyOnce("goals-evening", "আজকের লক্ষ্য", "কিছু লক্ষ্য এখনও অসম্পূর্ণ আছে।");
                }
            }

            if (notificationPrefs.quran && now.getHours() === 16 && now.getMinutes() === 0) {
                notifyOnce("quran-afternoon", "কুরআন রিমাইন্ডার", "আজকের কুরআন তিলাওয়াত সম্পন্ন করেছেন?");
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [prayerTimes, notificationPrefs, mergedGoals]);

    const canRenderGoals = isReady && Boolean(today);

    if (!canRenderGoals) {
        return (
            <GlassCard className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold sm:text-lg">আজকের লক্ষ্য</h3>
                    <span className="text-xs text-slate-400">{today ?? ""}</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
                    লক্ষ্য লোড হচ্ছে...
                </div>
            </GlassCard>
        );
    }

    async function persistProgress(goalId: string, completedValue: number, completed: boolean) {
        if (!today) return;
        await fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goalId, date: today, completedValue, completed }),
        });
    }

    async function updateProgress(goalId: string, target: number, value: number) {
        const completedValue = Math.min(value, target);
        const completed = completedValue >= target;
        setProgress((prev) => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const next = safePrev.filter((item) => item.goal_id !== goalId);
            const updated = [...next, { goal_id: goalId, progress_date: today ?? "", completed_value: completedValue, completed }];
            if (today) {
                localStorage.setItem(GOALS_PROGRESS_KEY, JSON.stringify({ date: today, progress: updated }));
            }
            return updated;
        });

        void persistProgress(goalId, completedValue, completed);
    }

    async function persistSetting(setting: DailyGoalSetting) {
        await fetch("/api/goals", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: setting.id,
                title: setting.title,
                goalType: setting.goal_type,
                targetValue: setting.target_value,
                unit: setting.unit,
                enabled: setting.enabled,
                isCustom: setting.is_custom,
            }),
        });
    }

    async function updateSetting(setting: DailyGoalSetting) {
        setSettings((prev) => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const updated = safePrev.map((goal) => (goal.id === setting.id ? setting : goal));
            localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });

        void persistSetting(setting);
    }

    async function addCustomGoal() {
        const title = customTitle.trim();
        if (!title) return;

        const targetValue = Math.max(1, Number(customTarget));
        const unit = customUnit.trim() || "বার";

        const newGoal: DailyGoalSetting = {
            id: `local-${title}`,
            title,
            goal_type: "custom",
            target_value: targetValue,
            unit,
            enabled: true,
            is_custom: true,
        };

        setSettings((prev) => [...prev, newGoal]);
        setCustomTitle("");

        await fetch("/api/goals", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newGoal.title,
                goalType: newGoal.goal_type,
                targetValue: newGoal.target_value,
                unit: newGoal.unit,
                enabled: newGoal.enabled,
                isCustom: true,
            }),
        });
    }

    const activeGoals = mergedGoals.filter((goal) => goal.enabled);

    return (
        <GlassCard className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold sm:text-lg">আজকের লক্ষ্য</h3>
                <span className="text-xs text-slate-400">{today ?? ""}</span>
            </div>

            <div className="space-y-3">
                {activeGoals.map((goal) => (
                    <div
                        key={goal.id}
                        className={`flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm transition sm:p-3.5 ${goal.isActivePrayer ? "border-emerald-400/40 bg-emerald-400/10" : ""
                            }`}
                    >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <label className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <input
                                    type="checkbox"
                                    checked={goal.completed}
                                    disabled={goal.isFuturePrayer}
                                    onChange={(event) =>
                                        updateProgress(goal.id, goal.target_value, event.target.checked ? goal.target_value : 0)
                                    }
                                    className="h-5 w-5 shrink-0 self-center cursor-pointer rounded border-0 bg-white/20 accent-blue-500"
                                />
                                <span className={`min-w-0 break-words leading-relaxed ${goal.completed ? "line-through text-slate-400" : ""}`}>{goal.title}</span>
                            </label>
                            <div className="flex items-center gap-2 pl-7 sm:pl-0">
                                <input
                                    type="number"
                                    min={0}
                                    max={goal.target_value}
                                    value={goal.completedValue}
                                    onChange={(event) =>
                                        updateProgress(goal.id, goal.target_value, Number(event.target.value))
                                    }
                                    disabled={goal.isFuturePrayer}
                                    className="h-9 w-20 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-right text-sm sm:h-8"
                                />
                                <span className="whitespace-nowrap text-xs text-slate-400">/ {goal.target_value} {goal.unit}</span>
                            </div>
                        </div>
                        {goal.isFuturePrayer ? (
                            <p className="text-xs text-amber-200">ওয়াক্ত শুরু হয়নি</p>
                        ) : null}
                    </div>
                ))}
            </div>

            <div className="mt-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">লক্ষ্য কাস্টমাইজ করুন</h4>
                <div className="space-y-2">
                    {(Array.isArray(settings) ? settings : []).map((goal) => (
                        <div key={goal.id} className="flex flex-col gap-2 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <label className="flex min-w-0 items-start gap-2 sm:items-center">
                                <input
                                    type="checkbox"
                                    checked={goal.enabled}
                                    onChange={(event) =>
                                        updateSetting({ ...goal, enabled: event.target.checked })
                                    }
                                    className="h-4 w-4 rounded border-0 bg-white/20 accent-emerald-400"
                                />
                                <span className="break-words leading-relaxed">{goal.title}</span>
                            </label>
                            <div className="flex items-center gap-2 pl-6 sm:pl-0">
                                <input
                                    type="number"
                                    min={1}
                                    value={goal.target_value}
                                    onChange={(event) =>
                                        updateSetting({ ...goal, target_value: Number(event.target.value) || 1 })
                                    }
                                    className="h-8 w-16 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-right"
                                />
                                <span>{goal.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">নতুন লক্ষ্য যোগ করুন</p>
                    <input
                        value={customTitle}
                        onChange={(event) => setCustomTitle(event.target.value)}
                        placeholder="উদাহরণ: ইস্তেগফার"
                        className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            type="number"
                            min={1}
                            value={customTarget}
                            onChange={(event) => setCustomTarget(Number(event.target.value))}
                            className="h-10 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm sm:w-24"
                        />
                        <input
                            value={customUnit}
                            onChange={(event) => setCustomUnit(event.target.value)}
                            placeholder="বার/মিনিট"
                            className="h-10 flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm"
                        />
                        <button
                            type="button"
                            onClick={addCustomGoal}
                            className="h-10 rounded-lg bg-emerald-500/80 px-3 py-2 text-sm font-semibold text-white sm:px-4"
                        >
                            যোগ করুন
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-slate-200">রিমাইন্ডার</h4>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                        type="checkbox"
                        checked={notificationPrefs.prayer}
                        onChange={(event) => setNotificationPrefs((prev) => ({ ...prev, prayer: event.target.checked }))}
                        className="h-4 w-4 rounded border-0 bg-white/20 accent-emerald-400"
                    />
                    নামাজের সময় নোটিফিকেশন
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                        type="checkbox"
                        checked={notificationPrefs.goals}
                        onChange={(event) => setNotificationPrefs((prev) => ({ ...prev, goals: event.target.checked }))}
                        className="h-4 w-4 rounded border-0 bg-white/20 accent-emerald-400"
                    />
                    অসম্পূর্ণ লক্ষ্য মনে করিয়ে দিন
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                        type="checkbox"
                        checked={notificationPrefs.quran}
                        onChange={(event) => setNotificationPrefs((prev) => ({ ...prev, quran: event.target.checked }))}
                        className="h-4 w-4 rounded border-0 bg-white/20 accent-emerald-400"
                    />
                    কুরআন রিমাইন্ডার
                </label>
            </div>
        </GlassCard>
    );
}
