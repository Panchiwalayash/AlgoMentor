"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { ActiveRoom } from "./ActiveRoom";
import { useConversations } from "../lib/hooks/useConversations";
import { useRouter } from "next/navigation";
import { VoiceTutorProps } from "@/lib/types";

const TOTAL_DAYS = 1;

export const VoiceAITutor: React.FC<VoiceTutorProps> = ({
  courseId,
  isCourseMode,
  selectedDay,
}) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isStoring, setIsStoring] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const { conversations, resetConversations, addConversation } =
    useConversations();

  const storeConversations = async (items: typeof conversations) => {
    if (items.length === 0) return;

    try {
      setIsStoring(true);
      const response = await fetch("/api/store-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversations: items,
          selectedDay,
          courseId,
        }),
      });
      if (!response.ok) throw new Error("Failed to store conversations");
    } catch (error) {
      console.error("Error storing conversations:", error);
    } finally {
      setIsStoring(false);
    }
  };

  useEffect(() => {
    if (!isReset) return;

    const timer = setTimeout(async () => {
      if (isCourseMode) {
        await storeConversations(conversations);
      }
      setToken(null);
      setUrl(null);
      resetConversations();
      setIsReset(false);
      router.push(isCourseMode ? "/course" : "/");
    }, 200);

    return () => clearTimeout(timer);
  }, [isReset, conversations]);

  useEffect(() => {
    if (!isCourseMode) startSession();
    else startCourseSession();
  }, []);

  const startSession = async () => {
    try {
      const response = await fetch("/api/token");
      const data = await response.json();
      setToken(data.accessToken);
      setUrl(data.url);
    } catch (error) {
      console.error("Failed to get token:", error);
    }
  };

  const startCourseSession = async () => {
    try {
      const response = await fetch(
        `/api/course?courseId=${courseId}&day=${selectedDay}&total_days=${TOTAL_DAYS}`
      );
      const data = await response.json();
      setToken(data.accessToken);
      setUrl(data.url);
    } catch (error) {
      console.error("Failed to get token:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full px-4 pb-8 pt-2">
      {token == null ? (
        <div className="flex flex-1 items-center justify-center min-h-[420px]">
          <div className="flex flex-col items-center gap-4">
            <div className="voice-orb-loading" />
            <p className="text-slate-300 font-medium">Connecting to AlgoMentor…</p>
            <p className="text-slate-500 text-sm">Setting up your voice session</p>
          </div>
        </div>
      ) : (
        <LiveKitRoom
          token={token}
          serverUrl={url!}
          connectOptions={{ autoSubscribe: true }}
          className="flex flex-1 flex-col min-h-[calc(100vh-120px)]"
        >
          <ActiveRoom
            courseId={courseId}
            addConversation={addConversation}
            isCourseMode={isCourseMode}
            selectedDay={selectedDay}
            isReset={isReset}
            setIsRest={setIsReset}
            conversations={conversations}
            onEndSession={() => setIsReset(true)}
            isStoring={isStoring}
          />
        </LiveKitRoom>
      )}
    </div>
  );
};
