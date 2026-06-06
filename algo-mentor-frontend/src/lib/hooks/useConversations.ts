import { useState, useCallback } from "react";
import { Conversation, Speaker } from "@/lib/types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const addConversation = useCallback((speaker: Speaker, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setConversations((prev) => {
      const last = prev[prev.length - 1];
      if (last?.speaker === speaker && last.message === trimmed) {
        return prev;
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
