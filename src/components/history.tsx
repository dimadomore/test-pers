"use client";
import * as React from "react";
import { SidebarContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { PlusIcon, MessageSquareIcon } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

// Placeholder data for now
const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Movie recommendations",
    createdAt: "2024-07-03T12:00:00Z",
  },
  {
    id: "2",
    title: "Oscar winners",
    createdAt: "2024-07-02T15:30:00Z",
  },
];

export const History = React.memo(function History() {
  // In a real app, fetch conversations from API or context
  const [conversations] = React.useState<Conversation[]>(mockConversations);

  const handleNewChat = React.useCallback(() => {
    // TODO: Implement new chat creation logic
    // For now, just log
    // In a real app, this would create a new conversation and navigate to it
    // setConversations([...conversations, ...])
    // router.push(`/chat/${newId}`)
    // etc.
    // eslint-disable-next-line no-console
    console.log("New chat");
  }, []);

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
        {conversations.map((conv) => (
          <SidebarMenuItem key={conv.id}>
            <SidebarMenuButton className="flex items-center gap-2 w-full">
              <MessageSquareIcon className="size-4 text-muted-foreground" />
              <span className="truncate">{conv.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
});
