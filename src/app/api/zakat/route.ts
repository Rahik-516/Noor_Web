import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
        cash?: number;
        gold?: number;
        silver?: number;
        businessAssets?: number;
        liabilities?: number;
        zakat?: number;
    };

    const values = [
        body.cash,
        body.gold,
        body.silver,
        body.businessAssets,
        body.liabilities,
        body.zakat,
    ];

    if (values.some((value) => typeof value !== "number" || Number.isNaN(value) || value < 0)) {
        return NextResponse.json({ error: "Invalid values" }, { status: 400 });
    }

    const { error } = await supabase.from("zakat_records").insert({
        user_id: user.id,
        cash: body.cash,
        gold_grams: body.gold,
        silver_grams: body.silver,
        business_assets: body.businessAssets,
        liabilities: body.liabilities,
        zakat_amount: body.zakat,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
