"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/context/AuthContext";
import { TOPICS, topicTitle } from "@/lib/topics";
import {
  History,
  Bot,
  User as UserIcon,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lock,
} from "lucide-react";

interface StoredConversation {
  id: string;
  topic_id: string;
  session_day: number;
  messages: Array<{
    role: "assistant" | "user";
    content: string;
    timestamp?: string;
  }>;
  summary?: string;
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ userId: user.id });
        if (selectedTopic !== "all") {
          params.set("topicId", selectedTopic);
        }

        const res = await fetch(`/api/conversations?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setConversations(data.conversations || []);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, selectedTopic]);

  const toggleExpand = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header showBack={true} onBack={() => router.push("/course")} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-20 pb-16">
        {/* Page Title & Scaffolding Motivation */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Persistent Memory
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Database Grounding</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Student Session History
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review your past algorithmic dialogues. AlgoMentor draws from these transcripts to maintain context when you resume a session.
            </p>
          </div>

          {/* Topic Filter */}
          {user && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">All Topics ({conversations.length})</option>
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
                <option value="free-practice">Free Practice</option>
              </select>
            </div>
          )}
        </div>

        {/* Guest Lockout Notice */}
        {!user ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center backdrop-blur-md relative overflow-hidden shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Persistent History Requires an Account
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              You are currently browsing AlgoMentor in <strong className="text-slate-200">Guest Mode</strong>. In guest mode, your live practice voice sessions are ephemeral and are not stored in Supabase.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openAuthModal("signup")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Sign Up with Email & Username
              </button>
              <button
                onClick={() => openAuthModal("signin")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400">Loading student session transcripts…</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              No Practice Sessions Found Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Start a topic session and speak with AlgoMentor. Your dialogue and scaffolding feedback will automatically appear here!
            </p>
            <button
              onClick={() => router.push("/course")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Browse Curriculum Topics
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const dateObj = new Date(session.created_at);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={session.id}
                  className="rounded-2xl border border-slate-800/90 bg-slate-900/70 hover:border-slate-700/80 transition-all overflow-hidden shadow-lg"
                >
                  {/* Session Header Card */}
                  <div
                    onClick={() => toggleExpand(session.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">
                            {topicTitle(session.topic_id)}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {session.messages?.length || 0} spoken turns
                          </span>
                        </div>
                        {session.summary && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {session.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formattedTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (session.topic_id === "free-practice") {
                            router.push("/practice");
                          } else {
                            router.push(`/course/${session.topic_id}`);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        Resume Topic
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        aria-label={isExpanded ? "Collapse transcript" : "Expand transcript"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Transcript Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                        <span className="font-semibold text-slate-300">
                          Recorded Audio Dialogue Transcript
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Persistent ChromaDB & Supabase Sync
                        </span>
                      </div>

                      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 voice-chat-scroll">
                        {session.messages?.map((msg, idx) => {
                          const isUser = msg.role === "user";
                          return (
                            <div
                              key={idx}
                              className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                                  isUser
                                    ? "bg-violet-600"
                                    : "bg-gradient-to-br from-emerald-400 to-cyan-500"
                                }`}
                              >
                                {isUser ? (
                                  <UserIcon className="w-3.5 h-3.5" />
                                ) : (
                                  <Bot className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div
                                className={`rounded-xl px-3.5 py-2 text-xs leading-relaxed max-w-[80%] ${
                                  isUser
                                    ? "bg-violet-600/25 text-violet-100 border border-violet-500/30"
                                    : "bg-slate-800/90 text-slate-200 border border-slate-700/50"
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
