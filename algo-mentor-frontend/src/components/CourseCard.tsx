import React from "react";
import { ArrowRight } from "lucide-react";
import { Course } from "@/lib/types";
import { TopicThumbnail } from "./TopicThumbnail";

interface Props {
  course: Course;
  onClick: () => void;
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Advanced: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

export const CourseCard: React.FC<Props> = ({ course, onClick }) => {
  const badge =
    difficultyColors[course.difficulty ?? ""] ??
    "bg-slate-500/15 text-slate-400 border-slate-500/25";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left w-full rounded-2xl overflow-hidden
        bg-slate-900/60 border border-white/5
        hover:border-emerald-500/30 hover:bg-slate-900/80
        transition-all duration-300 hover:-translate-y-1
        hover:shadow-xl hover:shadow-emerald-500/5"
    >
      <div className="relative h-44 overflow-hidden">
        <TopicThumbnail
          topicId={course.id}
          title={course.title}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {course.difficulty && (
          <span
            className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border ${badge}`}
          >
            {course.difficulty}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          {course.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5 transition-all">
          Start session
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
};
