"use client";

import { useEffect } from "react";

export function DevSwCleanup() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;
        if (!("serviceWorker" in navigator)) return;

        const unregister = async () => {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));

            if (window.caches) {
                const cacheKeys = await caches.keys();
                await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
            }
        };

        void unregister();
    }, []);

    return null;
}
