"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { formatCurrencyBDT } from "@/lib/utils";

export function ZakatCalculator() {
    const [form, setForm] = useState({
        cash: 0,
        gold: 0,
        silver: 0,
        businessAssets: 0,
        liabilities: 0,
    });
    const [isPending, startTransition] = useTransition();

    const totalAssets = useMemo(
        () => form.cash + form.businessAssets + form.gold * 9500 + form.silver * 120,
        [form],
    );
    const net = Math.max(totalAssets - form.liabilities, 0);
    const zakat = net * 0.025;

    function updateValue(key: keyof typeof form, value: string) {
        setForm((prev) => ({ ...prev, [key]: Number(value) || 0 }));
    }

    function saveRecord() {
        startTransition(async () => {
            await fetch("/api/zakat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, zakat }),
            });
        });
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">যাকাত ক্যালকুলেটর</h1>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">আপনার সম্পদ প্রবেশ করুন এবং যাকাত পরিমাণ জানুন</p>
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
                <GlassCard className="space-y-4 p-5 sm:p-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-200">Cash (৳)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm outline-none transition hover:bg-white/15 focus:bg-white/20 focus:ring-1 focus:ring-blue-500/50"
                            onChange={(e) => updateValue("cash", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-200">Gold (grams)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm outline-none transition hover:bg-white/15 focus:bg-white/20 focus:ring-1 focus:ring-blue-500/50"
                            onChange={(e) => updateValue("gold", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-200">Silver (grams)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm outline-none transition hover:bg-white/15 focus:bg-white/20 focus:ring-1 focus:ring-blue-500/50"
                            onChange={(e) => updateValue("silver", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-200">Business assets (৳)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm outline-none transition hover:bg-white/15 focus:bg-white/20 focus:ring-1 focus:ring-blue-500/50"
                            onChange={(e) => updateValue("businessAssets", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-200">Liabilities (৳)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm outline-none transition hover:bg-white/15 focus:bg-white/20 focus:ring-1 focus:ring-blue-500/50"
                            onChange={(e) => updateValue("liabilities", e.target.value)}
                        />
                    </div>
                    <Button onClick={saveRecord} className="w-full">হিসাব সংরক্ষণ করুন</Button>
                </GlassCard>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <GlassCard className="space-y-3 p-5 sm:p-6">
                        <h2 className="text-base font-semibold sm:text-lg">ফলাফল</h2>
                        <div className="space-y-2.5 border-t border-white/10 pt-4">
                            <div>
                                <p className="text-xs text-slate-400">মোট সম্পদ</p>
                                <p className="text-sm font-medium">{formatCurrencyBDT(net)}</p>
                            </div>
                            <div className="rounded-lg bg-white/5 p-3">
                                <p className="text-xs text-slate-400">আপনার যাকাত</p>
                                <p className="mt-1 text-2xl font-black text-emerald-300">{formatCurrencyBDT(zakat)}</p>
                            </div>
                        </div>
                        {isPending ? <p className="text-xs text-slate-400">সংরক্ষণ হচ্ছে...</p> : null}
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
}
