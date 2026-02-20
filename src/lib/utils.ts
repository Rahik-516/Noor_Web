import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculateQuranProgress(completedCount: number) {
    return Math.round((completedCount / 30) * 100);
}

export function formatCurrencyBDT(amount: number) {
    return new Intl.NumberFormat("bn-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 2,
    }).format(amount);
}
