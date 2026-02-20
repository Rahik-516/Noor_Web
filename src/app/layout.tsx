import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppHeader } from "@/components/layout/app-header";
import { DevSwCleanup } from "@/components/layout/dev-sw-cleanup";

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "নূর — Islamic Super App",
  description: "আপনার স্মার্ট ইসলামী সহচর",
  applicationName: "নূর",
  keywords: ["Ramadan", "Islamic App", "Bengali", "Quran Tracker", "Zakat"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${notoSansBengali.variable} font-bengali antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DevSwCleanup />
          <div className="relative min-h-screen bg-moonlight-gradient text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.08]" />
            <AppHeader />
            <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:px-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
