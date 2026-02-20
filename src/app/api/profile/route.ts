import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateProfileCompleteness } from "@/lib/profile";

/**
 * GET /api/profile - Get user's own profile
 */
export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("users")
        .select("id, full_name, username, bio, avatar_url, is_profile_public, created_at, updated_at")
        .eq("id", user.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

/**
 * PUT /api/profile - Update user's profile
 */
export async function PUT(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, username, bio, is_profile_public, avatar_url } = body;

    // Validate input
    if (full_name && full_name.length > 100) {
        return NextResponse.json({ error: "নাম ১০০ অক্ষরের কম হওয়া উচিত" }, { status: 400 });
    }

    if (username && !/^[a-zA-Z0-9_-]*$/.test(username)) {
        return NextResponse.json(
            { error: "ব্যবহারকারীর নাম শুধুমাত্র অক্ষর, সংখ্যা, _ এবং - ধারণ করতে পারে" },
            { status: 400 },
        );
    }

    if (username && username.length > 50) {
        return NextResponse.json(
            { error: "ব্যবহারকারীর নাম ৫০ অক্ষরের কম হওয়া উচিত" },
            { status: 400 },
        );
    }

    if (bio && bio.length > 500) {
        return NextResponse.json(
            { error: "জীবনী ৫০০ অক্ষরের কম হওয়া উচিত" },
            { status: 400 },
        );
    }

    // Update profile
    const { error } = await supabase
        .from("users")
        .update({
            full_name: full_name || null,
            username: username || null,
            bio: bio || null,
            avatar_url: avatar_url || null,
            is_profile_public:
                typeof is_profile_public === "boolean" ? is_profile_public : true,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "প্রোফাইল আপডেট ব্যর্থ হয়েছে" },
            { status: 500 },
        );
    }

    return NextResponse.json({ success: true });
}
