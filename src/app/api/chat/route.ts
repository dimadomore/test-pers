import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { movieAgent } from "@/lib/mastra";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { message } = await req.json();
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

export async function GET() {
  try {
    // Get the single conversation
    const conversation = await prisma.conversation.findFirst({});

    if (!conversation) {
      // No conversation exists yet, return empty array
      return NextResponse.json({ messages: [] });
    }

    // Return all messages in the conversation
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
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
