import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: Record<string, unknown>) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: Record<string, unknown>) {
                    cookieStore.set({ name, value: "", ...options });
                },
            },
        },
    );
}
