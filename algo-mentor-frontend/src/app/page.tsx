"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/context/AuthContext";
import { TOPICS } from "@/lib/topics";
import { TopicThumbnail } from "@/components/TopicThumbnail";
import {
  Mic,
  Sparkles,
  ArrowRight,
  Database,
  BrainCircuit,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, username, openAuthModal, continueAsGuest } = useAuth();

  const handleStartGuest = () => {
    continueAsGuest();
    router.push("/course");
  };

  const handleStartAuth = () => {
    if (user) {
      router.push("/course");
    } else {
      openAuthModal("signup");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header showBack={false} />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-600/15 via-cyan-500/15 to-violet-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs font-medium mb-6 shadow-xl backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold">Socratic Scaffolding</span>
            <span className="text-slate-500">•</span>
            <span>Real-Time Voice DSA Mentorship</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Talk Through Code Out Loud.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Think Like an Engineer.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300/90 mb-10 leading-relaxed font-normal">
            AlgoMentor guides you to correct answers using pedagogical scaffolding rather than dumping code solutions. Speak your algorithmic intuition out loud with vector-grounded notes and persistent session memory.
          </p>

          {/* Primary Action Buttons: Guest Mode vs. Authenticated Persistence */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            {/* Action 1: Direct Guest Access */}
            <button
              onClick={handleStartGuest}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-100 font-semibold text-sm transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2.5 group"
            >
              <Mic className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Try Directly as Guest</span>
              <span className="text-[10px] text-slate-400 font-normal border-l border-slate-700 pl-2">
                No Login
              </span>
            </button>

            {/* Action 2: Authenticated Access with Persistent Progress */}
            <button
              onClick={handleStartAuth}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold text-sm transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{user ? `Resume as ${username}` : "Sign In to Save Progress"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Guest sessions are ephemeral. Sign in to retain transcripts and resume topics seamlessly.
          </p>
        </div>
      </section>

      {/* Feature Showcase: Socratic Scaffolding & Vector Grounding */}
      <section className="py-16 px-4 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Why Voice Scaffolding Beats Vanilla LLMs
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Standard chatbots give away answers immediately or hallucinate complexities. AlgoMentor grounds dialogue in verified curriculum and guides you step-by-step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Socratic Scaffolding */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Pedagogical Scaffolding
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instead of solution dumping, AlgoMentor asks targeted hinting questions that test your mental models, identify edge cases, and cultivate independent problem-solving.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium">
                Never gives full code up front →
              </div>
            </div>

            {/* Card 2: ChromaDB Grounding (Heaps Floyd O(n)) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Vector-Grounded RAG
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Curated notes embedded with Sentence-Transformers in ChromaDB. Ensures strict accuracy on edge cases — such as strictly enforcing Floyd&apos;s O(N) heap construction rather than O(N log N).
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-cyan-400 font-medium">
                Mathematically verified complexity →
              </div>
            </div>

            {/* Card 3: Session Resumption */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col justify-between hover:border-violet-500/40 transition-all shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Persistent Session Memory
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log in to store your session transcripts in Supabase. When you return to a topic, the voice agent reads your past breakthroughs and continues right where you left off.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-violet-400 font-medium">
                Contextual session resumption →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Mode vs. Authenticated Persistence Breakdown */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Choose How You Want to Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              AlgoMentor supports both instant guest access and full authenticated student tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A: Guest Mode */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
                    Guest Mode
                  </span>
                  <span className="text-xs text-slate-500">Zero Signup</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Instant Quick Practice</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Ideal for testing your microphone and doing a quick mock session without entering credentials.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time voice tutor connection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All 7 DSA curriculum topics & Free Practice</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Transcripts are ephemeral (not saved to database)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartGuest}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Launch Direct Demo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Option B: Authenticated Account */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 flex flex-col justify-between shadow-xl shadow-emerald-500/10 relative">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                Recommended
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    Student Account
                  </span>
                  <span className="text-xs text-slate-400">Persistent Progress</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Persistent Progress & Memory</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Persists your conversation history in PostgreSQL so AlgoMentor retains your learning context across sessions.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full conversation transcripts stored in Supabase</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Session resumption: AI mentor remembers where you left off</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Personalized learning history linked to your username</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartAuth}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{user ? "View My Practice Dashboard" : "Sign In / Register"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Preview Section (Featuring Heaps!) */}
      <section className="py-16 px-4 bg-slate-900/30 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Curated Problem Domains
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Explore the DSA Curriculum
              </h2>
            </div>
            <button
              onClick={() => router.push("/course")}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>View all courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOPICS.slice(0, 4).map((topic) => (
              <div
                key={topic.id}
                onClick={() => router.push(`/course/${topic.id}`)}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 p-4 transition-all hover:scale-[1.02] cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="h-28 rounded-xl overflow-hidden mb-3">
                    <TopicThumbnail topicId={topic.id} title={topic.title} className="w-full h-full" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                      {topic.difficulty}
                    </span>
                    {topic.id === "heaps" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        O(N) Floyd&apos;s
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {topic.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-slate-300">
                  <span>Start Topic Session</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/60 bg-slate-950 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>AlgoMentor — Socratic Voice Tutoring for Data Structures & Algorithms</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => router.push("/course")} className="hover:text-white transition-colors">
              Curriculum
            </button>
            <button onClick={() => router.push("/practice")} className="hover:text-white transition-colors">
              Free Practice
            </button>
            <button onClick={() => router.push("/history")} className="hover:text-white transition-colors">
              Session History
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
