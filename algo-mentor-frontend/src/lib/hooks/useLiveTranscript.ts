import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalParticipant, useMaybeRoomContext } from "@livekit/components-react";
import { Participant, RoomEvent, TranscriptionSegment } from "livekit-client";
import { useAgentParticipant } from "@/lib/hooks/useAgentParticipant";
import { Speaker } from "@/lib/types";

type SegmentMap = Map<string, TranscriptionSegment>;

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence?: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface BrowserSpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

function mergeSegments(segments: SegmentMap): string {
  return Array.from(segments.values())
    .sort(
      (a, b) =>
        a.startTime - b.startTime ||
        a.firstReceivedTime - b.firstReceivedTime
    )
    .map((segment) => segment.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface UseLiveTranscriptOptions {
  isMicrophoneEnabled?: boolean;
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
}

export function useLiveTranscript(
  onFinal: (speaker: Speaker, text: string) => void,
  options: UseLiveTranscriptOptions = {}
) {
  const {
    isMicrophoneEnabled = true,
    isUserSpeaking = false,
    isAgentSpeaking = false,
  } = options;

  const room = useMaybeRoomContext();
  const { localParticipant } = useLocalParticipant();
  const agentParticipant = useAgentParticipant();

  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const userSegments = useRef<SegmentMap>(new Map());
  const agentSegments = useRef<SegmentMap>(new Map());

  const [liveUserText, setLiveUserText] = useState("");
  const [liveAgentText, setLiveAgentText] = useState("");

  const agentSettleTimer = useRef<NodeJS.Timeout | null>(null);
  const userSettleTimer = useRef<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const localInterimRef = useRef("");

  // Agent is active if currently vocalizing or streaming TTS segments
  const isAgentActive =
    isAgentSpeaking ||
    Boolean(liveAgentText.trim()) ||
    agentSegments.current.size > 0;
  const isAgentActiveRef = useRef(isAgentActive);
  isAgentActiveRef.current = isAgentActive;

  // Clear any residual interim user preview when agent becomes active
  useEffect(() => {
    if (isAgentActive) {
      localInterimRef.current = "";
      setLiveUserText("");
    }
  }, [isAgentActive]);

  // Commit a completed turn once
  const commitTurn = useCallback(
    (speaker: Speaker, map: SegmentMap, setLive: (t: string) => void) => {
      const merged = mergeSegments(map);
      if (merged) {
        onFinalRef.current(speaker, merged);
      }
      map.clear();
      setLive("");
    },
    []
  );

  // Accumulate segments during live speech without prematurely splitting sentences
  const applySegments = useCallback(
    (
      segments: TranscriptionSegment[],
      map: SegmentMap,
      setLive: (text: string) => void
    ) => {
      for (const segment of segments) {
        map.set(segment.id, segment);
      }

      const merged = mergeSegments(map);
      if (merged) {
        setLive(merged);
      }
    },
    []
  );

  // --- Real-time client-side streaming user speech preview via Web Speech API ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const speechWin = window as BrowserSpeechWindow;
    const SpeechRecognition =
      speechWin.SpeechRecognition ||
      speechWin.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    // Only listen when mic is on and AI agent is NOT active
    const shouldListen =
      room?.state === "connected" &&
      isMicrophoneEnabled &&
      !isAgentActive;

    if (!shouldListen) {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        isRecognitionActiveRef.current = false;
      }
      return;
    }

    let recognition = recognitionRef.current;
    if (!recognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition initialization error:", err);
        return;
      }
    }

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      // Prevent acoustic loop while mentor is speaking
      if (isAgentActiveRef.current) {
        localInterimRef.current = "";
        setLiveUserText("");
        return;
      }

      let interim = "";
      let finals = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item?.[0]?.transcript || "";
        if (item?.isFinal) {
          finals += text + " ";
        } else {
          interim += text;
        }
      }

      const current = `${finals} ${interim}`.trim();
      localInterimRef.current = current;

      // Only update live preview while user is actively vocalizing
      if (current && isUserSpeaking) {
        setLiveUserText(current);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      isRecognitionActiveRef.current = false;
      // Restart only if mic is live and mentor is NOT speaking
      if (
        room?.state === "connected" &&
        isMicrophoneEnabled &&
        !isAgentActiveRef.current
      ) {
        try {
          recognition.start();
          isRecognitionActiveRef.current = true;
        } catch {}
      }
    };

    try {
      if (!isRecognitionActiveRef.current) {
        recognition.start();
        isRecognitionActiveRef.current = true;
      }
    } catch {}

    return () => {
      if (recognition && isRecognitionActiveRef.current) {
        try {
          recognition.stop();
        } catch {}
        isRecognitionActiveRef.current = false;
      }
    };
  }, [room?.state, isMicrophoneEnabled, isAgentActive, isUserSpeaking]);

  // --- LiveKit WebRTC Transcription listener ---
  useEffect(() => {
    if (!room || !localParticipant) return;

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: Participant
    ) => {
      if (!participant) return;

      // Authoritative server STT for User arrived from Groq Whisper
      if (participant.identity === localParticipant.identity) {
        applySegments(segments, userSegments.current, setLiveUserText);

        // Reset settle timer; commit once speech has completed
        if (userSettleTimer.current) clearTimeout(userSettleTimer.current);
        userSettleTimer.current = setTimeout(() => {
          commitTurn("User", userSegments.current, setLiveUserText);
          localInterimRef.current = "";
        }, 700);
        return;
      }

      // LiveKit TTS transcription for AlgoMentor
      if (agentParticipant && participant.identity === agentParticipant.identity) {
        localInterimRef.current = "";
        setLiveUserText("");

        applySegments(segments, agentSegments.current, setLiveAgentText);
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, localParticipant, agentParticipant, applySegments, commitTurn]);

  // Commit AlgoMentor turn when the agent finishes speaking
  useEffect(() => {
    if (!isAgentSpeaking && agentSegments.current.size > 0) {
      if (agentSettleTimer.current) clearTimeout(agentSettleTimer.current);
      agentSettleTimer.current = setTimeout(() => {
        commitTurn("AlgoMentor", agentSegments.current, setLiveAgentText);
      }, 400);
    }
  }, [isAgentSpeaking, commitTurn]);

  // If user starts speaking while agent was speaking (interruption), commit agent's partial speech
  useEffect(() => {
    if (isUserSpeaking && agentSegments.current.size > 0) {
      if (agentSettleTimer.current) clearTimeout(agentSettleTimer.current);
      commitTurn("AlgoMentor", agentSegments.current, setLiveAgentText);
    }
  }, [isUserSpeaking, commitTurn]);

  // Fallback: If user stops speaking and server STT has accumulated segments, commit
  useEffect(() => {
    if (!isUserSpeaking && userSegments.current.size > 0) {
      if (userSettleTimer.current) clearTimeout(userSettleTimer.current);
      userSettleTimer.current = setTimeout(() => {
        commitTurn("User", userSegments.current, setLiveUserText);
        localInterimRef.current = "";
      }, 500);
    } else if (!isUserSpeaking && localInterimRef.current.trim() && userSegments.current.size === 0) {
      // Local web speech preview fallback if server STT didn't fire
      if (userSettleTimer.current) clearTimeout(userSettleTimer.current);
      userSettleTimer.current = setTimeout(() => {
        const text = localInterimRef.current.trim();
        if (text && !isAgentActiveRef.current) {
          onFinalRef.current("User", text);
        }
        localInterimRef.current = "";
        setLiveUserText("");
      }, 800);
    }
  }, [isUserSpeaking, commitTurn]);

  const flushLive = useCallback(() => {
    if (userSettleTimer.current) clearTimeout(userSettleTimer.current);
    if (agentSettleTimer.current) clearTimeout(agentSettleTimer.current);

    const userText = mergeSegments(userSegments.current) || localInterimRef.current.trim();
    const agentText = mergeSegments(agentSegments.current);

    if (agentText) onFinalRef.current("AlgoMentor", agentText);
    if (userText) onFinalRef.current("User", userText);

    userSegments.current.clear();
    agentSegments.current.clear();
    localInterimRef.current = "";
    setLiveUserText("");
    setLiveAgentText("");
  }, []);

  return { liveUserText, liveAgentText, flushLive };
}
