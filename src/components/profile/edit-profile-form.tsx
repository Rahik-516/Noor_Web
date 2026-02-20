"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/types";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface EditProfileFormProps {
    profile: UserProfile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(profile.avatar_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        is_profile_public: profile.is_profile_public,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleTogglePublic = () => {
        setFormData((prev) => ({
            ...prev,
            is_profile_public: !prev.is_profile_public,
        }));
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("ছবি ৫ এমবি এর কম হওয়া উচিত");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("শুধুমাত্র ছবির ফাইল গ্রহণযোগ্য");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    avatar_url: previewImage,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "প্রোফাইল আপডেট ব্যর্থ");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/profile");
                router.refresh();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <GlassCard className="p-6">
                <h3 className="mb-4 font-semibold">প্রোফাইল ছবি</h3>

                <div className="space-y-4">
                    {previewImage ? (
                        <div className="relative inline-block">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="h-32 w-32 rounded-full border-2 border-white/20 object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -right-2 -top-2 rounded-full bg-red-500/80 p-1 text-white transition hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-white/5">
                            <Upload className="h-6 w-6 text-slate-400" />
                        </div>
                    )}

                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            ছবি নির্বাচন করুন
                        </Button>
                        <p className="mt-2 text-xs text-slate-400">
                            PNG, JPG, GIF। সর্বোচ্চ ৫ এমবি।
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Profile Info */}
            <GlassCard className="space-y-4 p-6">
                <h3 className="font-semibold">ব্যক্তিগত তথ্য</h3>

                <div>
                    <label className="block text-sm font-medium">পূর্ণ নাম</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        maxLength={100}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="আপনার নাম"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">ব্যবহারকারীর নাম</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        maxLength={50}
                        pattern="[a-zA-Z0-9_-]*"
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="username123"
                    />
                    <p className="mt-1 text-xs text-slate-400">শুধুমাত্র অক্ষর, সংখ্যা, _ এবং -</p>
                </div>

                <div>
                    <label className="block text-sm font-medium">জীবনী</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        maxLength={500}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="আপনার জীবনী সম্পর্কে কিছু বলুন..."
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        {formData.bio.length}/500
                    </p>
                </div>
            </GlassCard>

            {/* Privacy Settings */}
            <GlassCard className="space-y-4 p-6">
                <h3 className="font-semibold">গোপনীয়তা</h3>

                <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-white/10 p-3 transition hover:border-white/20">
                    <input
                        type="checkbox"
                        checked={formData.is_profile_public}
                        onChange={handleTogglePublic}
                        className="h-5 w-5 rounded border-white/20 bg-white/10"
                    />
                    <div>
                        <p className="font-medium">পাবলিক প্রোফাইল</p>
                        <p className="text-xs text-slate-400">
                            অন্য ব্যবহারকারীরা আপনার প্রোফাইল এবং অর্জনগুলি দেখতে পারবে
                        </p>
                    </div>
                </label>
            </GlassCard>

            {/* Messages */}
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-300">প্রোফাইল সফলভাবে আপডেট হয়েছে!</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                >
                    {isLoading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    className="flex-1"
                >
                    বাতিল করুন
                </Button>
            </div>
        </form>
    );
}
