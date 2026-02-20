import { NextResponse } from "next/server";
import { generateRecipeResponse } from "@/lib/ai/providers";

interface RequestBody {
    ingredients?: string;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as RequestBody;
        const ingredients = body.ingredients?.trim();

        if (!ingredients) {
            return NextResponse.json({ error: "Ingredients are required" }, { status: 400 });
        }

        if (ingredients.length > 2000) {
            return NextResponse.json({ error: "Ingredients too long" }, { status: 413 });
        }

        const recipe = await generateRecipeResponse(ingredients);

        return NextResponse.json({ data: recipe });
    } catch {
        return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
    }
}
