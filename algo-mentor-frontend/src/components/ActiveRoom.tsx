import { useState, useEffect, useCallback } from "react";
import {
  RoomAudioRenderer,
  useConnectionState,
  useLocalParticipant,
  useMaybeRoomContext,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Mic, MicOff, PhoneOff, Sparkles } from "lucide-react";
import { ActiveRoomProps, Speaker } from "@/lib/types";
import { useLiveTranscript } from "@/lib/hooks/useLiveTranscript";
import { useAgentParticipant } from "@/lib/hooks/useAgentParticipant";
import { topicTitle } from "@/lib/topics";
import { ConversationHistory } from "@/components/ConversationHistory";
import "@/styles/activeRoom.css";

export function ActiveRoom({
  courseId,
  isCourseMode,
  addConversation,
  isReset,
  conversations,
  onEndSession,
  isStoring,
}: ActiveRoomProps) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const agentParticipant = useAgentParticipant();
  const room = useMaybeRoomContext();
  const connectionState = useConnectionState();
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const agentJoined = Boolean(agentParticipant);
  const isConnecting = connectionState !== ConnectionState.Connected;
  const waitingForAgent =
    connectionState === ConnectionState.Connected && !agentJoined;

  const onFinalTranscript = useCallback(
    (speaker: Speaker, text: string) => {
      addConversation(speaker, text);
    },
    [addConversation]
  );

  const { liveUserText, liveAgentText, flushLive } =
    useLiveTranscript(onFinalTranscript);

  useEffect(() => {
    if (!isReset) return;
    flushLive();
  }, [isReset, flushLive]);

  useEffect(() => {
    if (!agentParticipant) return undefined;

    const handleSpeaking = (speaking: boolean) => setIsAgentSpeaking(speaking);
    agentParticipant.on("isSpeakingChanged", handleSpeaking);
    return () => {
      agentParticipant.off("isSpeakingChanged", handleSpeaking);
    };
  }, [agentParticipant]);

  useEffect(() => {
    if (!localParticipant) return undefined;

    const handleSpeaking = (speaking: boolean) => setIsUserSpeaking(speaking);
    localParticipant.on("isSpeakingChanged", handleSpeaking);
    return () => {
      localParticipant.off("isSpeakingChanged", handleSpeaking);
    };
  }, [localParticipant]);

  useEffect(() => {
    const initMic = async () => {
      if (room?.state === "connected" && localParticipant) {
        await localParticipant.setMicrophoneEnabled(true);
      }
    };
    initMic();
  }, [room?.state, localParticipant]);

  const title = isCourseMode ? topicTitle(courseId) : "Free Practice";
  const statusLabel = isAgentSpeaking
    ? "AlgoMentor is speaking…"
    : isUserSpeaking
      ? "Listening to you…"
      : isMicrophoneEnabled
        ? "Ready — start talking"
        : "Microphone muted";

  return (
    <div className="voice-session flex flex-col h-full min-h-0 w-full max-w-3xl mx-auto">
      <div className="voice-session-card flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="voice-session-header shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="voice-orb-xs shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-medium text-white truncate">{title}</p>
                <p className="text-[11px] text-slate-400 truncate">{statusLabel}</p>
              </div>
            </div>
            <div
              className={`shrink-0 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
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

          {(isConnecting || waitingForAgent) && (
            <div className="px-4 py-1.5 border-t border-white/5">
              <p className="text-[11px] text-slate-400 text-center truncate">
                {isConnecting
                  ? "Joining voice room…"
                  : "Waiting for AlgoMentor…"}
              </p>
            </div>
          )}
        </div>

        <ConversationHistory
          conversations={conversations}
          liveUserText={liveUserText}
          liveAgentText={liveAgentText}
          isUserSpeaking={isUserSpeaking}
          isAgentSpeaking={isAgentSpeaking}
        />

        <RoomAudioRenderer />

        <div className="voice-controls shrink-0 px-4 py-3 border-t border-white/5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center">
              {(isUserSpeaking || isAgentSpeaking) && (
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
}
