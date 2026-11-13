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

      // Prevent duplicate or progressive chunk fragmentation
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        const lastMsg = last.message.trim().toLowerCase();
        const newMsg = trimmed.toLowerCase();

        // 1. Exact duplicate
        if (lastMsg === newMsg) {
          return prev;
        }

        // 2. The new message is an extension/continuation of the previous message
        // (common with streaming STT/TTS transcript segments)
        if (newMsg.startsWith(lastMsg) || newMsg.includes(lastMsg)) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            message: trimmed,
            timestamp: new Date().toISOString(),
          };
          lastTimestampRef.current = now;
          return updated;
        }

        // 3. The new message is shorter/contained in the previous message
        if (lastMsg.startsWith(newMsg) || lastMsg.includes(newMsg)) {
          return prev;
        }
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
