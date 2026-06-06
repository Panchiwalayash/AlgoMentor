import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalParticipant, useMaybeRoomContext } from "@livekit/components-react";
import { Participant, RoomEvent, TranscriptionSegment } from "livekit-client";
import { useAgentParticipant } from "@/lib/hooks/useAgentParticipant";

type SegmentMap = Map<string, TranscriptionSegment>;
type Speaker = "User" | "AlgoMentor";

function mergeSegments(segments: SegmentMap): string {
  return Array.from(segments.values())
    .sort(
      (a, b) =>
        a.startTime - b.startTime ||
        a.firstReceivedTime - b.firstReceivedTime
    )
    .map((segment) => segment.text)
    .join(" ")
    .trim();
}

export function useLiveTranscript(onFinal: (speaker: Speaker, text: string) => void) {
  const room = useMaybeRoomContext();
  const { localParticipant } = useLocalParticipant();
  const agentParticipant = useAgentParticipant();
  const onFinalRef = useRef(onFinal);
  const userSegments = useRef<SegmentMap>(new Map());
  const agentSegments = useRef<SegmentMap>(new Map());
  const [liveUserText, setLiveUserText] = useState("");
  const [liveAgentText, setLiveAgentText] = useState("");

  onFinalRef.current = onFinal;

  const applySegments = useCallback(
    (
      segments: TranscriptionSegment[],
      map: SegmentMap,
      speaker: Speaker,
      setLive: (text: string) => void
    ) => {
      for (const segment of segments) {
        map.set(segment.id, segment);
      }

      const merged = mergeSegments(map);
      setLive(merged);

      if (segments.some((segment) => segment.final) && merged) {
        onFinalRef.current(speaker, merged);
        map.clear();
        setLive("");
      }
    },
    []
  );

  useEffect(() => {
    if (!room || !localParticipant) return;

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: Participant
    ) => {
      if (!participant) return;

      if (participant.identity === localParticipant.identity) {
        applySegments(segments, userSegments.current, "User", setLiveUserText);
        return;
      }

      if (agentParticipant && participant.identity === agentParticipant.identity) {
        applySegments(segments, agentSegments.current, "AlgoMentor", setLiveAgentText);
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, localParticipant, agentParticipant, applySegments]);

  const flushLive = useCallback(() => {
    const userText = mergeSegments(userSegments.current);
    const agentText = mergeSegments(agentSegments.current);

    if (userText) onFinalRef.current("User", userText);
    if (agentText) onFinalRef.current("AlgoMentor", agentText);

    userSegments.current.clear();
    agentSegments.current.clear();
    setLiveUserText("");
    setLiveAgentText("");
  }, []);

  return { liveUserText, liveAgentText, flushLive };
}
