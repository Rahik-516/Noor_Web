import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function Loading() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
    );
}
