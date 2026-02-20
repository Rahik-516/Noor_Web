"use client";

import { useId } from "react";

interface ProgressRingProps {
    progress: number;
    label?: string;
}

export function ProgressRing({ progress, label }: ProgressRingProps) {
    const gradientId = useId();
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
                />
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8FA2FF" />
                        <stop offset="100%" stopColor="#44E4B5" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <p className="text-2xl font-bold">{progress}%</p>
                {label ? <p className="text-xs text-slate-300">{label}</p> : null}
            </div>
        </div>
    );
}
