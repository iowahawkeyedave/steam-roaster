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
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function formatTimeVerbose(minutes: number): string {
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

function getTopGames(games: SteamGame[], count: number = 5): SteamGame[] {
  return [...games]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, count);
}

function getTotalPlaytime(games: SteamGame[]): number {
  return games.reduce((sum, game) => sum + game.playtime_forever, 0);
}

function getPlayedGames(games: SteamGame[]): number {
  return games.filter(g => g.playtime_forever >= 60).length;
}

function getLibraryPersonality(games: SteamGame[]): string {
  const totalGames = games.length;
  const playedGames = getPlayedGames(games);
  const backlog = calculateBacklog(games);
  const mostPlayed = getMostPlayed(games);
  const totalPlaytime = getTotalPlaytime(games);
  
  if (!mostPlayed) return "empty";
  
  const mostPlayedPercent = (mostPlayed.playtime_forever / totalPlaytime) * 100;
  const avgPlaytime = totalPlaytime / totalGames;
  
  // Determine personality type
  if (mostPlayedPercent > 50) {
    return "hyperfocus";
  } else if (backlog / totalGames > 0.7) {
    return "collector";
  } else if (avgPlaytime < 120) {
    return "butterfly";
  } else if (playedGames / totalGames > 0.8) {
    return "completionist";
  } else {
    return "casual";
  }
}

// Fallback roasts if API fails
const fallbackRoasts: Record<string, Record<string, string[]>> = {
  light: {
    hyperfocus: [
      "You've spent {mostPlayedPercent}% of your gaming life in {mostPlayed}. The other {totalGames} games? Just there for moral support.",
      "{mostPlayed} is basically your second home. Those other games on your shelf are just decoration.",
    ],
    collector: [
      "Your Steam library has {totalGames} games and you've played {playedGames} of them. It's not a collection, it's a museum of good intentions!",
      "You've got {backlog} unplayed games sitting there. But hey, they look great on the digital shelf!",
    ],
    butterfly: [
      "You own {totalGames} games but average only {avgHours} hours each. It's not gaming, it's speed dating!",
      "Your library is like a tasting menu — small bites of everything, but nothing truly savored.",
    ],
    completionist: [
      "You've actually played {playedPercent}% of your {totalGames} games! You're a rare breed in the Steam world.",
      "Most people collect games. You actually *play* them. Respect.",
    ],
    casual: [
      "Your Steam library is perfectly balanced: some games beaten, some untouched, all loved in their own way.",
      "You've spent {totalTime} gaming across {totalGames} titles. A true digital Renaissance person!",
    ],
  },
  medium: {
    hyperfocus: [
      "{mostPlayed} has consumed {mostPlayedPercent}% of your {totalTime} gaming time. You don't have a library, you have a shrine with {totalGames} digital dust collectors.",
      "You've spent more time in {mostPlayed} than most people spend on their hobbies. Those other {totalGames} games? Expensive icons on your desktop.",
    ],
    collector: [
      "{backlog} unplayed games out of {totalGames}. Steam sales are your weakness and your library is the evidence. At least the icons look pretty!",
      "You own {totalGames} games but only touch {playedGames} of them. It's not a backlog, it's a graveyard of abandoned dreams.",
    ],
    butterfly: [
      "Your attention span is {avgHours} hours per game. You don't play games, you sample them like a buffet where you never finish your plate.",
      "{totalGames} games, {totalTime} total, but nothing sticks. Commitment issues? In this economy?",
    ],
    completionist: [
      "You've played {playedPercent}% of your library. While others collect dust, you actually finish what you start. Show-off.",
      "Most Steam users have {playedPercent}% unplayed. You? You've touched almost everything. Efficiency or obsession? You decide.",
    ],
    casual: [
      "You've got a healthy {totalGames} game collection with {totalTime} invested. Not obsessed, not neglectful — just a gamer who knows what they like.",
      "Some games beaten, some untouched, {totalTime} well spent. Your library tells a story of someone who actually enjoys gaming, not just hoarding.",
    ],
  },
  brutal: {
    hyperfocus: [
      "{mostPlayedPercent}% of your {totalTime} gaming life in ONE GAME. You own {totalGames} titles but you're basically a {mostPlayed} player with expensive digital wallpaper.",
      "Congratulations, you've turned a {totalGames}-game library into a single-game obsession. The other games aren't unplayed, they're UNWANTED.",
    ],
    collector: [
      "{backlog} UNPLAYED GAMES. You've spent more money on games you'll never touch than most people spend on actual hobbies. Steam sales own your wallet and your dignity.",
      "Your library is {playedPercent}% played, {unplayedPercent}% LIES YOU TOLD YOURSELF. 'I'll get to it someday' — no you won't. You're a digital hoarder with commitment issues.",
    ],
    butterfly: [
      "{avgHours} hours per game average. You don't play games, you abandon them. {totalGames} titles, {totalTime} wasted on introductions. FINISH SOMETHING FOR ONCE.",
      "Your gaming attention span is shorter than a TikTok video. {totalGames} games started, none mastered. You're not a gamer, you're a tourist.",
    ],
    completionist: [
      "You've played {playedPercent}% of your library, which means you've actually TOUCHED most of your shame pile. Is it dedication or an inability to stop? Seek help.",
      "While others buy games to ignore them, you actually FINISH them. What kind of monster are you? Do you finish your vegetables too?",
    ],
    casual: [
      "A perfectly balanced, utterly forgettable library. Not obsessed enough to be interesting, not neglected enough to be tragic. Just... there. Like oatmeal.",
      "{totalTime} across {totalGames} games. You've achieved the impossible: being completely unremarkable in your gaming habits. Congrats on the participation trophy.",
    ],
  },
};

function getFallbackRoast(games: SteamGame[], tier: "light" | "medium" | "brutal"): string {
  const mostPlayed = getMostPlayed(games);
  const totalPlaytime = getTotalPlaytime(games);
  const backlog = calculateBacklog(games);
  const totalGames = games.length;
  const playedGames = getPlayedGames(games);
  const personality = getLibraryPersonality(games);
  
  const avgHours = Math.floor(totalPlaytime / totalGames / 60);
  const playedPercent = Math.round((playedGames / totalGames) * 100);
  const unplayedPercent = 100 - playedPercent;
  const mostPlayedPercent = mostPlayed ? Math.round((mostPlayed.playtime_forever / totalPlaytime) * 100) : 0;
  
  const roasts = fallbackRoasts[tier][personality];
  const roast = roasts[Math.floor(Math.random() * roasts.length)];

  return roast
    .replace("{totalGames}", String(totalGames))
    .replace("{backlog}", String(backlog))
    .replace("{totalTime}", formatTimeVerbose(totalPlaytime))
    .replace("{mostPlayed}", mostPlayed?.name || "nothing")
    .replace("{mostPlayedTime}", formatTimeVerbose(mostPlayed?.playtime_forever || 0))
    .replace("{mostPlayedPercent}", String(mostPlayedPercent))
    .replace("{playedGames}", String(playedGames))
    .replace("{avgHours}", String(avgHours))
    .replace("{playedPercent}", String(playedPercent))
    .replace("{unplayedPercent}", String(unplayedPercent));
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
    const playedGames = getPlayedGames(games);
    const topGames = getTopGames(games, 5);
    const personality = getLibraryPersonality(games);
    
    const avgHours = Math.floor(totalPlaytime / totalGames / 60);
    const playedPercent = Math.round((playedGames / totalGames) * 100);
    const mostPlayedPercent = mostPlayed ? Math.round((mostPlayed.playtime_forever / totalPlaytime) * 100) : 0;

    const tierInstructions: Record<string, string> = {
      light: "Be gentle and playful. Soft teasing, like a friend poking fun. Keep it warm and funny.",
      medium: "Be witty and sarcastic. Good-natured roasting that stings a little but makes them laugh.",
      brutal: "Be absolutely savage. No mercy. Hilariously cruel but clever. Make it memorable.",
    };

    const personalityDescriptions: Record<string, string> = {
      hyperfocus: `This player spends ${mostPlayedPercent}% of their time in ONE GAME (${mostPlayed?.name}). Classic hyperfocus behavior.`,
      collector: `Huge backlog syndrome. Only ${playedPercent}% of their ${totalGames} games are played. Sales addict.`,
      butterfly: `Short attention span. Averages only ${avgHours} hours per game. Never commits to anything.`,
      completionist: `Rare breed! Actually plays their games. ${playedPercent}% completion rate. Suspiciously dedicated.`,
      casual: `Balanced gamer. Plays some, ignores some. Not obsessive, not neglectful.`,
    };

    const topGamesList = topGames
      .map((g, i) => `${i + 1}. ${g.name} (${formatTime(g.playtime_forever)})`)
      .join("\n");

    const prompt = `You are a comedy roast writer analyzing a Steam game library. Write ONE short, punchy roast (2-3 sentences max) about this person's gaming habits.

LIBRARY STATS:
- Total games: ${totalGames}
- Games actually played: ${playedGames} (${playedPercent}%)
- Unplayed games: ${backlog}
- Total playtime: ${formatTimeVerbose(totalPlaytime)}
- Average time per game: ${avgHours} hours

TOP 5 GAMES:
${topGamesList}

LIBRARY PERSONALITY: ${personality}
${personalityDescriptions[personality]}

MOST PLAYED: ${mostPlayed?.name} at ${formatTimeVerbose(mostPlayed?.playtime_forever || 0)} (${mostPlayedPercent}% of total time)

ROAST STYLE: ${tierInstructions[tier]}

Write a roast that:
1. References their library personality (${personality})
2. Mentions specific stats (don't just roast the #1 game)
3. Is funny and memorable
4. Stays within the ${tier} tone

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
            max_tokens: 200,
            temperature: 0.8,
          }),
        });

        const responseText = await response.text();
        console.log(`Response from ${model}:`, responseText.substring(0, 200));

        if (!response.ok) {
          console.log(`Model ${model} failed with status ${response.status}`);
          continue;
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          console.log(`Model ${model} returned invalid JSON`);
          continue;
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
        continue;
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
    return {
      success: true,
      roast: getFallbackRoast(games, tier),
      tier,
    };
  }
}
