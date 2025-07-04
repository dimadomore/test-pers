import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { movieAgent } from "@/lib/mastra";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { message, conversationId } = await req.json();
  if (!message || !conversationId) {
    return NextResponse.json(
      {
        error: "Message and conversationId are required",
      },
      { status: 400 }
    );
  }

  // Verify conversation exists
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json(
      {
        error: "Conversation not found",
      },
      { status: 404 }
    );
  }

  // Store user message
  await prisma.message.create({
    data: {
      role: "user",
      content: message,
      conversationId: conversationId,
    },
  });

  let agentResponse = "";
  try {
    // Use Mastra movie agent
    const response = await movieAgent.generate([
      {
        role: "user",
        content: message,
      },
    ]);

    agentResponse =
      response.text || "I'm sorry, I couldn't process your request right now.";
  } catch (error) {
    console.error("Mastra agent error:", error);
    agentResponse = `## 🚫 Service Temporarily Unavailable

I'm having trouble connecting to the movie database right now.

**Please try:**
- Refreshing the page
- Trying a simpler query
- Asking again in a moment

*I'll be back up and running soon!* 🎬`;
  }

  // Store agent message
  await prisma.message.create({
    data: {
      role: "agent",
      content: agentResponse,
      conversationId: conversationId,
    },
  });

  // Return all messages in the conversation
  const messages = await prisma.message.findMany({
    where: { conversationId: conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        {
          error: "conversationId is required",
        },
        { status: 400 }
      );
    }

    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          error: "Conversation not found",
        },
        { status: 404 }
      );
    }

    // Return all messages in the conversation
    const messages = await prisma.message.findMany({
      where: { conversationId: conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}
