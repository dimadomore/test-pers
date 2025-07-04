"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Try to get existing conversations
        const response = await fetch("/api/conversations", {
          method: "GET",
        });

        if (response.ok) {
          const data: ConversationsResponse = await response.json();

          if (data.conversations && data.conversations.length > 0) {
            // Redirect to the most recent conversation
            const latestConversation = data.conversations[0];
            router.replace(`/chat/${latestConversation.id}`);
          } else {
            // No conversations exist, create a new one
            const createResponse = await fetch("/api/conversations", {
              method: "POST",
            });

            if (createResponse.ok) {
              const createData = await createResponse.json();
              router.replace(`/chat/${createData.conversation.id}`);
            } else {
              console.error("Failed to create new conversation");
            }
          }
        } else {
          console.error("Failed to fetch conversations");
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };

    handleRedirect();
  }, [router]);

  // Loading state while redirecting
  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full h-screen py-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          🎬 Setting up your movie chat...
        </div>
      </div>
    </div>
  );
}
