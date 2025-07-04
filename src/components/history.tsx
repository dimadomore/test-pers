"use client";
import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { SidebarContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { PlusIcon, MessageSquareIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

export const History = React.memo(function History() {
  const router = useRouter();
  const params = useParams();
  const currentConversationId = params.conversationId as string;

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Load conversations on mount
  React.useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await fetch("/api/conversations", {
          method: "GET",
        });

        if (response.ok) {
          const data: ConversationsResponse = await response.json();
          setConversations(data.conversations || []);
        } else {
          console.error("Failed to fetch conversations");
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  const handleNewChat = React.useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        const newConversation = data.conversation;

        // Add new conversation to the list
        setConversations((prev) => [newConversation, ...prev]);

        // Navigate to the new conversation
        router.push(`/chat/${newConversation.id}`);
      } else {
        console.error("Failed to create new conversation");
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  }, [router]);

  const handleConversationClick = React.useCallback(
    (conversationId: string) => {
      if (conversationId !== currentConversationId) {
        router.push(`/chat/${conversationId}`);
      }
    },
    [router, currentConversationId]
  );

  const handleDelete = React.useCallback(
    async (conversationId: string) => {
      setDeletingId(conversationId);
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setConversations((prev) =>
            prev.filter((c) => c.id !== conversationId)
          );
          // If the deleted conversation is open, redirect to root
          if (conversationId === currentConversationId) {
            router.push("/");
          }
        }
      } finally {
        setDeletingId(null);
      }
    },
    [currentConversationId, router]
  );

  if (isLoading) {
    return (
      <SidebarContent className="gap-2 p-2">
        <Button
          className="w-full mb-2 flex items-center gap-2"
          variant="outline"
          disabled
        >
          <PlusIcon className="size-4" />
          <span>New Chat</span>
        </Button>
        <div className="flex items-center justify-center py-4">
          <div className="animate-pulse text-muted-foreground text-sm">
            Loading conversations...
          </div>
        </div>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent className="gap-2 p-2">
      <Button
        className="w-full mb-2 flex items-center gap-2"
        variant="outline"
        onClick={handleNewChat}
      >
        <PlusIcon className="size-4" />
        <span>New Chat</span>
      </Button>
      <SidebarMenu>
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquareIcon className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <SidebarMenuItem key={conv.id} className="relative group">
              <SidebarMenuButton
                className={cn(
                  "flex items-center gap-2 w-full pr-10", // space for trash icon
                  conv.id === currentConversationId
                    ? "bg-accent text-accent-foreground"
                    : ""
                )}
                onClick={() => handleConversationClick(conv.id)}
                disabled={deletingId === conv.id}
              >
                <MessageSquareIcon className="size-4 text-muted-foreground" />
                <span className="truncate">{conv.title}</span>
              </SidebarMenuButton>
              {/* Trash icon - delete immediately on click */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1"
                  aria-label="Delete conversation"
                  disabled={deletingId === conv.id}
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conv.id);
                  }}
                >
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarContent>
  );
});
