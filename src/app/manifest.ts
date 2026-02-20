import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "নূর Islamic Super App",
        short_name: "নূর",
        description: "আপনার স্মার্ট ইসলামী সহচর",
        start_url: "/",
        display: "standalone",
        background_color: "#0b1020",
        theme_color: "#1f2758",
        icons: [
            {
                src: "/icon-192.svg",
                sizes: "192x192",
                type: "image/svg+xml",
            },
            {
                src: "/icon-512.svg",
                sizes: "512x512",
                type: "image/svg+xml",
            },
        ],
    };
}
