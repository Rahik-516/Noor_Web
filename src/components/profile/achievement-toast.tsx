"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";

interface AchievementNotification {
    id: string;
    title: string;
    emoji: string;
}

export function AchievementToast({
    achievement,
    onDismiss,
}: {
    achievement: AchievementNotification;
    onDismiss: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in">
            <div className="glass-card border border-emerald-500/50 bg-emerald-500/10 p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Award className="h-6 w-6 text-emerald-400" />
                        <div className="absolute inset-0 animate-pulse">
                            <Award className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-emerald-300">কৃতিত্ব অর্জিত! 🎉</p>
                        <p className="text-sm text-emerald-200">
                            {achievement.emoji} {achievement.title}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
