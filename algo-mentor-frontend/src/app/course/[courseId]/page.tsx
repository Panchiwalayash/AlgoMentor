"use client";

import { VoiceAITutor } from "@/components/VoiceAITutor";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";

const TopicSession: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div className="min-h-screen bg-slate-950 pt-14">
      <Header showBack={true} onBack={() => router.push("/course")} />
      <VoiceAITutor courseId={courseId} isCourseMode={true} selectedDay={1} />
    </div>
  );
};

export default TopicSession;
