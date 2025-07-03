import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const prisma = new PrismaClient();

// TODO: Move to env
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_API_URL = "https://api.themoviedb.org/3/movie/changes";

type TMDBChangeResponse = {
  results?: { id: number }[];
};

async function fetchMovieRecommendations(): Promise<string> {
  // Example: fetch latest movie changes as a placeholder for recommendations
  const res = await fetch(`${TMDB_API_URL}?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch from TMDB");
  const data: TMDBChangeResponse = await res.json();
  // For demo, just return a stringified list of movie IDs
  const ids =
    data.results
      ?.slice(0, 3)
      .map((m: { id: number }) => m.id)
      .join(", ") || "No movies found";
  return `Recommended movie IDs: ${ids}`;
}

async function fetchOpenAIResponse(
  userMessage: string,
  model: string
): Promise<string> {
  const { text } = await generateText({
    model: openai(model),
    system:
      "You are a helpful AI movie assistant. Recommend movies or answer movie-related questions.",
    prompt: userMessage,
    maxTokens: 256,
  });
  return text || "Sorry, I couldn't generate a response.";
}

export async function POST(req: NextRequest) {
  const { message, model } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Get or create the single conversation
  let conversation = await prisma.conversation.findFirst({});
  if (!conversation) {
    conversation = await prisma.conversation.create({ data: {} });
  }

  // Store user message
  await prisma.message.create({
    data: {
      role: "user",
      content: message,
      conversationId: conversation.id,
    },
  });

  // Get agent response from TMDB or OpenAI
  let agentResponse = "";
  try {
    if (model && model.startsWith("gpt")) {
      agentResponse = await fetchOpenAIResponse(message, model);
    } else {
      agentResponse = await fetchMovieRecommendations();
    }
  } catch {
    agentResponse = "Sorry, I could not fetch a response right now.";
  }

  // Store agent message
  await prisma.message.create({
    data: {
      role: "agent",
      content: agentResponse,
      conversationId: conversation.id,
    },
  });

  // Return all messages in the conversation
  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
