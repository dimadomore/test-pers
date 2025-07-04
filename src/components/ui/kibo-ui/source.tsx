"use client";

import { BookIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type AISourcesProps = ComponentProps<"div">;

export const AISources = ({ ...props }: AISourcesProps) => (
  <Collapsible
    className={cn("not-prose mb-4 text-primary text-xs")}
    {...props}
  />
);

export type AISourcesTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  count: number;
};

export const AISourcesTrigger = ({
  count,
  children,
  ...props
}: AISourcesTriggerProps) => (
  <CollapsibleTrigger className="flex items-center gap-2" {...props}>
    {children ?? (
      <>
        <p className="font-medium">Used {count} sources</p>
        <ChevronDownIcon className="h-4 w-4" />
      </>
    )}
  </CollapsibleTrigger>
);

export type AISourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const AISourcesContent = ({ ...props }: AISourcesContentProps) => (
  <CollapsibleContent className={cn("mt-3 flex flex-col gap-2")} {...props} />
);

export type AISourceProps = ComponentProps<"a">;

export const AISource = ({
  href,
  title,
  children,
  ...props
}: AISourceProps) => (
  <a
    className="flex items-center gap-2"
    href={href}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    {children ?? (
      <>
        <BookIcon className="h-4 w-4" />
        <span className="block font-medium">{title}</span>
      </>
    )}
  </a>
);
