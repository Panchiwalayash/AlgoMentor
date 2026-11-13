import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalParticipant, useMaybeRoomContext } from "@livekit/components-react";
import { Participant, RoomEvent, TranscriptionSegment } from "livekit-client";
import { useAgentParticipant } from "@/lib/hooks/useAgentParticipant";
import { Speaker } from "@/lib/types";

export interface UseLiveTranscriptOptions {
  isMicrophoneEnabled?: boolean;
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
}

export function useLiveTranscript(
  onFinal: (speaker: Speaker, text: string) => void,
  options: UseLiveTranscriptOptions = {}
) {
  const { isUserSpeaking = false, isAgentSpeaking = false } = options;

  const room = useMaybeRoomContext();
  const { localParticipant } = useLocalParticipant();
  const agentParticipant = useAgentParticipant();

  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const [liveUserText, setLiveUserText] = useState("");
  const [liveAgentText, setLiveAgentText] = useState("");

  const userSegments = useRef<Map<string, TranscriptionSegment>>(new Map());
  const agentSegments = useRef<Map<string, TranscriptionSegment>>(new Map());

  const userTimer = useRef<NodeJS.Timeout | null>(null);
  const agentTimer = useRef<NodeJS.Timeout | null>(null);

  const getMergedText = (map: Map<string, TranscriptionSegment>) => {
    return Array.from(map.values())
      .sort(
        (a, b) =>
          (a.firstReceivedTime || a.startTime || 0) -
          (b.firstReceivedTime || b.startTime || 0)
      )
      .map((s) => s.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const commitUser = useCallback(() => {
    if (userTimer.current) {
      clearTimeout(userTimer.current);
      userTimer.current = null;
    }
    const text = getMergedText(userSegments.current);
    if (text) {
      onFinalRef.current("User", text);
    }
    userSegments.current.clear();
    setLiveUserText("");
  }, []);

  const commitAgent = useCallback(() => {
    if (agentTimer.current) {
      clearTimeout(agentTimer.current);
      agentTimer.current = null;
    }
    const text = getMergedText(agentSegments.current);
    if (text) {
      onFinalRef.current("AlgoMentor", text);
    }
    agentSegments.current.clear();
    setLiveAgentText("");
  }, []);

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: Participant
    ) => {
      if (!participant) return;

      const isUser =
        localParticipant && participant.identity === localParticipant.identity;

      if (isUser) {
        // If agent was still speaking / pending commit, finalize it immediately
        if (agentSegments.current.size > 0) {
          commitAgent();
        }

        for (const seg of segments) {
          userSegments.current.set(seg.id, seg);
        }
        const text = getMergedText(userSegments.current);
        if (text) setLiveUserText(text);

        if (userTimer.current) clearTimeout(userTimer.current);
        userTimer.current = setTimeout(commitUser, 1200);
      } else {
        // Agent transcript
        if (userSegments.current.size > 0) {
          commitUser();
        }

        for (const seg of segments) {
          agentSegments.current.set(seg.id, seg);
        }
        const text = getMergedText(agentSegments.current);
        if (text) setLiveAgentText(text);

        if (agentTimer.current) clearTimeout(agentTimer.current);
        agentTimer.current = setTimeout(commitAgent, 1400);
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, localParticipant, agentParticipant, commitUser, commitAgent]);

  // Turn-taking / Interruption handling:
  // When user starts speaking, commit agent's previous turn immediately
  useEffect(() => {
    if (isUserSpeaking && agentSegments.current.size > 0) {
      commitAgent();
    }
  }, [isUserSpeaking, commitAgent]);

  // When agent starts speaking, commit user's previous turn immediately
  useEffect(() => {
    if (isAgentSpeaking && userSegments.current.size > 0) {
      commitUser();
    }
  }, [isAgentSpeaking, commitUser]);

  const flushLive = useCallback(() => {
    commitUser();
    commitAgent();
  }, [commitUser, commitAgent]);

  return { liveUserText, liveAgentText, flushLive };
}
