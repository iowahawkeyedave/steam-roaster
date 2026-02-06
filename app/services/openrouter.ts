// Service to generate roasts using OpenRouter AI

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is required");
}
interface SteamGame {
  name: string;
  playtime_forever: number;
}

interface RoastResponse {
  success: boolean;
  roast?: string;
  tier?: "light" | "medium" | "brutal";
  error?: string;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

function calculateBacklog(games: SteamGame[]): number {
  return games.filter((g) => g.playtime_forever < 60).length;
}

function getMostPlayed(games: SteamGame[]): SteamGame | null {
  if (games.length === 0) return null;
  return games.reduce((max, game) => 
    game.playtime_forever > max.playtime_forever ? game : max
  );
}
function getTotalPlaytime(games: SteamGame[]): number {
  return games.reduce((sum, game) => sum + game.playtime_forever, 0);
}

// Fallback roasts if API fails
const fallbackRoasts: Record<string, string[]> = {
  light: [
    "Your Steam library is like a buffet where you only eat the bread rolls. So much potential, so little follow-through!",
    "You've got {totalGames} games and {backlog} unplayed. It's not a collection, it's a museum of good intentions.",
    "{mostPlayed}? Solid choice! The other {backlog} games are just... waiting for their moment. Any day now.",
  ],
  medium: [
    "You've spent {totalTime} on Steam. {mostPlayed} got {mostPlayedTime} of that. The other {totalGames} games? Just digital decoration at this point.",
    "{backlog} unplayed games. That's not a backlog, that's a graveyard of sales you couldn't resist. RIP your wallet.",
        "You own {totalGames} games but only play one. It's not a library, it's a shrine to {mostPlayed}.",
  ],
  brutal: [
    "{totalGames} games. {totalTime} played. {backlog} unplayed. You've spent more time buying games than playing them. Steam sales are your kryptonite and your bank account hates you.",
    "Your most played game is {mostPlayed} at {mostPlayedTime}. Everything else? Digital dust collectors. You've turned Steam into an expensive screensaver.",
    "{backlog} games unplayed. That's not a backlog, that's a monument to your inability to finish what you start. Your Steam library is a museum of shame.",
  ],
};

function getFallbackRoast(games: SteamGame[], tier: "light" | "medium" | "brutal"): string {
  const mostPlayed = getMostPlayed(games);
  const totalPlaytime = getTotalPlaytime(games);
  const backlog = calculateBacklog(games);
  const totalGames = games.length;
    const roasts = fallbackRoasts[tier];
  const roast = roasts[Math.floor(Math.random() * roasts.length)];

  return roast
    .replace("{totalGames}", String(totalGames))
    .replace("{backlog}", String(backlog))
    .replace("{totalTime}", formatTime(totalPlaytime))
    .replace("{mostPlayed}", mostPlayed?.name || "nothing")
    .replace("{mostPlayedTime}", formatTime(mostPlayed?.playtime_forever || 0));
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

    const tierInstructions: Record<string, string> = {
      light: "Be gentle and playful. Soft teasing, like a friend poking fun.",
      medium: "Be witty and sarcastic. Roast them like a good friend.",
      brutal: "Be absolutely savage. No mercy. Hilariously cruel.",
    };

    const prompt = `You are a comedy roast writer. Write a short, punchy roast (2 sentences max) about this Steam library:

- Total games: ${totalGames}
- Total playtime: ${formatTime(totalPlaytime)}
- Unplayed games: ${backlog}
- Most played: ${mostPlayed?.name || "None"} (${formatTime(mostPlayed?.playtime_forever || 0)})

Style: ${tierInstructions[tier]}

Roast:`;

    // Try multiple models in order of preference
    const models = [
      "arcee-ai/trinity-large-preview:free",
      "mistralai/mistral-7b-instruct:free",
      "google/gemma-2-9b-it:free",
    ];
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Steam Library Roaster",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
                        max_tokens: 150,
            temperature: 0.8,
          }),
        });

        // Log the raw response for debugging
        const responseText = await response.text();
        console.log(`Response from ${model}:`, responseText.substring(0, 200));

        if (!response.ok) {
          console.log(`Model ${model} failed with status ${response.status}`);
          continue; // Try next model
        }

        let data;
                try {
          data = JSON.parse(responseText);
        } catch {
          console.log(`Model ${model} returned invalid JSON`);
          continue; // Try next model
        }

        const roast = data.choices?.[0]?.message?.content?.trim();

        if (roast && roast.length > 10) {
          return {
            success: true,
            roast,
            tier,
          };
                  }
      } catch (modelError) {
        console.log(`Model ${model} error:`, modelError);
        continue; // Try next model
      }
    }

    // All models failed, use fallback
    console.log("All models failed, using fallback roast");
    return {
      success: true,
      roast: getFallbackRoast(games, tier),
      tier,
    };
      } catch (error) {
    console.error("Roast generation error:", error);
    // Return fallback on any error
    return {
      success: true,
      roast: getFallbackRoast(games, tier),
      tier,
    };
  }
}