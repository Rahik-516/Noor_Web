import { NextResponse } from "next/server";
import { generateIslamicAssistantResponse } from "@/lib/ai/providers";

interface RequestBody {
    query?: string;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as RequestBody;
        const query = body.query?.trim();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        if (query.length > 2000) {
            return NextResponse.json({ error: "Query too long" }, { status: 413 });
        }

        const response = await generateIslamicAssistantResponse(query);

        return NextResponse.json({ data: response });
    } catch {
        return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
    }
}
