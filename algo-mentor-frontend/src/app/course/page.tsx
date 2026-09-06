"use client";

import { useRouter } from "next/navigation";
import { CourseCard } from "@/components/CourseCard";
import { Header } from "@/components/Header";
import { TOPICS } from "@/lib/topics";

export default function TopicSelection() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950">
      <Header showBack={false} />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-16">
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
              difficulty: "Any level"
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
