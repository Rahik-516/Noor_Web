import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="grid min-h-[75vh] items-center gap-8 md:grid-cols-2">
      <div className="space-y-5">
        <span className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1 text-sm text-moon-100">
          নূর Islamic Super App
        </span>
        <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
          আপনার স্মার্ট ইসলামী সহচর
        </h1>
        <p className="max-w-xl text-base leading-7 text-slate-200">
          রমাদান থেকে সারা বছরের ইবাদত পরিকল্পনা — কুরআন ট্র্যাকার, যাকাত ক্যালকুলেটর,
          ইসলামিক সহকারী, মাসজিদ ম্যাপ ও দৈনিক হাদিস সব এক প্ল্যাটফর্মে।
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/register" className="inline-flex items-center gap-2">
              আজই শুরু করুন <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">ড্যাশবোর্ড দেখুন</Link>
          </Button>
        </div>
      </div>
      <GlassCard className="space-y-4 p-6">
        <h2 className="text-xl font-semibold text-white">আজকের ফোকাস</h2>
        <ul className="space-y-3 text-sm text-slate-200">
          <li>• সহরি ও ইফতারের লাইভ সময়</li>
          <li>• ৩০ পারা কুরআন সম্পন্ন ট্র্যাকিং</li>
          <li>• AI ইসলামিক সহকারী (বাংলা)</li>
          <li>• যাকাত হিসাব ও রেকর্ড সংরক্ষণ</li>
        </ul>
      </GlassCard>
    </section>
  );
}
