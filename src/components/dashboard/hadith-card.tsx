"use client";

import { useState } from "react";
import { Download, Share2, BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

interface HadithCardProps {
    arabic: string;
    bengali: string;
    source: string;
    dayIndex?: number;
}

export function HadithCard({ arabic, bengali, source, dayIndex }: HadithCardProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const CARD_WIDTH = 1200;
    const CARD_HEIGHT = 1200;

    function wrapText(text: string, maxChars: number, maxLines: number) {
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let current = "";

        for (const word of words) {
            const next = current ? `${current} ${word}` : word;
            if (next.length > maxChars) {
                if (current) {
                    lines.push(current);
                }
                current = word;
            } else {
                current = next;
            }

            if (lines.length >= maxLines) {
                break;
            }
        }

        if (current && lines.length < maxLines) {
            lines.push(current);
        }

        return lines.slice(0, maxLines);
    }

    function escapeXml(text: string) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    function drawCardToCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = CARD_WIDTH;
        canvas.height = CARD_HEIGHT;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Canvas not supported");
        }

        const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(0.5, "#1e293b");
        gradient.addColorStop(1, "#334155");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

        ctx.fillStyle = "#ffffff";
        ctx.font = "700 40px 'Noto Sans Bengali', sans-serif";
        ctx.fillText("নূর", 140, 130);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "400 24px 'Noto Sans Bengali', sans-serif";
        ctx.fillText("দৈনিক হাদিস", 140, 170);

        const safeArabic = arabic?.trim() ? arabic.trim() : "";
        if (safeArabic) {
            const arabicFontSize = safeArabic.length > 90 ? 34 : safeArabic.length > 60 ? 38 : 46;
            ctx.fillStyle = "#fbbf24";
            ctx.font = `${arabicFontSize}px 'Noto Naskh Arabic', serif`;
            ctx.textAlign = "right";
            ctx.direction = "rtl";
            ctx.fillText(safeArabic, 1060, 255);
            ctx.textAlign = "left";
            ctx.direction = "ltr";
        }

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(140, 292);
        ctx.lineTo(1060, 292);
        ctx.stroke();

        const bengaliLines = wrapText(bengali, 34, 7);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "400 34px 'Noto Sans Bengali', sans-serif";
        bengaliLines.forEach((line, index) => {
            ctx.fillText(line, 140, 356 + index * 52);
        });

        ctx.fillStyle = "#10b981";
        ctx.font = "600 26px 'Noto Sans Bengali', sans-serif";
        ctx.fillText(`সূত্র: ${source}`, 140, 1120);

        ctx.fillStyle = "#64748b";
        ctx.font = "400 22px 'Noto Sans Bengali', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("#নূর", 1060, 1120);
        ctx.textAlign = "left";

        return canvas;
    }

    async function canvasToPngBlob(canvas: HTMLCanvasElement) {
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((value) => resolve(value), "image/png"),
        );

        if (!blob) {
            throw new Error("PNG generation failed");
        }

        return blob;
    }

    async function handleDownload() {
        try {
            setIsGenerating(true);
            const canvas = drawCardToCanvas();
            const blob = await canvasToPngBlob(canvas);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hadith-${dayIndex || 'daily'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading hadith image:', error);
            alert('ইমেজ ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleShare() {
        const shareText = `${bengali}\n\n— ${source}\n\n#নূর #হাদিস`;
        try {
            if (navigator.share) {
                const canvas = drawCardToCanvas();
                const blob = await canvasToPngBlob(canvas);
                const file = new File([blob], `hadith-${dayIndex || "daily"}.png`, { type: "image/png" });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "আজকের হাদিস",
                        text: shareText,
                        files: [file],
                    });
                    return;
                }

                await navigator.share({
                    title: "আজকের হাদিস",
                    text: shareText,
                });
                return;
            }

            await navigator.clipboard.writeText(shareText);
            alert("হাদিসটি কপি করা হয়েছে!");
        } catch (error) {
            console.error("Failed to share:", error);
        }
    }

    return (
        <GlassCard className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-semibold sm:text-lg">দৈনিক হাদিস</h3>
                </div>
                {dayIndex && (
                    <span className="text-xs text-slate-400">#{dayIndex}</span>
                )}
            </div>

            <div className="space-y-4">
                <p className="break-words text-right text-[0.95rem] leading-8 text-amber-100/90 sm:text-lg" dir="rtl">
                    {arabic}
                </p>

                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <p className="break-words text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
                    {bengali}
                </p>

                <p className="text-xs font-medium text-emerald-400/80">
                    — {source}
                </p>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                    variant="secondary"
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                    <Download className="h-4 w-4" />
                    {isGenerating ? 'তৈরি হচ্ছে...' : 'PNG ডাউনলোড'}
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleShare}
                    className="flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                    <Share2 className="h-4 w-4" />
                    শেয়ার করুন
                </Button>
            </div>
        </GlassCard>
    );
}
