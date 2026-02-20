"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CityName } from "@/lib/types";
import { getRamadanSchedule } from "@/utils/ramadan";
import { GlassCard } from "@/components/ui/glass-card";

const CITY_STORAGE_KEY = "noor:selected-city";
const CITY_OPTIONS: CityName[] = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet"];

export function RamadanClock() {
    const [city, setCity] = useState<CityName>("Dhaka");
    const [now, setNow] = useState(new Date());
    const [liveSchedule, setLiveSchedule] = useState<{ sehri: string; iftar: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const storedCity = localStorage.getItem(CITY_STORAGE_KEY);
        if (storedCity && CITY_OPTIONS.includes(storedCity as CityName)) {
            setCity(storedCity as CityName);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CITY_STORAGE_KEY, city);
    }, [city]);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchPrayerTimes() {
            try {
                setLoading(true);
                const response = await fetch(`/api/prayer-times?city=${encodeURIComponent(city)}`);
                const payload = (await response.json()) as {
                    data?: { sehri?: string; iftar?: string };
                };

                if (!isMounted) return;

                if (payload.data?.sehri && payload.data?.iftar) {
                    setLiveSchedule({ sehri: payload.data.sehri, iftar: payload.data.iftar });
                    return;
                }

                setLiveSchedule(null);
            } catch {
                if (isMounted) {
                    setLiveSchedule(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void fetchPrayerTimes();

        return () => {
            isMounted = false;
        };
    }, [city]);

    const schedule = liveSchedule ?? getRamadanSchedule(city);
    const [iftarHour, iftarMinute] = schedule.iftar.split(":").map(Number);
    const iftarDate = new Date(now);
    iftarDate.setHours(iftarHour, iftarMinute, 0, 0);

    if (iftarDate < now) {
        iftarDate.setDate(iftarDate.getDate() + 1);
    }

    const countdownMs = iftarDate.getTime() - now.getTime();
    const hours = Math.floor(countdownMs / (1000 * 60 * 60));
    const minutes = Math.floor((countdownMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countdownMs % (1000 * 60)) / 1000);

    return (
        <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">সেহরি ও ইফতার সময়</h3>
                <div className="relative">
                    <select
                        value={city}
                        onChange={(event) => setCity(event.target.value as CityName)}
                        className="appearance-none rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 pr-9 text-sm font-medium text-slate-100 shadow-sm outline-none transition focus:border-moon-100/50 focus:ring-2 focus:ring-moon-100/30"
                    >
                        {CITY_OPTIONS.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-slate-100">
                                {option}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                </div>
            </div>
            <p className="text-sm text-slate-300">সেহরি: {schedule.sehri} AM</p>
            <p className="text-sm text-slate-300">ইফতার: {schedule.iftar} PM</p>
            <p className="mt-1 text-xs text-slate-400">
                {loading ? "লাইভ সময় আপডেট হচ্ছে..." : liveSchedule ? "লাইভ সময়" : "ডিফল্ট সময়"}
            </p>
            <div className="mt-4">
                <p className="text-sm font-medium text-slate-300">ইফতার পর্যন্ত বাকি:</p>
                <p className="mt-2 text-4xl font-black tracking-tight">
                    {mounted
                        ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
                        : "--:--:--"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                    {mounted
                        ? `${hours} ঘণ্টা • ${minutes} মিনিট • ${seconds} সেকেন্ড`
                        : "সময় গণনা হচ্ছে..."}
                </p>
            </div>
        </GlassCard>
    );
}
