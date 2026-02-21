import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type SupabaseCookie = {
    name: string;
    value: string;
    options?: Record<string, unknown>;
};

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
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: SupabaseCookie[]) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
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
        const redirectResponse = NextResponse.redirect(redirectUrl);
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie);
        });
        return redirectResponse;
    }

    return response;
}
