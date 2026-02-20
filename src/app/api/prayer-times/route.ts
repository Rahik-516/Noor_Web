import { NextResponse } from "next/server";
import type { CityName } from "@/lib/types";

const cityMap: Record<CityName, string> = {
    Dhaka: "Dhaka",
    Chattogram: "Chittagong",
    Rajshahi: "Rajshahi",
    Khulna: "Khulna",
    Sylhet: "Sylhet",
};

function normalizeTime(value: string | undefined) {
    if (!value) return "00:00";
    return value.split(" ")[0].trim();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cityParam = (searchParams.get("city") ?? "Dhaka") as CityName;
        const city = cityMap[cityParam] ? cityParam : "Dhaka";

        const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityMap[city])}&country=Bangladesh&method=1`;

        const response = await fetch(url, {
            method: "GET",
            next: { revalidate: 900 },
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Prayer time upstream failed" }, { status: 502 });
        }

        const payload = (await response.json()) as {
            data?: { timings?: Record<string, string> };
        };

        const timings = payload.data?.timings ?? {};
        const sehri = normalizeTime(timings.Imsak || timings.Fajr);
        const iftar = normalizeTime(timings.Maghrib);
        const fajr = normalizeTime(timings.Fajr);
        const dhuhr = normalizeTime(timings.Dhuhr);
        const asr = normalizeTime(timings.Asr);
        const maghrib = normalizeTime(timings.Maghrib);
        const isha = normalizeTime(timings.Isha);

        const responseBody = {
            data: {
                city,
                sehri,
                iftar,
                source: "aladhan.com",
                timings: {
                    Fajr: fajr,
                    Dhuhr: dhuhr,
                    Asr: asr,
                    Maghrib: maghrib,
                    Isha: isha,
                },
            },
        };

        const responseOut = NextResponse.json(responseBody);
        responseOut.headers.set("Cache-Control", "public, s-maxage=900, stale-while-revalidate=300");
        return responseOut;
    } catch {
        return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
    }
}
