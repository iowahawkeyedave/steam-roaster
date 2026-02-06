import { NextRequest, NextResponse } from "next/server";
import { getSteamLibrary } from "@/app/services/steam";

export async function POST(request: NextRequest) {
  try {
        const body = await request.json();
    const { steamId } = body;

    if (!steamId || typeof steamId !== "string") {
      return NextResponse.json(
        { success: false, error: "Steam ID is required" },
        { status: 400 }
      );
    }

    // Basic Steam ID validation (should be 17 digits)
    if (!/^\d{17}$/.test(steamId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Steam ID format" },
        { status: 400 }
              );
    }

    const result = await getSteamLibrary(steamId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      games: result.games,
            totalGames: result.games?.length || 0,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}