"use client";

import { UserCircle } from "lucide-react";
import type { UserProfile, ProfileStats, Achievement } from "@/lib/types";
import { GlassCard } from "@/components/ui/glass-card";

interface ProfileHeaderProps {
    profile: UserProfile;
    stats: ProfileStats;
    userEmail?: string;
}

function getDisplayName(profile: UserProfile, userEmail?: string) {
    const normalizedName = profile.full_name?.trim();
    const isDefaultName = !normalizedName || normalizedName.toLowerCase() === "user";

    if (!isDefaultName) {
        return normalizedName;
    }

    if (userEmail?.trim()) {
        return userEmail;
    }

    if (profile.username?.trim()) {
        return `@${profile.username.trim()}`;
    }

    return "ব্যবহারকারী";
}

export function ProfileHeader({ profile, stats, userEmail }: ProfileHeaderProps) {
    const joinDate = new Date(profile.created_at).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const displayName = getDisplayName(profile, userEmail);

    return (
        <GlassCard className="space-y-4 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    {profile.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || "Profile"}
                            className="h-20 w-20 rounded-full border-2 border-white/20 object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-white/5">
                            <UserCircle className="h-12 w-12 text-slate-400" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">{displayName}</h1>
                        {profile.username && (
                            <p className="text-sm text-slate-400">@{profile.username}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">সদস্য হয়েছেন {joinDate}</p>
                    </div>
                </div>

                <div className="rounded-lg bg-white/5 px-3 py-1 text-right">
                    <p className="text-xs text-slate-400">প্রোফাইল সম্পূর্ণ</p>
                    <p className="text-lg font-bold">{stats.profileCompleteness}%</p>
                </div>
            </div>

            {profile.bio && (
                <div>
                    <p className="text-sm text-slate-300">{profile.bio}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3 sm:gap-4">
                <StatBox label="মোট লক্ষ্য" value={stats.totalGoalsCompleted} />
                <StatBox label="বর্তমান স্ট্রিক" value={stats.currentStreak} />
                <StatBox label="কোরআন পৃষ্ঠা" value={stats.quranPagesCompleted} />
                <StatBox label="প্রার্থনা সম্পন্ন" value={stats.totalPrayersCompleted} />
                <StatBox label="আজকের অগ্রগতি" value={`${stats.goalCompletionPercentageToday}%`} />
            </div>
        </GlassCard>
    );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="space-y-1 rounded-lg bg-white/5 p-3 text-center">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-xl font-bold sm:text-2xl">{value}</p>
        </div>
    );
}
