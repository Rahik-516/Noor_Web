"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type HeaderNavItem = {
    href: string;
    label: string;
};

type AppHeaderClientActionsProps = {
    navItems: HeaderNavItem[];
};

export function AppHeaderClientActions({ navItems }: AppHeaderClientActionsProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activePath, setActivePath] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        setActivePath(pathname ?? "");
    }, [mounted, pathname]);

    useEffect(() => {
        if (!mobileMenuOpen) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setMobileMenuOpen(false);
            }
        }

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (!mounted) return;

        const supabase = createClient();

        async function loadSession() {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setIsAuthenticated(Boolean(session));
        }

        void loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(Boolean(session));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [mounted]);

    async function handleSignOut() {
        setIsSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        setMobileMenuOpen(false);
        setIsSigningOut(false);
        router.push("/login");
        router.refresh();
    }

    return (
        <>
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
                <div className="hidden min-h-10 min-w-[88px] xl:block">
                    {mounted && isAuthenticated && (
                        <Button
                            variant="secondary"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="hidden xl:inline-flex"
                        >
                            {isSigningOut ? "লগআউট হচ্ছে..." : "লগআউট"}
                        </Button>
                    )}
                </div>

                <ThemeToggle />

                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition xl:hidden hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-nav-menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileMenuOpen && (
                <>
                    <button
                        className="fixed inset-0 top-16 z-40 bg-black/45 xl:hidden"
                        aria-label="Close menu"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full z-50 border-t border-white/10 bg-black/75 shadow-lg backdrop-blur-xl xl:hidden">
                        <nav id="mobile-nav-menu" className="mx-auto flex max-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col gap-1.5 overflow-y-auto px-4 py-4 pb-5 sm:px-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "rounded-xl px-4 py-3 text-sm font-medium transition duration-200",
                                        "min-h-12",
                                        "text-slate-300 hover:text-white hover:bg-white/10",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                                        mounted && activePath.startsWith(item.href) && "bg-white/15 text-white"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="mt-3 min-h-10 w-full">
                                {mounted && isAuthenticated && (
                                    <Button
                                        variant="secondary"
                                        onClick={handleSignOut}
                                        disabled={isSigningOut}
                                        className="w-full"
                                    >
                                        {isSigningOut ? "লগআউট হচ্ছে..." : "লগআউট"}
                                    </Button>
                                )}
                            </div>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
