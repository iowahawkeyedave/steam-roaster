"use client";

import { useState } from "react";

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
}

export default function Home() {
  const [steamId, setSteamId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<SteamGame[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!steamId.trim()) {
      setError("Please enter a Steam ID");
      return;
    }

    setError(null);
    setIsLoading(true);
    setGames(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
      };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Steam Library Roaster
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your Steam library has secrets. We&apos;re here to expose them. 🔥
          </p>
        </div>
                {/* Input Form */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="steamId" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Enter Your Steam ID
              </label>
              <input
                type="text"
                id="steamId"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                                placeholder="76561198xxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-gray-400">
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
                        {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                                    Connecting...
                </span>
              ) : (
                "Roast My Library 🔥"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {games && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Found {games.length} games
            </h2>
                        
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.slice(0, 12).map((game) => (
                <div 
                  key={game.appid}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {game.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {formatPlaytime(game.playtime_forever)} played
                  </p>
                  {game.playtime_2weeks && game.playtime_2weeks > 0 && (
                    <p className="text-green-400 text-xs mt-1">
                      {formatPlaytime(game.playtime_2weeks)} recently
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {games.length > 12 && (
              <p className="text-center text-gray-400 mt-6">
                + {games.length - 12} more games...
              </p>
            )}
          </div>
        )}
                {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>Built with ❤️ and 🔥 by David</p>
        </div>
      </div>
    </main>
  );
}