import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function escapeIlike(value: string) {
    return value.replace(/[%,]/g, "");
}

function maskEmail(email: string) {
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return "";

    if (localPart.length <= 2) {
        return `${localPart[0] ?? "*"}***@${domain}`;
    }

    return `${localPart.slice(0, 2)}***@${domain}`;
}

/**
 * GET /api/users/search - Search for users by name, username, or email
 * Query params: q (search query)
 */
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const sanitizedQuery = query?.trim() ?? "";

    if (!sanitizedQuery || sanitizedQuery.length < 1) {
        return NextResponse.json(
            { error: "সার্চ কোয়েরি প্রয়োজন" },
            { status: 400 },
        );
    }

    const safeQuery = escapeIlike(sanitizedQuery);

    // Search users by username, name, or email
    const { data, error } = await supabase
        .from("users")
        .select("id, full_name, username, avatar_url, is_profile_public")
        .eq("is_profile_public", true)
        .or(`full_name.ilike.%${safeQuery}%,username.ilike.%${safeQuery}%`)
        .limit(10);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also search by email in auth.users if query looks like email
    let emailResults: Array<{
        id: string;
        full_name: string | null;
        username: string | null;
        email: string | null;
        avatar_url: string | null;
        is_profile_public: boolean;
    }> = [];
    if (safeQuery.includes("@")) {
        const { data: publicUsers } = await supabase
            .from("users")
            .select("id, full_name, username, avatar_url, is_profile_public")
            .eq("is_profile_public", true)
            .limit(300);

        const publicUserMap = new Map((publicUsers ?? []).map((user) => [user.id, user]));

        try {
            const { data: authData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 300 });
            if (authData?.users?.length) {
                emailResults = authData.users
                    .filter((user) => {
                        if (!user.email?.toLowerCase().includes(safeQuery.toLowerCase())) {
                            return false;
                        }

                        return publicUserMap.has(user.id);
                    })
                    .slice(0, 10)
                    .map((authUser) => {
                        const publicUser = publicUserMap.get(authUser.id);
                        return {
                            id: authUser.id,
                            full_name: publicUser?.full_name ?? null,
                            username: publicUser?.username ?? null,
                            email: authUser.email ? maskEmail(authUser.email) : null,
                            avatar_url: publicUser?.avatar_url ?? null,
                            is_profile_public: true,
                        };
                    });
            }
        } catch {
            emailResults = [];
        }
    }

    // Combine and deduplicate results
    const allResults = [...(data ?? []).map((user) => ({ ...user, email: null })), ...emailResults];
    const uniqueResults = Array.from(new Map(allResults.map((user) => [user.id, user])).values());

    return NextResponse.json({ results: uniqueResults.slice(0, 15) });
}
