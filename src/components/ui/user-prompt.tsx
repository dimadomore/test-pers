"use client";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/components/ui/kibo-ui/ai/input";
import { MicIcon, SendIcon } from "lucide-react";
import { type FormEventHandler, useState } from "react";

export const UserPrompt = () => {
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text) {
      return;
    }
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
          <AIInputButton>
            <MicIcon size={16} />
          </AIInputButton>
        </AIInputTools>
        <AIInputSubmit status={status} disabled={!text}>
          <SendIcon size={16} />
        </AIInputSubmit>
      </AIInputToolbar>
    </AIInput>
  );
};
