import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";

export const runtime = "edge";

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function getFallbackText() {
    return {
        arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        bengali: "নিশ্চয়ই কাজের ফলাফল নিয়তের উপর নির্ভরশীল।",
        source: "সহিহ বুখারি",
    };
}

function sanitizeArabicText(text: string) {
    return ARABIC_REGEX.test(text) ? "" : text;
}

function buildImage({ arabic, bengali, source }: { arabic: string; bengali: string; source: string }) {
    const showArabic = Boolean(arabic?.trim());

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                    padding: "64px",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "32px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "28px",
                        }}
                    >
                        📖
                    </div>
                    <div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff" }}>নূর</div>
                        <div style={{ fontSize: "18px", color: "#94a3b8" }}>দৈনিক হাদিস</div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px", flex: 1 }}>
                    {showArabic ? (
                        <div
                            style={{
                                fontSize: "42px",
                                lineHeight: 1.6,
                                color: "#fbbf24",
                                textAlign: "right",
                                direction: "rtl",
                                fontWeight: "500",
                            }}
                        >
                            {arabic}
                        </div>
                    ) : (
                        <div style={{ fontSize: "24px", color: "#94a3b8" }}>
                            আরবি টেক্সট অনুপলব্ধ
                        </div>
                    )}

                    <div
                        style={{
                            height: "2px",
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                            margin: "16px 0",
                        }}
                    />

                    <div
                        style={{
                            fontSize: "32px",
                            lineHeight: 1.7,
                            color: "#e2e8f0",
                            fontWeight: "400",
                        }}
                    >
                        {bengali}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "32px",
                        paddingTop: "24px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    <div style={{ fontSize: "22px", color: "#10b981", fontWeight: "600" }}>
                        সূত্র: {source}
                    </div>
                    <div style={{ fontSize: "18px", color: "#64748b" }}>#নূর</div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 1200,
            headers: {
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
            },
        },
    );
}

function safeBuildImage(payload: { arabic: string; bengali: string; source: string }) {
    try {
        return buildImage(payload);
    } catch (error) {
        if (payload.arabic) {
            return buildImage({ ...payload, arabic: "" });
        }

        throw error;
    }
}

async function loadHadithByDayIndex(dayIndex: number) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !publishableKey) {
        return null;
    }

    const supabase = createClient(supabaseUrl, publishableKey, {
        auth: { persistSession: false },
    });

    const { data } = await supabase
        .from("hadiths")
        .select("arabic_text,bengali_text,source")
        .eq("day_index", dayIndex)
        .maybeSingle();

    if (!data) return null;

    return {
        arabic: data.arabic_text,
        bengali: data.bengali_text,
        source: data.source,
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fallback = getFallbackText();
    const dayIndexRaw = searchParams.get("dayIndex");
    const dayIndex = dayIndexRaw ? Number(dayIndexRaw) : null;

    try {
        if (dayIndex && Number.isFinite(dayIndex)) {
            const hadith = await loadHadithByDayIndex(dayIndex);
            if (hadith) {
                return safeBuildImage({
                    ...hadith,
                    arabic: sanitizeArabicText(hadith.arabic),
                });
            }
        }

        const arabic = sanitizeArabicText(searchParams.get("arabic") ?? fallback.arabic);
        const bengali = searchParams.get("bengali") ?? fallback.bengali;
        const source = searchParams.get("source") ?? fallback.source;

        return safeBuildImage({ arabic, bengali, source });
    } catch (error) {
        return new Response("Failed to generate image", { status: 500 });
    }
}

export async function POST(request: Request) {
    const fallback = getFallbackText();
    const payload = await request.json().catch(() => null);
    const arabic = sanitizeArabicText(payload?.arabic ?? fallback.arabic);
    const bengali = payload?.bengali ?? fallback.bengali;
    const source = payload?.source ?? fallback.source;

    try {
        return safeBuildImage({ arabic, bengali, source });
    } catch (error) {
        return new Response("Failed to generate image", { status: 500 });
    }
}
