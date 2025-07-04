"use client";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/components/ui/kibo-ui/input";
import { SendIcon } from "lucide-react";
import { type FormEventHandler, useState } from "react";

export const UserPrompt = ({
  onSubmit,
}: {
  onSubmit: (text: string) => void;
}) => {
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    onSubmit(text);
    setText("");
    setStatus("submitted");
    setTimeout(() => {
      setStatus("streaming");
    }, 200);
    setTimeout(() => {
      setStatus("ready");
    }, 2000);
  };

  return (
    <AIInput onSubmit={handleSubmit} className="p-2">
      <AIInputTextarea
        onChange={(e) => setText(e.target.value)}
        value={text}
        placeholder="How can I help you?"
      />
      <AIInputToolbar>
        <AIInputTools>
          {/* <AIInputButton>
            <MicIcon size={16} />
          </AIInputButton> */}
        </AIInputTools>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          Shift+Enter{" "}
          <AIInputSubmit status={status} disabled={!text}>
            <SendIcon size={16} />
          </AIInputSubmit>
        </div>
      </AIInputToolbar>
    </AIInput>
  );
};
