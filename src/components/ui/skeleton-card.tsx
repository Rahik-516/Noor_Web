export function SkeletonCard() {
    return (
        <div className="glass-card h-36 animate-pulse p-4">
            <div className="h-4 w-1/2 rounded bg-white/20" />
            <div className="mt-4 h-3 w-full rounded bg-white/10" />
            <div className="mt-2 h-3 w-3/4 rounded bg-white/10" />
        </div>
    );
}
