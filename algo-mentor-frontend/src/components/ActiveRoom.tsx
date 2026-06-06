import { useState, useEffect, useCallback } from "react";
import {
  RoomAudioRenderer,
  useLocalParticipant,
  useRemoteParticipants,
  useMaybeRoomContext,
} from "@livekit/components-react";
import { RoomEvent, Participant, TranscriptionSegment } from "livekit-client";
import { Mic, MicOff, PhoneOff, Sparkles } from "lucide-react";
import { ActiveRoomProps } from "@/lib/types";
import { useLiveTranscript } from "@/lib/hooks/useLiveTranscript";
import { topicTitle } from "@/lib/topics";
import { ConversationHistory } from "./ConversationHistory";
import "@/styles/activeRoom.css";

export const ActiveRoom = ({
  courseId,
  isCourseMode,
  addConversation,
  isReset,
  conversations,
  onEndSession,
  isStoring,
}: ActiveRoomProps) => {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const room = useMaybeRoomContext();
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  const onFinalTranscript = useCallback(
    (speaker: string, text: string) => {
      addConversation(speaker, text);
    },
    [addConversation]
  );

  const {
    liveUserText,
    liveAgentText,
    handleUserTranscription,
    handleAgentTranscription,
    flushLive,
  } = useLiveTranscript(onFinalTranscript);

  useEffect(() => {
    if (!isReset) return;
    flushLive();
  }, [isReset, flushLive]);

  useEffect(() => {
    const botParticipant = remoteParticipants[0];
    if (!botParticipant) return undefined;

    const handleBotSpeaking = (speaking: boolean) => setIsBotSpeaking(speaking);
    botParticipant.on("isSpeakingChanged", handleBotSpeaking);
    return () => {
      botParticipant.off("isSpeakingChanged", handleBotSpeaking);
    };
  }, [remoteParticipants]);

  useEffect(() => {
    if (!localParticipant) return undefined;

    const handleSpeaking = (speaking: boolean) => setIsUserSpeaking(speaking);
    localParticipant.on("isSpeakingChanged", handleSpeaking);
    return () => {
      localParticipant.off("isSpeakingChanged", handleSpeaking);
    };
  }, [localParticipant]);

  useEffect(() => {
    if (!room || !localParticipant) return undefined;

    const handleTranscription = (
      transcription: TranscriptionSegment[],
      participant?: Participant
    ) => {
      if (participant?.identity === localParticipant.identity) {
        handleUserTranscription(transcription);
      } else if (participant?.identity === remoteParticipants[0]?.identity) {
        handleAgentTranscription(transcription);
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [
    room,
    localParticipant,
    remoteParticipants,
    handleUserTranscription,
    handleAgentTranscription,
  ]);

  useEffect(() => {
    const initMic = async () => {
      if (room?.state === "connected" && localParticipant) {
        await localParticipant.setMicrophoneEnabled(true);
      }
    };
    initMic();
  }, [room?.state, localParticipant]);

  const title = isCourseMode ? topicTitle(courseId) : "Free Practice";
  const statusLabel = isBotSpeaking
    ? "AlgoMentor is speaking…"
    : isUserSpeaking
      ? "Listening to you…"
      : isMicrophoneEnabled
        ? "Ready — start talking"
        : "Microphone muted";

  return (
    <div className="voice-session flex flex-col h-full w-full max-w-3xl mx-auto">
      <div className="voice-session-card flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Session header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="voice-orb-sm">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              <p className="text-xs text-slate-400">{statusLabel}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              isMicrophoneEnabled
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-amber-500/15 text-amber-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isMicrophoneEnabled ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            {isMicrophoneEnabled ? "Live" : "Muted"}
          </div>
        </div>

        {/* Chat */}
        <ConversationHistory
          conversations={conversations}
          liveUserText={liveUserText}
          liveAgentText={liveAgentText}
          isUserSpeaking={isUserSpeaking}
          isAgentSpeaking={isBotSpeaking}
        />

        <RoomAudioRenderer />

        {/* Voice controls */}
        <div className="voice-controls px-6 py-5 border-t border-white/5">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              {(isUserSpeaking || isBotSpeaking) && (
                <>
                  <span className="voice-ring voice-ring-1" />
                  <span className="voice-ring voice-ring-2" />
                </>
              )}
              <button
                type="button"
                onClick={() =>
                  localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)
                }
                aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
                className={`voice-mic-btn relative z-10 ${
                  isMicrophoneEnabled ? "voice-mic-btn--live" : "voice-mic-btn--muted"
                } ${isUserSpeaking ? "voice-mic-btn--speaking" : ""}`}
              >
                {isMicrophoneEnabled ? (
                  <Mic className="w-7 h-7 text-white" />
                ) : (
                  <MicOff className="w-7 h-7 text-white" />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              {isMicrophoneEnabled ? "Tap to mute" : "Tap to unmute"}
            </p>

            <button
              type="button"
              onClick={onEndSession}
              disabled={isStoring}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                bg-red-500/10 text-red-400 border border-red-500/20
                hover:bg-red-500/20 hover:border-red-500/40
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {isStoring ? (
                <>
                  <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <PhoneOff className="w-4 h-4" />
                  {isCourseMode ? "End Session & Save" : "End Session"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRoom;
