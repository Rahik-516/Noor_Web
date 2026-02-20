import { GlassCard } from "@/components/ui/glass-card";
import { UserSearchForm } from "@/components/profile/user-search-form";

export const metadata = {
    title: "ব্যবহারকারী খুঁজুন",
};

export default function UserSearchPage() {
    return (
        <section className="space-y-6 pb-12">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">ব্যবহারকারী খুঁজুন</h1>
                <p className="text-sm text-slate-300 sm:text-base">
                    অন্যান্য ব্যবহারকারীদের অগ্রগতি এবং অর্জনগুলি দেখুন
                </p>
            </div>

            <div className="max-w-2xl">
                <UserSearchForm />
            </div>
        </section>
    );
}
