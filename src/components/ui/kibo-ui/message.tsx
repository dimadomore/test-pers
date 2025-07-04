import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { AIResponse } from "./response";

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end gap-2 py-4",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end",
      "[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
);

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement> & {
  isMarkdown?: boolean;
};

export const AIMessageContent = ({
  children,
  className,
  isMarkdown = false,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 rounded-lg px-4 py-3 text-sm",
      "bg-muted text-foreground",
      "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <div className="is-user:dark">
      {isMarkdown && typeof children === "string" ? (
        <AIResponse className="text-inherit [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm [&>h4]:text-sm [&>h5]:text-xs [&>h6]:text-xs [&>h1]:mt-3 [&>h2]:mt-3 [&>h3]:mt-2 [&>h4]:mt-2 [&>h5]:mt-1 [&>h6]:mt-1 [&>h1]:mb-1 [&>h2]:mb-1 [&>h3]:mb-1 [&>h4]:mb-1 [&>h5]:mb-1 [&>h6]:mb-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </AIResponse>
      ) : (
        children
      )}
    </div>
  </div>
);

export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
