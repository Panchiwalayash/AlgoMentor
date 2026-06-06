import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { Conversation } from "@/lib/types";

interface ConversationHistoryProps {
  conversations: Conversation[];
  liveUserText?: string;
  liveAgentText?: string;
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
}

function StreamingCursor() {
  return (
    <span className="inline-flex ml-1 align-middle gap-0.5">
      <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
      <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
      <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
    </span>
  );
}

function MessageBubble({
  speaker,
  message,
  timestamp,
  isLive,
  isSpeaking,
}: {
  speaker: "user" | "agent";
  message: string;
  timestamp?: string;
  isLive?: boolean;
  isSpeaking?: boolean;
}) {
  const isUser = speaker === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-indigo-600"
            : "bg-gradient-to-br from-emerald-400 to-cyan-500"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-slate-400">
            {isUser ? "You" : "AlgoMentor"}
          </span>
          {timestamp && !isLive && (
            <span className="text-[10px] text-slate-500">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {isLive && isSpeaking && (
            <span className="text-[10px] text-emerald-400 font-medium">speaking…</span>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed break-words shadow-md ${
            isUser
              ? "bg-gradient-to-br from-violet-600/90 to-indigo-700/90 text-white rounded-tr-md"
              : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-md"
          } ${isLive ? "ring-1 ring-white/10" : ""}`}
        >
          {message}
          {isLive && <StreamingCursor />}
        </div>
      </div>
    </div>
  );
}

export function ConversationHistory({
  conversations,
  liveUserText = "",
  liveAgentText = "",
  isUserSpeaking = false,
  isAgentSpeaking = false,
}: ConversationHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, liveUserText, liveAgentText]);

  const lastUserMessage = [...conversations]
    .reverse()
    .find((conv) => conv.speaker === "User")
    ?.message;
  const lastAgentMessage = [...conversations]
    .reverse()
    .find((conv) => conv.speaker === "AlgoMentor")
    ?.message;

  const showLiveUser =
    liveUserText.trim().length > 0 && liveUserText.trim() !== lastUserMessage;
  const showLiveAgent =
    liveAgentText.trim().length > 0 && liveAgentText.trim() !== lastAgentMessage;

  const hasContent =
    conversations.length > 0 || showLiveUser || showLiveAgent;

  return (
    <div className="voice-chat-scroll flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {!hasContent ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-slate-300 font-medium mb-1">Ready when you are</p>
          <p className="text-slate-500 text-sm max-w-xs">
            Unmute your mic and start talking — you&apos;ll see words appear live as you speak.
          </p>
        </div>
      ) : (
        <>
          {conversations.map((conv, idx) => (
            <MessageBubble
              key={`${conv.timestamp}-${idx}`}
              speaker={conv.speaker === "User" ? "user" : "agent"}
              message={conv.message}
              timestamp={conv.timestamp}
            />
          ))}

          {showLiveUser && (
            <MessageBubble
              speaker="user"
              message={liveUserText.trim()}
              isLive
              isSpeaking={isUserSpeaking}
            />
          )}

          {showLiveAgent && (
            <MessageBubble
              speaker="agent"
              message={liveAgentText}
              isLive
              isSpeaking={isAgentSpeaking}
            />
          )}

          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
