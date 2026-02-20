"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

const defaultCenter = { lat: 23.8103, lng: 90.4125 };

interface Masjid {
    id: string;
    name: string;
    distance_km: number;
}

export function CommunityMap() {
    const [form, setForm] = useState({ title: "", lat: "", lng: "" });
    const [masjids, setMasjids] = useState<Masjid[]>([]);
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    useEffect(() => {
        void (async () => {
            const response = await fetch("/api/masjids");
            const data = (await response.json()) as { data: Masjid[] };
            setMasjids(data.data ?? []);
        })();
    }, []);

    async function submitIftarLocation() {
        await fetch("/api/iftar-locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: form.title,
                lat: Number(form.lat),
                lng: Number(form.lng),
            }),
        });

        setForm({ title: "", lat: "", lng: "" });
    }

    return (
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <GlassCard className="min-h-[500px] overflow-hidden p-0">
                {mapboxToken ? (
                    <iframe
                        title="নূর Map"
                        width="100%"
                        height="500"
                        className="border-0"
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?title=false&zoomwheel=true#12/${defaultCenter.lat}/${defaultCenter.lng}?access_token=${mapboxToken}`}
                    />
                ) : (
                    <div className="flex h-[500px] items-center justify-center text-sm text-slate-300">
                        ম্যাপ দেখতে NEXT_PUBLIC_MAPBOX_TOKEN দিন।
                    </div>
                )}
            </GlassCard>
            <GlassCard className="space-y-3 p-5">
                <h1 className="text-xl font-semibold">ইফতার লোকেশন সাবমিট</h1>
                <input
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                    placeholder="লোকেশনের নাম"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <input
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                    placeholder="Latitude"
                    value={form.lat}
                    onChange={(event) => setForm((prev) => ({ ...prev, lat: event.target.value }))}
                />
                <input
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                    placeholder="Longitude"
                    value={form.lng}
                    onChange={(event) => setForm((prev) => ({ ...prev, lng: event.target.value }))}
                />
                <Button onClick={submitIftarLocation}>কমিউনিটিতে পাঠান</Button>
                <p className="text-xs text-slate-300">নতুন লোকেশন admin approval না হওয়া পর্যন্ত পাবলিক ম্যাপে দেখাবে না।</p>
                <div className="mt-2 space-y-2">
                    <p className="text-sm font-semibold">Nearby Masjids</p>
                    {masjids.map((masjid) => (
                        <div key={masjid.id} className="rounded-lg bg-white/5 p-2 text-sm">
                            <p>{masjid.name}</p>
                            <p className="text-xs text-slate-300">{masjid.distance_km.toFixed(1)} কিমি</p>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </section>
    );
}
