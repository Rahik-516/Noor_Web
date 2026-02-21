type SupabasePublicEnv = {
    url: string;
    publishableKey: string;
};

function resolveSupabasePublicEnv(): SupabasePublicEnv {
    const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.SUPABASE_URL ??
        "";

    const publishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        "";

    return {
        url,
        publishableKey,
    };
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
    const env = resolveSupabasePublicEnv();

    if (!env.url || !env.publishableKey) {
        throw new Error(
            "Missing Supabase env vars. Required: NEXT_PUBLIC_SUPABASE_URL and one of NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
        );
    }

    return env;
}

export function getSupabasePublicEnvOrNull(): SupabasePublicEnv | null {
    const env = resolveSupabasePublicEnv();

    if (!env.url || !env.publishableKey) {
        return null;
    }

    return env;
}