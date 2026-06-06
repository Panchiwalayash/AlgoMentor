"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { useRouter } from "next/navigation";
import { ActiveRoom } from "@/components/ActiveRoom";
import { useConversations } from "@/lib/hooks/useConversations";
import { Conversation, VoiceTutorProps } from "@/lib/types";
import "@/styles/activeRoom.css";

const TOTAL_DAYS = 1;

async function fetchSessionToken(courseId?: string) {
  const params = new URLSearchParams();
  if (courseId) {
    params.set("courseId", courseId);
    params.set("total_days", String(TOTAL_DAYS));
  }

  const response = await fetch(`/api/course?${params}`);
  const data = await response.json();

  if (!response.ok || !data.accessToken || !data.url) {
    throw new Error("Invalid token response");
  }

  return data as { accessToken: string; url: string };
}

export function VoiceAITutor({
  courseId,
  isCourseMode,
  selectedDay,
}: VoiceTutorProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isStoring, setIsStoring] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const { conversations, resetConversations, addConversation } =
    useConversations();

  const storeConversations = async (items: Conversation[]) => {
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
    } catch {
      setSessionError("Could not save your session. Please try again.");
    } finally {
      setIsStoring(false);
    }
  };

  const startSession = async () => {
    setIsStarting(true);
    setSessionError(null);

    try {
      const session = await fetchSessionToken(isCourseMode ? courseId : undefined);
      setToken(session.accessToken);
      setUrl(session.url);
    } catch {
      setSessionError(
        "Could not start the voice session. Check LiveKit keys in .env.local and make sure the agent is running."
      );
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    startSession();
  }, []);

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
      router.push("/course");
    }, 200);

    return () => clearTimeout(timer);
  }, [isReset, conversations]);

  if (sessionError) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[420px] px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-red-400 font-medium">{sessionError}</p>
          <button
            type="button"
            onClick={startSession}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isStarting || token == null) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[420px]">
        <div className="flex flex-col items-center gap-4">
          <div className="voice-orb-loading" />
          <p className="text-slate-300 font-medium">Connecting to AlgoMentor…</p>
          <p className="text-slate-500 text-sm">Setting up your voice session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full h-[calc(100vh-3.5rem)] min-h-0 px-4 pb-4 pt-2">
      <LiveKitRoom
        token={token}
        serverUrl={url!}
        connectOptions={{ autoSubscribe: true }}
        className="flex flex-1 flex-col min-h-0 h-full"
      >
        <ActiveRoom
          courseId={courseId}
          addConversation={addConversation}
          isCourseMode={isCourseMode}
          isReset={isReset}
          conversations={conversations}
          onEndSession={() => setIsReset(true)}
          isStoring={isStoring}
        />
      </LiveKitRoom>
    </div>
  );
}
