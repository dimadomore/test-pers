import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format conversations with titles based on first user message
    const formattedConversations = conversations.map((conv) => {
      const firstUserMessage = conv.messages.find((msg) => msg.role === "user");
      let title = "New Chat";

      if (firstUserMessage) {
        // Generate a more readable title
        const content = firstUserMessage.content.trim();
        if (content.length > 50) {
          title = content.slice(0, 47) + "...";
        } else {
          title = content;
        }
      }

      return {
        id: conv.id,
        title,
        createdAt: conv.createdAt.toISOString(),
        messageCount: conv._count.messages,
      };
    });

    return NextResponse.json({
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const conversation = await prisma.conversation.create({
      data: {},
    });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: "New Chat",
        createdAt: conversation.createdAt.toISOString(),
        messageCount: 0,
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
