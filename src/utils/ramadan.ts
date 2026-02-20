import type { CityName } from "@/lib/types";

const ramadanSchedule: Record<CityName, { sehri: string; iftar: string }> = {
    Dhaka: { sehri: "04:51", iftar: "18:14" },
    Chattogram: { sehri: "04:44", iftar: "18:08" },
    Rajshahi: { sehri: "04:56", iftar: "18:19" },
    Khulna: { sehri: "04:54", iftar: "18:17" },
    Sylhet: { sehri: "04:42", iftar: "18:05" },
};

export function getRamadanSchedule(city: CityName) {
    return ramadanSchedule[city];
}

export function getTodayHadithIndex(totalHadiths: number = 30) {
    // Get current date in Bangladesh timezone (UTC+6)
    const now = new Date();
    const bangladeshTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));

    // Calculate days since epoch (Jan 1, 2024)
    const epochStart = new Date('2024-01-01T00:00:00');
    const diffTime = bangladeshTime.getTime() - epochStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Cycle through hadiths 1 to totalHadiths
    return (diffDays % totalHadiths) + 1;
}
