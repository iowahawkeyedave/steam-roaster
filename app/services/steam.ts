// Service to fetch Steam library data
const STEAM_API_KEY = process.env.STEAM_API_KEY;

if (!STEAM_API_KEY) {
  throw new Error("STEAM_API_KEY environment variable is required");
}

interface SteamGame {
  appid: number;  
  name: string;
  playtime_forever: number; // minutes
  playtime_2weeks?: number; // minutes
  img_icon_url?: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
}

interface SteamLibraryResponse {
  response?: {
    game_count?: number;
    games?: SteamGame[];
  };
  
}
export async function getSteamLibrary(steamId: string): Promise<{
  success: boolean;
  games?: SteamGame[];
  error?: string;
}> {
  try {
    // Steam Web API endpoint for owned games
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }
        const data: SteamLibraryResponse = await response.json();

    if (!data.response || !data.response.games) {
      return {
        success: false,
        error: "No games found. Profile might be private or Steam ID is invalid.",
      };
    }

    // Sort by playtime (most played first)
    const games = data.response.games.sort(
      (a, b) => b.playtime_forever - a.playtime_forever
    );

    return {
              success: true,
      games,
    };
  } catch (error) {
    console.error("Steam API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Helper to format playtime
export function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
    
  if (hours < 1) {
    return `${minutes}m`;
  }
  
  if (hours < 24) {
    return `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days}d`;
  }
    
  return `${days}d ${remainingHours}h`;
}