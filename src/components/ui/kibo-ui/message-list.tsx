import { memo, useEffect, useRef } from "react";
import { AIMessage, AIMessageContent } from "./message";
import { Bot, User } from "lucide-react";

export interface Message {
  id: string;
  from: "user" | "assistant";
  content: string;
  avatarSrc?: string;
  name?: string;
}

export interface MessageListProps {
  messages: Message[];
}

export const MessageList = memo(function MessageList({
  messages,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-2 w-full h-full overflow-y-auto"
    >
      {messages.map((msg) => {
        const isUser = msg.from === "user";
        const isAssistant = msg.from === "assistant";

        return (
          <div
            key={msg.id}
            className={`flex w-full items-center gap-4 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isUser && <Bot className="w-8 h-8 text-muted-foreground" />}
            <AIMessage from={msg.from}>
              <AIMessageContent isMarkdown={isAssistant}>
                {msg.content}
              </AIMessageContent>
            </AIMessage>
            {isUser && <User className="w-8 h-8 text-muted-foreground" />}
          </div>
        );
      })}
    </div>
  );
});
