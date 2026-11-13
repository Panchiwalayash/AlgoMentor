import { useState, useCallback } from "react";
import { Conversation, Speaker } from "@/lib/types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const addConversation = useCallback((speaker: Speaker, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setConversations((prev) => {
      const last = prev[prev.length - 1];

      // Defensive check: if extension or exact match from same speaker, update in-place
      if (last && last.speaker === speaker) {
        const lastMsg = last.message.trim().toLowerCase();
        const newMsg = trimmed.toLowerCase();

        if (lastMsg === newMsg) return prev;
        if (newMsg.startsWith(lastMsg) || newMsg.includes(lastMsg)) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            message: trimmed,
            timestamp: new Date().toISOString(),
          };
          return updated;
        }
        if (lastMsg.startsWith(newMsg) || lastMsg.includes(newMsg)) return prev;
      }

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
    setConversations([]);
  }, []);

  return {
    conversations,
    addConversation,
    resetConversations,
  };
}
