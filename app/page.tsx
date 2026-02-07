"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ErrorMessage from "@/app/components/ErrorMessage";

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
}

// Tier-specific color schemes
const tierStyles = {
  light: {
    gradient: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
    border: "border-emerald-500/50",
    glow: "shadow-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    accent: "text-emerald-400",
  },
  medium: {
    gradient: "from-amber-500/30 via-orange-500/20 to-red-500/30",
    border: "border-amber-500/50",
    glow: "shadow-amber-500/20",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    accent: "text-amber-400",
  },
  brutal: {
    gradient: "from-red-600/40 via-rose-500/30 to-pink-600/40",
    border: "border-red-500/60",
    glow: "shadow-red-500/30",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    accent: "text-red-400",
  },
};

export default function Home() {
  const [steamId, setSteamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRoasting, setIsRoasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<SteamGame[] | null>(null);
  const [roast, setRoast] = useState<string | null>(null);
  const [roastTier, setRoastTier] = useState<"light" | "medium" | "brutal">("medium");
  const [errorType, setErrorType] = useState<"steam" | "roast" | "network" | "validation">("network");
  const [copied, setCopied] = useState(false);
  const [totalPlaytime, setTotalPlaytime] = useState(0);
  
  const roastCardRef = useRef<HTMLDivElement>(null);

  const handleRetry = () => {
    setError(null);
    if (steamId.trim()) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!steamId.trim()) {
      setError("Please enter a valid Steam ID");
      setErrorType("validation");
      return;
    }

    setError(null);
    setIsLoading(true);
    setGames(null);
    setRoast(null);

    try {
      const response = await fetch("/api/steam/library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ steamId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch library");
      }

      setGames(data.games);
      // Calculate total playtime
      const total = data.games.reduce((sum: number, game: SteamGame) => sum + game.playtime_forever, 0);
      setTotalPlaytime(total);
      // Auto-generate roast after fetching games
      await generateRoast(data.games, roastTier);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoast = async (gamesData: SteamGame[], tier: "light" | "medium" | "brutal") => {
    setIsRoasting(true);
    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ games: gamesData, tier }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate roast");
      }

      setRoast(data.roast);
    } catch (err) {
      console.error("Roast error:", err);
      setRoast(`Roast generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRoasting(false);
    }
  };

  const handleTierChange = async (tier: "light" | "medium" | "brutal") => {
    setRoastTier(tier);
    if (games) {
      await generateRoast(games, tier);
    }
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const formatHours = (minutes: number) => {
    return Math.floor(minutes / 60).toLocaleString();
  };

  // Share functionality
  const handleCopyRoast = async () => {
    if (!roast) return;
    const text = `"${roast}" — Roasted by Steam Library Roaster 🔥`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadPNG = async () => {
    if (!roastCardRef.current) return;
    
    try {
      const dataUrl = await toPng(roastCardRef.current, {
        quality: 0.95,
        backgroundColor: "#0f0f1a",
        pixelRatio: 2,
      });
      
      const link = document.createElement("a");
      link.download = `steam-roast-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate PNG:", err);
    }
  };

  const handleShareTwitter = () => {
    if (!roast) return;
    const text = encodeURIComponent(`"${roast.substring(0, 200)}${roast.length > 200 ? '...' : ''}" 🔥`);
    const url = encodeURIComponent("https://steam-roaster.vercel.app");
    const hashtags = "SteamRoaster,Gaming";
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareReddit = () => {
    if (!roast) return;
    const title = encodeURIComponent(`My Steam library got roasted: "${roast.substring(0, 100)}${roast.length > 100 ? '...' : ''}"`);
    const url = encodeURIComponent("https://steam-roaster.vercel.app");
    window.open(
      `https://www.reddit.com/submit?title=${title}&url=${url}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent("https://steam-roaster.vercel.app");
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const styles = tierStyles[roastTier];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Steam Library
            </span>
            <br />
            <span className="text-white">Roaster</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
            Your Steam library has secrets. We&apos;re here to expose them. 🔥
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-md mx-auto bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 mb-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="steamId" 
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Enter Your Steam ID
              </label>
              <input
                type="text"
                id="steamId"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="76561198xxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
              />
              <p className="mt-2 text-sm text-slate-500">
                Find your Steam ID at{" "}
                <a
                  href="https://steamid.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 underline"
                >
                  steamid.io
                </a>
              </p>
            </div>

            {/* Roast Tier Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Roast Intensity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "medium", "brutal"] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleTierChange(tier)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all capitalize ${
                      roastTier === tier
                        ? tier === "light" 
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                          : tier === "medium"
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                          : "bg-red-500 text-white shadow-lg shadow-red-500/25"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <ErrorMessage message={error} onRetry={handleRetry} errorType={errorType} />
            )}

            <button
              type="submit"
              disabled={isLoading || isRoasting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Fetching library...
                </span>
              ) : isRoasting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔥</span>
                  Generating roast...
                </span>
              ) : (
                "Roast My Library 🔥"
              )}
            </button>
          </form>
          {(isLoading || isRoasting) && (
            <div className="mt-6">
              <LoadingSpinner
                stage={isRoasting ? "roast" : "steam"}
                message={isRoasting ? "Crafting the perfect roast..." : "Fetching your gaming secrets..."}
              />
            </div>
          )}
        </div>

        {/* Polished Roast Card */}
        {roast && (
          <div className="max-w-lg mx-auto mb-12">
            {/* Card Container with Glow */}
            <div className={`relative group`}>
              {/* Glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${styles.gradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`} />
              
              {/* Main Card */}
              <div 
                ref={roastCardRef}
                className={`relative bg-gradient-to-br ${styles.gradient} backdrop-blur-xl rounded-3xl p-1`}
              >
                <div className="bg-slate-950/90 rounded-[22px] p-8">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${styles.badge}`}>
                      {roastTier} Roast
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      steam-roaster.vercel.app
                    </span>
                  </div>

                  {/* Stats Row */}
                  {games && (
                    <div className="flex justify-center gap-8 mb-6 pb-6 border-b border-slate-800">
                      <div className="text-center">
                        <p className={`text-2xl font-black ${styles.accent}`}>
                          {games.length}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Games</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-black ${styles.accent}`}>
                          {formatHours(totalPlaytime)}h
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Played</p>
                      </div>
                    </div>
                  )}

                  {/* Roast Quote */}
                  <div className="relative">
                    <span className={`absolute -top-2 -left-2 text-6xl ${styles.accent} opacity-20 font-serif`}>
                      &ldquo;
                    </span>
                    <p className="text-xl md:text-2xl text-center font-medium leading-relaxed text-white py-4 px-4">
                      {roast}
                    </p>
                    <span className={`absolute -bottom-8 -right-2 text-6xl ${styles.accent} opacity-20 font-serif`}>
                      &rdquo;
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <span className="text-sm font-bold text-slate-300">Steam Library Roaster</span>
                    </div>
                    <span className="text-xs text-slate-600">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleCopyRoast}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  copied 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>

              <button
                onClick={handleDownloadPNG}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-sm font-semibold transition-all flex items-center gap-2"
              >
                🖼️ Save PNG
              </button>

              <button
                onClick={handleShareTwitter}
                className="px-4 py-2.5 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/30 text-sm font-semibold transition-all flex items-center gap-2"
              >
                🐦 X
              </button>

              <button
                onClick={handleShareReddit}
                className="px-4 py-2.5 rounded-xl bg-[#FF4500]/10 hover:bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/30 text-sm font-semibold transition-all flex items-center gap-2"
              >
                🔴 Reddit
              </button>

              <button
                onClick={handleShareFacebook}
                className="px-4 py-2.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 text-sm font-semibold transition-all flex items-center gap-2"
              >
                📘 FB
              </button>
            </div>
          </div>
        )}

        {/* Games List */}
        {games && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-300">
              Your Library
              <span className="text-slate-500 text-lg font-normal"> ({games.length} games)</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.slice(0, 12).map((game) => (
                <div 
                  key={game.appid}
                  className="bg-slate-900/50 backdrop-blur-lg rounded-xl p-4 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all group"
                >
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-slate-200 group-hover:text-white transition-colors">
                    {game.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-slate-500 text-sm">
                      {formatPlaytime(game.playtime_forever)} played
                    </p>
                    {game.playtime_2weeks && game.playtime_2weeks > 0 && (
                      <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {games.length > 12 && (
              <p className="text-center text-slate-500 mt-6">
                + {games.length - 12} more games...
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>Built with ❤️ and 🔥 by David</p>
        </div>
      </div>
    </main>
  );
}
