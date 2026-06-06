import { useCallback, useRef, useState } from "react";
import { TranscriptionSegment } from "livekit-client";

type SegmentMap = Map<string, TranscriptionSegment>;

function mergeSegmentText(segments: SegmentMap): string {
  return Array.from(segments.values())
    .sort(
      (a, b) =>
        a.startTime - b.startTime ||
        a.firstReceivedTime - b.firstReceivedTime
    )
    .map((s) => s.text)
    .join(" ")
    .trim();
}

export function useLiveTranscript(onFinal: (speaker: string, text: string) => void) {
  const userSegments = useRef<SegmentMap>(new Map());
  const agentSegments = useRef<SegmentMap>(new Map());
  const [liveUserText, setLiveUserText] = useState("");
  const [liveAgentText, setLiveAgentText] = useState("");

  const applySegments = useCallback(
    (
      segments: TranscriptionSegment[],
      map: SegmentMap,
      speaker: string,
      setLive: (text: string) => void
    ) => {
      for (const segment of segments) {
        map.set(segment.id, segment);
      }

      const merged = mergeSegmentText(map);
      setLive(merged);

      if (segments.some((s) => s.final) && merged) {
        onFinal(speaker, merged);
        map.clear();
        setLive("");
      }
    },
    [onFinal]
  );

  const handleUserTranscription = useCallback(
    (segments: TranscriptionSegment[]) => {
      applySegments(segments, userSegments.current, "User", setLiveUserText);
    },
    [applySegments]
  );

  const handleAgentTranscription = useCallback(
    (segments: TranscriptionSegment[]) => {
      applySegments(segments, agentSegments.current, "AlgoMentor", setLiveAgentText);
    },
    [applySegments]
  );

  const flushLive = useCallback(() => {
    const userText = mergeSegmentText(userSegments.current);
    const agentText = mergeSegmentText(agentSegments.current);

    if (userText) onFinal("User", userText);
    if (agentText) onFinal("AlgoMentor", agentText);

    userSegments.current.clear();
    agentSegments.current.clear();
    setLiveUserText("");
    setLiveAgentText("");
  }, [onFinal]);

  return {
    liveUserText,
    liveAgentText,
    handleUserTranscription,
    handleAgentTranscription,
    flushLive,
  };
}
