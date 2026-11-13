"use client";

import { useRouter } from "next/navigation";
import { CourseCard } from "@/components/CourseCard";
import { Header } from "@/components/Header";
import { TOPICS } from "@/lib/topics";
import { useAuth } from "@/lib/context/AuthContext";
import { Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function TopicSelection() {
  const router = useRouter();
  const { user, username, openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header showBack={false} />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        {/* Persistence Status Notification Banner */}
        <div className="mb-8 max-w-2xl mx-auto">
          {user ? (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Persistent History Active: Practice sessions will be saved for <strong className="text-white">{username}</strong>.
                </span>
              </div>
              <button
                onClick={() => router.push("/history")}
                className="text-emerald-400 hover:text-emerald-200 underline underline-offset-2 ml-2"
              >
                View History
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 shadow-lg">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Guest Mode:</strong> You can practice any topic freely, but sessions are not saved.
                </span>
              </div>
              <button
                onClick={() => openAuthModal("signup")}
                className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Sign In to Save
              </button>
            </div>
          )}
        </div>

        <div className="mb-12 text-center max-w-2xl mx-auto">
          <p className="text-emerald-400 text-sm font-medium mb-2 tracking-wide uppercase">
            Voice-first learning
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Pick a topic. Talk it through.
          </h2>
          <p className="text-slate-400 text-lg">
            Practice DSA out loud with AlgoMentor — like pair programming, but
            your partner never gets tired.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard
            course={{
              id: "free-practice",
              title: "Free Practice",
              description: "Open-ended DSA practice — no topic locked in",
              difficulty: "Any level",
            }}
            onClick={() => router.push("/practice")}
          />
          {TOPICS.map((topic) => (
            <CourseCard
              key={topic.id}
              course={topic}
              onClick={() => router.push(`/course/${topic.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
