"use client";

import { PlayCircle, Zap, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    getCachedProbingResults,
    type CachedProbingResults,
} from "@/lib/providers";

interface TVWatchButtonProps {
    tvId: number;
    season: number;
    episode: number;
    title: string;
    showDownload?: boolean;
}

export function TVWatchButton({ tvId, season, episode, title, showDownload = true }: TVWatchButtonProps) {
    const router = useRouter();
    const [probingResults, setProbingResults] = useState<CachedProbingResults | null>(null);

    const watchPath = `/watch/tv/${tvId}?season=${season}&episode=${episode}`;

    // Prefetch on mount for instant navigation
    useEffect(() => {
        router.prefetch(watchPath);
    }, [tvId, router]);

    // Check for cached probing results on mount (non-blocking)
    useEffect(() => {
        const cached = getCachedProbingResults(tvId);
        if (cached) {
            setProbingResults(cached);
        }
    }, [tvId]);

    // Prefetch on hover for lazy loading
    const handleMouseEnter = () => {
        router.prefetch(watchPath);
    };

    const handleWatchClick = () => {
        if (probingResults?.fastestProvider) {
            router.push(`/watch/tv/${tvId}?season=${season}&episode=${episode}&provider=${probingResults.fastestProvider.providerId}`);
        } else {
            router.push(watchPath);
        }
    };

    const fastestProvider = probingResults?.fastestProvider;

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
                <button
                    onMouseEnter={handleMouseEnter}
                    onClick={handleWatchClick}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition-all hover:scale-105 shadow-lg shadow-accent/30"
                >
                    {fastestProvider ? (
                        <Zap size={20} className="text-yellow-400" />
                    ) : (
                        <PlayCircle size={20} />
                    )}
                    {fastestProvider ? "Play Instantly" : "Watch Now"}
                </button>
                
                {/* Preloading Status Indicator - show immediately without spinner */}
                {fastestProvider && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                        <Zap className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">
                            Ready • {fastestProvider.providerName} ({fastestProvider.responseTime}ms)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
