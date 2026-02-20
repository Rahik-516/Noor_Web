import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !publishableKey) {
        console.error(
            "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) in .env.local, then restart the dev server.",
        );
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        publishableKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: Record<string, unknown>) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({ request });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: Record<string, unknown>) {
                    request.cookies.set({ name, value: "", ...options });
                    response = NextResponse.next({ request });
                    response.cookies.set({ name, value: "", ...options });
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const protectedRoutes = [
        "/dashboard",
        "/quran",
        "/zakat",
        "/assistant",
        "/map",
        "/recipes",
    ];
    const isProtectedRoute = protectedRoutes.some((path) =>
        request.nextUrl.pathname.startsWith(path),
    );

    if (isProtectedRoute && !user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}
