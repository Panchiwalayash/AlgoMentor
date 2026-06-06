import { useState, useCallback } from "react";
import { Conversation } from "../types";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const addConversation = useCallback((speaker: string, message: string) => {
    if (!message.trim()) return;
    setConversations((prev) => {
      return [
        ...prev,
        {
          speaker,
          message: message.trim(),
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
};
