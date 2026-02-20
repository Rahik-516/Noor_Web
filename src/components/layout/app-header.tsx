import Link from "next/link";
import { AppHeaderClientActions } from "@/components/layout/app-header-client-actions";

export const HEADER_NAV_ITEMS = [
    { href: "/dashboard", label: "ড্যাশবোর্ড" },
    { href: "/quran", label: "কুরআন" },
    { href: "/zakat", label: "যাকাত" },
    { href: "/assistant", label: "সহকারী" },
    { href: "/map", label: "ম্যাপ" },
    { href: "/recipes", label: "রেসিপি" },
    { href: "/profile", label: "প্রোফাইল" },
    { href: "/users", label: "ব্যবহারকারীরা" },
];

export function AppHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl relative">
            <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="shrink-0 text-lg font-bold tracking-tight text-white transition hover:text-slate-200 sm:text-xl"
                >
                    নূর
                </Link>

                <nav className="hidden items-center justify-end gap-1.5 xl:flex xl:flex-1 xl:pl-4">
                    {HEADER_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-300 transition duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 xl:px-3"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <AppHeaderClientActions navItems={HEADER_NAV_ITEMS} />
            </div>
        </header>
    );
}
