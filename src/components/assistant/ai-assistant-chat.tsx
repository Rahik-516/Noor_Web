"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import type { AiAssistantResponse } from "@/lib/types";

export function AiAssistantChat() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<AiAssistantResponse | null>(null);
    const [loading, setLoading] = useState(false);

    async function askAssistant() {
        setLoading(true);
        const response = await fetch("/api/ai-assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });

        const data = (await response.json()) as { data: AiAssistantResponse };
        setResult(data.data);
        setLoading(false);
    }

    return (
        <section className="space-y-4">
            <GlassCard className="p-5">
                <h1 className="text-2xl font-bold">AI ইসলামিক সহকারী</h1>
                <p className="mt-1 text-sm text-slate-300">উদাহরণ: আমি দুশ্চিন্তায় আছি, একটি দোয়া দিন।</p>
                <textarea
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    rows={4}
                    className="mt-4 w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm outline-none"
                    placeholder="আপনার প্রশ্ন লিখুন"
                />
                <Button onClick={askAssistant} className="mt-3" disabled={!query || loading}>
                    {loading ? "উত্তর প্রস্তুত হচ্ছে..." : "জিজ্ঞাসা করুন"}
                </Button>
            </GlassCard>
            {result ? (
                <GlassCard className="space-y-2 p-5">
                    <p className="text-sm text-slate-200"><span className="font-semibold">Arabic:</span> {result.arabicReference}</p>
                    <p className="text-sm"><span className="font-semibold">বাংলা অনুবাদ:</span> {result.bengaliTranslation}</p>
                    <p className="text-sm"><span className="font-semibold">সংক্ষিপ্ত ব্যাখ্যা:</span> {result.shortExplanation}</p>
                </GlassCard>
            ) : null}
        </section>
    );
}
