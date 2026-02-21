import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type SupabaseCookie = {
    name: string;
    value: string;
    options?: Record<string, unknown>;
};

export async function createClient() {
    const cookieStore = await cookies();
    const publishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        publishableKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: SupabaseCookie[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Server Components may not allow cookie writes. Middleware refresh handles this safely.
                    }
                },
            },
        },
    );
}
