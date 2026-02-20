import type { AiAssistantResponse, RecipeResponse } from "@/lib/types";

type Provider = "openai" | "gemini" | "mock";

function getProvider(): Provider {
    const configured = process.env.AI_PROVIDER?.toLowerCase();

    if (configured === "openai" || configured === "gemini" || configured === "mock") {
        return configured;
    }

    if (process.env.OPENAI_API_KEY) return "openai";
    if (process.env.GEMINI_API_KEY) return "gemini";
    return "mock";
}

function parseJsonBlock<T>(raw: string): T | null {
    try {
        return JSON.parse(raw) as T;
    } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) return null;

        try {
            return JSON.parse(match[0]) as T;
        } catch {
            return null;
        }
    }
}

async function callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
            temperature: 0.4,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
    };
    return payload.choices?.[0]?.message?.content ?? "";
}

async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4 },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callProvider(prompt: string): Promise<string> {
    const provider = getProvider();

    if (provider === "openai") {
        return callOpenAI(prompt);
    }

    if (provider === "gemini") {
        return callGemini(prompt);
    }

    throw new Error("No LLM provider configured");
}

export async function generateIslamicAssistantResponse(query: string): Promise<AiAssistantResponse> {
    const prompt = `You are a careful Islamic assistant for Bengali users.
Return ONLY valid JSON with keys: arabicReference, bengaliTranslation, shortExplanation.
Requirements:
- arabicReference: include one Quran verse or authentic hadith Arabic text with source.
- bengaliTranslation: Bengali translation of the reference.
- shortExplanation: concise (2-4 sentences), compassionate, practical.
User query: ${query}`;

    try {
        const raw = await callProvider(prompt);
        const parsed = parseJsonBlock<AiAssistantResponse>(raw);

        if (parsed?.arabicReference && parsed?.bengaliTranslation && parsed?.shortExplanation) {
            return parsed;
        }
    } catch {
        // fall back to safe default
    }

    return {
        arabicReference: "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًۭا (الطلاق: ٢)",
        bengaliTranslation: "যে আল্লাহকে ভয় করে, তিনি তার জন্য উত্তরণের পথ করে দেন। (সূরা তালাক ৬৫:২)",
        shortExplanation:
            "দুশ্চিন্তার সময়ে নামাজ, দোয়া ও কুরআন তিলাওয়াত হৃদয়কে স্থির করে। সমস্যার সমাধানে আল্লাহর উপর ভরসা রেখে ছোট ছোট আমল নিয়মিত চালিয়ে যান।",
    };
}

export async function generateRecipeResponse(ingredients: string): Promise<RecipeResponse> {
    const prompt = `You are a healthy iftar recipe assistant.
Return ONLY valid JSON with keys: ingredients (string[]), steps (string[]), caloriesApprox (string), healthTip (string).
User ingredients: ${ingredients}
Constraints: Keep recipe simple, Bengali-friendly, balanced nutrition.`;

    try {
        const raw = await callProvider(prompt);
        const parsed = parseJsonBlock<RecipeResponse>(raw);

        if (
            parsed &&
            Array.isArray(parsed.ingredients) &&
            Array.isArray(parsed.steps) &&
            typeof parsed.caloriesApprox === "string" &&
            typeof parsed.healthTip === "string"
        ) {
            return parsed;
        }
    } catch {
        // fall back to safe default
    }

    return {
        ingredients: ingredients.split(",").map((item) => item.trim()).filter(Boolean),
        steps: [
            "উপকরণ ধুয়ে ছোট করে কেটে নিন",
            "কম তেলে প্যানে ৮-১০ মিনিট রান্না করুন",
            "স্বাদমতো লবণ-মসলা দিয়ে পরিবেশন করুন",
        ],
        caloriesApprox: "প্রতি পরিবেশন ~৩২০ kcal",
        healthTip: "ইফতারে পানি, ফাইবার ও প্রোটিন বাড়ান; অতিরিক্ত ভাজা খাবার কমান।",
    };
}
