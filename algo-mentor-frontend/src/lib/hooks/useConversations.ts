import { useState, useCallback, useRef } from "react";
import { Conversation, Speaker } from "@/lib/types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const lastSpeakerRef = useRef<Speaker | null>(null);
  const lastTimestampRef = useRef<number>(0);

  const addConversation = useCallback((speaker: Speaker, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setConversations((prev) => {
      const now = Date.now();

      // Prevent immediate duplicate if exact same message is emitted twice
      const last = prev[prev.length - 1];
      if (
        last &&
        last.speaker === speaker &&
        last.message.trim().toLowerCase() === trimmed.toLowerCase()
      ) {
        return prev;
      }

      lastSpeakerRef.current = speaker;
      lastTimestampRef.current = now;

      // Strictly append-only: once a message is added, it is final and never mutated
      return [
        ...prev,
        {
          speaker,
          message: trimmed,
          timestamp: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const resetConversations = useCallback(() => {
    lastSpeakerRef.current = null;
    lastTimestampRef.current = 0;
    setConversations([]);
  }, []);

  return {
    conversations,
    addConversation,
    resetConversations,
  };
}
