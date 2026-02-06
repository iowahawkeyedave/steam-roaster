// Service to generate roasts using OpenRouter AI

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is required");
}

interface SteamGame {
  name: string;
    playtime_forever: number; // minutes
}

interface RoastResponse {
  success: boolean;
  roast?: string;
  tier?: "light" | "medium" | "brutal";
  error?: string;
}

// Convert minutes to human-readable format
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

// Calculate backlog (games with < 1 hour played)
function calculateBacklog(games: SteamGame[]): number {
  return games.filter((g) => g.playtime_forever < 60).length;
}

// Find the most played game
function getMostPlayed(games: SteamGame[]): SteamGame | null {
  if (games.length === 0) return null;
  return games.reduce((max, game) => 
    game.playtime_forever > max.playtime_forever ? game : max
    );
}

// Calculate total playtime
function getTotalPlaytime(games: SteamGame[]): number {
  return games.reduce((sum, game) => sum + game.playtime_forever, 0);
}

export async function generateRoast(
  games: SteamGame[],
  tier: "light" | "medium" | "brutal" = "medium"
): Promise<RoastResponse> {
  try {
    const mostPlayed = getMostPlayed(games);
    const totalPlaytime = getTotalPlaytime(games);
        const backlog = calculateBacklog(games);
    const totalGames = games.length;

    // Build the prompt based on tier
    const tierInstructions: Record<string, string> = {
      light: "Be gentle and playful. Soft teasing, like a friend poking fun. Keep it lighthearted and encouraging.",
      medium: "Be witty and sarcastic. Roast them like a good friend who knows their habits. Call out the absurdity but keep it fun.",
      brutal: "Be absolutely savage. No mercy. Tear apart their life choices, their backlog shame, their addiction to one game. Make them question their existence. Hilariously cruel.",
    };

    const prompt = `You are a comedy roast writer specializing in video game addiction and Steam library shaming.

STEAM LIBRARY DATA:
- Total games owned: ${totalGames}
- Total time played: ${formatTime(totalPlaytime)}
- Games never played (backlog): ${backlog}
- Most played game: ${mostPlayed?.name || "None"} (${formatTime(mostPlayed?.playtime_forever || 0)})

ROAST STYLE: ${tierInstructions[tier]}

Write a short, punchy roast (2-4 sentences max) about this person's Steam library. Focus on the most embarrassing or absurd details. Be funny, not mean-spirited. Make it shareable.

Roast:`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://steam-roaster.vercel.app", // Replace with your domain
                "X-Title": "Steam Library Roaster",
      },
      body: JSON.stringify({
        model: "arcee-ai/trinity-large-preview:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });
        if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    const roast = data.choices?.[0]?.message?.content?.trim();

    if (!roast) {
      throw new Error("No roast generated");
    }

    return {
      success: true,
      roast,
            tier,
    };
  } catch (error) {
    console.error("Roast generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate roast",
    };
  }
}