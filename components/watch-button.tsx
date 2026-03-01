"use client";

import { PlayCircle, Download, Zap, Loader2, CheckCircle2, Plus, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    getCachedProbingResults,
    type CachedProbingResults,
} from "@/lib/providers";
import { useWatchlist } from "@/hooks/use-watchlist";

interface WatchButtonProps {
    movieId: number;
    title: string;
    posterPath?: string | null;
    mediaType?: "movie" | "tv";
    showDownload?: boolean;
    showWatchlist?: boolean;
}

export function WatchButton({ 
    movieId, 
    title, 
    posterPath,
    mediaType = "movie",
    showDownload = true,
    showWatchlist = true 
}: WatchButtonProps) {
    const router = useRouter();
    const [probingResults, setProbingResults] = useState<CachedProbingResults | null>(null);

    const { 
        isSaved, 
        toggleSave, 
        isPending, 
        hasActiveProfile,
        loading: watchlistLoading 
    } = useWatchlist();

    const watchPath = `/watch/${mediaType}/${movieId}`;

    // Prefetch on mount for instant navigation
    useEffect(() => {
        router.prefetch(watchPath);
    }, [movieId, router]);

    // Check for cached probing results on mount (non-blocking)
    useEffect(() => {
        const cached = getCachedProbingResults(movieId);
        if (cached) {
            setProbingResults(cached);
        }
    }, [movieId]);

    // Prefetch on hover for lazy loading
    const handleMouseEnter = () => {
        router.prefetch(watchPath);
    };

    const handleWatchClick = (e: React.MouseEvent) => {
        // If we have a preloaded provider, we could pass it via query params
        if (probingResults?.fastestProvider) {
            router.push(`/watch/${mediaType}/${movieId}?provider=${probingResults.fastestProvider.providerId}`);
        } else {
            router.push(watchPath);
        }
    };

    const handleWatchlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!hasActiveProfile) {
            return;
        }

        await toggleSave({
            id: movieId,
            title,
            poster_path: posterPath ?? null,
            mediaType,
        });
    };

    const fastestProvider = probingResults?.fastestProvider;
    const isInWatchlist = isSaved(movieId, mediaType);
    const isWatchlistPending = isPending(movieId, mediaType);

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
                <button
                    onMouseEnter={handleMouseEnter}
                    onClick={handleWatchClick}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/30"
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

            {/* Watchlist Button */}
            {showWatchlist && (
                <button
                    onClick={handleWatchlistToggle}
                    disabled={!hasActiveProfile || isWatchlistPending || watchlistLoading}
                    className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-full transition-all hover:scale-105 ${
                        !hasActiveProfile 
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : isInWatchlist
                                ? "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30"
                                : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    }`}
                    title={!hasActiveProfile ? "Select a profile to add to your list" : isInWatchlist ? "Remove from My List" : "Add to My List"}
                >
                    {isWatchlistPending ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : isInWatchlist ? (
                        <Check size={18} />
                    ) : (
                        <Plus size={18} />
                    )}
                    {isWatchlistPending 
                        ? "Updating..." 
                        : isInWatchlist 
                            ? "In My List" 
                            : "My List"
                    }
                </button>
            )}
            
            {showDownload && (
                <button
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-full transition-all"
                >
                    <Download size={18} className="mr-2" />
                    Download
                </button>
            )}
        </div>
    );
}
