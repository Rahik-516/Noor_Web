import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <section className="py-10">
            <AuthForm mode="register" />
            <p className="mt-4 text-center text-sm text-slate-300">
                আগে থেকেই অ্যাকাউন্ট আছে? <Link href="/login" className="text-white underline">লগইন করুন</Link>
            </p>
        </section>
    );
}
