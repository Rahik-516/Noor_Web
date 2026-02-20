import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/profile";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata = {
    title: "প্রোফাইল সম্পাদনা",
};

export default async function EditProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await getUserProfile(user.id);

    if (!profile) {
        return (
            <div className="space-y-6 pb-12">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">প্রোফাইল সম্পাদনা</h1>
                </div>
                <GlassCard className="p-6 text-center">
                    <p className="text-slate-400">প্রোফাইল লোড করতে পারা যায়নি।</p>
                </GlassCard>
            </div>
        );
    }

    return (
        <section className="space-y-6 pb-12">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">প্রোফাইল সম্পাদনা</h1>
                <p className="text-sm text-slate-300 sm:text-base">
                    আপনার প্রোফাইল তথ্য আপডেট করুন
                </p>
            </div>

            <div className="max-w-2xl">
                <EditProfileForm profile={profile} />
            </div>
        </section>
    );
}
