"use client";

import { useState } from "react";

export default function Home() {
  const [steamId, setSteamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        
    // Basic validation
    if (!steamId.trim()) {
      setError("Please enter a Steam ID");
      return;
    }

    setError(null);
    setIsLoading(true);

    // TODO: Steam API integration will go here
    // For now, just simulate loading
    setTimeout(() => {
      setIsLoading(false);
      console.log("Steam ID submitted:", steamId);
          }, 1000);
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
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
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

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>Built with ❤️ and 🔥 by David</p>
        </div>
      </div>
    </main>
  );
}
