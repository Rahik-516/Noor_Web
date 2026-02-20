declare module "next-pwa" {
    import type { NextConfig } from "next";

    interface PWAOptions {
        dest: string;
        disable?: boolean;
        register?: boolean;
        skipWaiting?: boolean;
    }

    type WithPWA = (config: NextConfig) => NextConfig;

    export default function withPWA(options: PWAOptions): WithPWA;
}
