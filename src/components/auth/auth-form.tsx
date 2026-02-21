"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface AuthFormProps {
    mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setNotice(null);
        setLoading(true);

        const supabase = createClient();

        const {
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError && sessionError.message.toLowerCase().includes("invalid refresh token")) {
            await supabase.auth.signOut({ scope: "local" });
        }

        const authAction =
            mode === "login"
                ? supabase.auth.signInWithPassword({ email, password })
                : supabase.auth.signUp({ email, password });

        const { error: authError } = await authAction;

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (mode === "register") {
            setNotice(
                `আপনার ${email} ইমেইলে ভেরিফিকেশন লিংক পাঠানো হয়েছে। লগইন করার আগে ইমেইলে গিয়ে লিংকে ক্লিক করে অ্যাকাউন্ট ভেরিফাই করুন।`,
            );
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <GlassCard className="mx-auto w-full max-w-md p-6">
            <h1 className="mb-4 text-2xl font-bold text-white">
                {mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট খুলুন"}
            </h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-slate-300"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-slate-300"
                    required
                    minLength={6}
                />
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
                {notice ? (
                    <p className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                        {notice}
                    </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "অপেক্ষা করুন..." : mode === "login" ? "প্রবেশ করুন" : "রেজিস্টার"}
                </Button>
            </form>
        </GlassCard>
    );
}
