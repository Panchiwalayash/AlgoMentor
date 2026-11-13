"use client";

import { useEffect, useState, useCallback } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { useRouter } from "next/navigation";
import { ActiveRoom } from "@/components/ActiveRoom";
import { useConversations } from "@/lib/hooks/useConversations";
import { Conversation, VoiceTutorProps } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import "@/styles/activeRoom.css";

const TOTAL_DAYS = 1;

async function fetchSessionToken(params: {
  courseId?: string;
  userId?: string;
  userName?: string;
}) {
  const query = new URLSearchParams();
  if (params.courseId) {
    query.set("courseId", params.courseId);
    query.set("total_days", String(TOTAL_DAYS));
  }
  if (params.userId) {
    query.set("userId", params.userId);
  }
  if (params.userName) {
    query.set("userName", params.userName);
  }

  const response = await fetch(`/api/course?${query.toString()}`);
  const data = await response.json();

  if (!response.ok || !data.accessToken || !data.url) {
    throw new Error(data.error || "Invalid token response");
  }

  return data as { accessToken: string; url: string };
}

export function VoiceAITutor({
  courseId,
  isCourseMode,
  selectedDay,
}: VoiceTutorProps) {
  const router = useRouter();
  const { user, username } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isStoring, setIsStoring] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const { conversations, resetConversations, addConversation } =
    useConversations();

  const storeConversations = useCallback(
    async (items: Conversation[]) => {
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
            userId: user?.id,
            userEmail: user?.email,
            userName: username,
            isGuest: !user,
          }),
        });

        const resData = await response.json();
        if (!response.ok) throw new Error(resData.error || "Failed to store conversations");
      } catch {
        setSessionError("Could not save your session. Please check your connection.");
      } finally {
        setIsStoring(false);
      }
    },
    [courseId, selectedDay, user, username]
  );

  const startSession = useCallback(async () => {
    setIsStarting(true);
    setSessionError(null);

    try {
      const session = await fetchSessionToken({
        courseId: isCourseMode ? courseId : undefined,
        userId: user?.id,
        userName: username,
      });
      setToken(session.accessToken);
      setUrl(session.url);
    } catch {
      setSessionError(
        "Could not start the voice session. Check LiveKit keys in .env.local and make sure the backend agent is running."
      );
    } finally {
      setIsStarting(false);
    }
  }, [courseId, isCourseMode, user?.id, username]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  useEffect(() => {
    if (!isReset) return;

    const timer = setTimeout(async () => {
      await storeConversations(conversations);
      setToken(null);
      setUrl(null);
      resetConversations();
      setIsReset(false);
      router.push("/course");
    }, 300);

    return () => clearTimeout(timer);
  }, [isReset, conversations, storeConversations, resetConversations, router]);

  if (sessionError) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[420px] px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-red-400 font-medium">{sessionError}</p>
          <button
            type="button"
            onClick={startSession}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
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
          <p className="text-slate-500 text-sm">
            {user
              ? `Loading personalized session history for ${username}`
              : "Setting up guest voice session (transcripts will not be stored)"}
          </p>
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
