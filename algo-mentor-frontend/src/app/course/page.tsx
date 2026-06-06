"use client";

import { useRouter } from "next/navigation";
import { CourseCard } from "@/components/CourseCard";
import { Header } from "@/components/Header";

const TOPICS = [
  {
    id: "binary-search",
    title: "Binary Search",
    description: "Master the O(log n) search pattern on sorted data",
    difficulty: "Beginner",
    totalDays: 5,
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    description: "Pointer manipulation, reversal, and cycle detection",
    difficulty: "Beginner",
    totalDays: 5,
  },
  {
    id: "trees",
    title: "Trees & BST",
    description: "Traversals, recursion, and binary search trees",
    difficulty: "Intermediate",
    totalDays: 5,
  },
  {
    id: "two-pointers",
    title: "Two Pointers",
    description: "Sliding window and pair-sum techniques on arrays",
    difficulty: "Beginner",
    totalDays: 5,
  },
  {
    id: "graphs",
    title: "Graphs BFS/DFS",
    description: "Explore graphs with breadth-first and depth-first search",
    difficulty: "Intermediate",
    totalDays: 5,
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    description: "Break problems into overlapping subproblems",
    difficulty: "Advanced",
    totalDays: 5,
  },
];

const TopicSelection = () => {
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
          {TOPICS.map((topic) => (
            <CourseCard
              key={topic.id}
              course={topic}
              onClick={() => router.push(`course/${topic.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default TopicSelection;
