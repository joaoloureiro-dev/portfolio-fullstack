interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-zinc-800/50 rounded-md ${className}`}
            style={{
                // Garante um contraste mínimo mesmo que o background falhe
                minHeight: '1em'
            }}
        />
    );
}