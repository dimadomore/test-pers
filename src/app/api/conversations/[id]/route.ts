import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// @ts-expect-error Next.js does not provide a type for context
export async function GET(request: NextRequest, context) {
  try {
    const { id } = await context.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        createdAt: conversation.createdAt.toISOString(),
        messages: conversation.messages,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// @ts-expect-error Next.js does not provide a type for context
export async function DELETE(request: NextRequest, context) {
  try {
    const { id } = await context.params;

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Delete messages first if onDelete cascade is not set in Prisma
    await prisma.message.deleteMany({ where: { conversationId: id } });
    await prisma.conversation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
