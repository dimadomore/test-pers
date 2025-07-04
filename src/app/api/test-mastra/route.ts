import { NextRequest, NextResponse } from "next/server";
import { movieAgent } from "@/lib/mastra";
import {
  searchMoviesTool,
  trendingMoviesTool,
  movieGenresTool,
} from "@/lib/mastra/tools";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const test = searchParams.get("test") || "agent";

  try {
    switch (test) {
      case "agent":
        // Test the full agent
        const agentResponse = await movieAgent.generate([
          {
            role: "user",
            content: "Show me some trending movies",
          },
        ]);
        return NextResponse.json({
          test: "agent",
          success: true,
          response: agentResponse.text,
        });

      case "search":
        // Test search tool directly
        const searchResult = await searchMoviesTool.execute({
          context: { query: "Avatar" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mastra: {} as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          runtimeContext: {} as any,
        });
        return NextResponse.json({
          test: "search",
          success: true,
          result: searchResult,
        });

      case "trending":
        // Test trending tool directly
        const trendingResult = await trendingMoviesTool.execute({
          context: {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mastra: {} as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          runtimeContext: {} as any,
        });
        return NextResponse.json({
          test: "trending",
          success: true,
          result: trendingResult,
        });

      case "genres":
        // Test genres tool directly
        const genresResult = await movieGenresTool.execute({
          context: {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mastra: {} as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          runtimeContext: {} as any,
        });
        return NextResponse.json({
          test: "genres",
          success: true,
          result: genresResult,
        });

      default:
        return NextResponse.json({
          error: "Invalid test parameter",
          availableTests: ["agent", "search", "trending", "genres"],
        });
    }
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({
      test,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
