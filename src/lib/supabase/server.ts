import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/config";

type SupabaseCookie = {
    name: string;
    value: string;
    options?: Record<string, unknown>;
};

export async function createClient() {
    const cookieStore = await cookies();
    const { url, publishableKey } = getSupabasePublicEnv();

    return createServerClient(
        url,
        publishableKey,
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
