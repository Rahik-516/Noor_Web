"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { RecipeResponse } from "@/lib/types";

export function RecipeAssistant() {
    const [ingredients, setIngredients] = useState("");
    const [result, setResult] = useState<RecipeResponse | null>(null);

    async function generateRecipe() {
        const response = await fetch("/api/recipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients }),
        });

        const payload = (await response.json()) as { data: RecipeResponse };
        setResult(payload.data);
    }

    return (
        <section className="space-y-4">
            <GlassCard className="p-5">
                <h1 className="text-2xl font-bold">Healthy Iftar Recipe AI</h1>
                <input
                    className="mt-4 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                    placeholder="উপকরণ লিখুন (e.g. ছোলা, ডিম, সবজি)"
                    value={ingredients}
                    onChange={(event) => setIngredients(event.target.value)}
                />
                <Button className="mt-3" onClick={generateRecipe} disabled={!ingredients}>
                    রেসিপি তৈরি করুন
                </Button>
            </GlassCard>
            {result ? (
                <GlassCard className="space-y-2 p-5 text-sm">
                    <p className="font-semibold">Ingredients</p>
                    <p>{result.ingredients.join(", ")}</p>
                    <p className="font-semibold">Steps</p>
                    <ol className="list-inside list-decimal space-y-1">
                        {result.steps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ol>
                    <p><span className="font-semibold">Calories:</span> {result.caloriesApprox}</p>
                    <p><span className="font-semibold">Health tip:</span> {result.healthTip}</p>
                </GlassCard>
            ) : null}
        </section>
    );
}
