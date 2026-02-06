import { NextRequest, NextResponse } from "next/server";
import { generateRoast } from "@/app/services/openrouter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { games, tier = "medium" } = body;

    if (!games || !Array.isArray(games) || games.length === 0) {
      return NextResponse.json(
        { success: false, error: "Games data is required" },
        { status: 400 }
      );
    }
        // Validate tier
    const validTiers = ["light", "medium", "brutal"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { success: false, error: "Invalid tier. Use: light, medium, or brutal" },
        { status: 400 }
      );
    }

    const result = await generateRoast(games, tier as "light" | "medium" | "brutal");

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
              );
    }

    return NextResponse.json({
      success: true,
      roast: result.roast,
      tier: result.tier,
    });
  } catch (error) {
    console.error("Roast API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}