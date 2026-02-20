import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <section className="py-10">
            <AuthForm mode="login" />
            <p className="mt-4 text-center text-sm text-slate-300">
                অ্যাকাউন্ট নেই? <Link href="/register" className="text-white underline">রেজিস্টার করুন</Link>
            </p>
        </section>
    );
}
