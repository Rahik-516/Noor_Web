"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, UserCircle, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

interface SearchResult {
    id: string;
    full_name: string | null;
    username: string | null;
    email?: string | null;
    avatar_url: string | null;
    is_profile_public: boolean;
}

function getSuggestionDisplayName(user: SearchResult) {
    const normalizedName = user.full_name?.trim();
    const isDefaultName = !normalizedName || normalizedName.toLowerCase() === "user";

    if (!isDefaultName) {
        return normalizedName;
    }

    if (user.email?.trim()) {
        return user.email;
    }

    if (user.username?.trim()) {
        return `@${user.username.trim()}`;
    }

    return "ব্যবহারকারী";
}

export function UserSearchForm() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch suggestions as user types
    useEffect(() => {
        if (query.trim().length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            setError(null);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "সার্চ ব্যর্থ হয়েছে");
                }

                const data = await response.json();
                setSuggestions(data.results ?? []);
                setShowSuggestions(true);

                if (data.results.length === 0) {
                    setError("কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে");
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleClearSearch = () => {
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
    };

    const handleSelectUser = () => {
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-10 text-white placeholder-slate-500 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="নাম, ইউজার বা ইমেইল দিয়ে খুঁজুন..."
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && query.trim().length > 0 && (
                    <div className="max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-slate-400">খুঁজছি...</div>
                        ) : error && suggestions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-red-300">{error}</div>
                        ) : suggestions.length > 0 ? (
                            <div className="space-y-1 p-2">
                                {suggestions.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={`/users/${user.id}`}
                                        onClick={handleSelectUser}
                                    >
                                        <div className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-white/10">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name || "User"}
                                                    className="h-10 w-10 rounded-full border border-white/20 object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 flex-shrink-0">
                                                    <UserCircle className="h-5 w-5 text-slate-400" />
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-white">{getSuggestionDisplayName(user)}</p>
                                                {user.username && (
                                                    <p className="truncate text-xs text-slate-400">@{user.username}</p>
                                                )}
                                                {user.email && (
                                                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
