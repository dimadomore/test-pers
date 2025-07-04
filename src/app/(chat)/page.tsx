"use client";
import { useState, useEffect } from "react";
import { UserPrompt } from "@/components/ui/user-prompt";
import { MessageList, Message } from "@/components/ui/kibo-ui/message-list";

interface ApiMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
}

interface ApiResponse {
  messages: ApiMessage[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load existing conversation on mount
  useEffect(() => {
    const loadExistingConversation = async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "GET",
        });

        if (response.ok) {
          const data: ApiResponse = await response.json();
          if (data.messages) {
            const formattedMessages: Message[] = data.messages.map((msg) => ({
              id: msg.id || `${msg.createdAt}-${msg.role}`,
              from: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadExistingConversation();
  }, []);

  const handleSubmit = async (text: string) => {
    const userMsg: Message = {
      id: `${Date.now()}-user`,
      from: "user",
      content: text,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data: ApiResponse = await response.json();

      // Update with all messages from the API response
      if (data.messages) {
        const formattedMessages: Message[] = data.messages.map((msg) => ({
          id: msg.id || `${msg.createdAt}-${msg.role}`,
          from: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      const errorMsg: Message = {
        id: `${Date.now()}-error`,
        from: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col max-w-4xl mx-auto w-full h-screen py-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            🎬 Loading your movie conversation...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full h-screen py-8">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-xl font-semibold mb-2">
              Welcome to Movie Chat!
            </h2>
            <p className="text-muted-foreground mb-4">
              Ask me for movie recommendations, search for specific films, or
              discover trending movies.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Try asking:</p>
              <ul className="mt-2 space-y-1">
                <li>&ldquo;Show me trending movies&rdquo;</li>
                <li>&ldquo;Recommend some action movies&rdquo;</li>
                <li>&ldquo;Movies with Tom Hanks&rdquo;</li>
                <li>&ldquo;Best sci-fi movies from 2023&rdquo;</li>
              </ul>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        {isLoading && (
          <div className="flex justify-start items-center gap-4 p-4">
            <div className="animate-pulse">
              🤔 Finding perfect movies for you...
            </div>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 z-10 bg-background p-2">
        <UserPrompt onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
