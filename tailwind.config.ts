import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                moon: {
                    50: "#f5f8ff",
                    100: "#eaf0ff",
                    500: "#6274d9",
                    700: "#3949ab",
                    900: "#1f2758",
                },
            },
            backgroundImage: {
                "moonlight-gradient":
                    "radial-gradient(circle at top right, rgba(111,138,255,0.28), rgba(28,32,60,0.95) 42%, rgba(7,8,20,1) 100%)",
            },
            boxShadow: {
                glass: "0 12px 40px rgba(20, 25, 65, 0.18)",
            },
        },
    },
    plugins: [],
};

export default config;
