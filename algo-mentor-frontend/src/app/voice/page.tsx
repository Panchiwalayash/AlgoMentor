"use client";
import { Header } from "@/components/Header";
import { VoiceAITutor } from "@/components/VoiceAITutor";
import { useRouter } from "next/navigation";

const VoiceSection = () => {
  const router = useRouter();
  const onBack = () => {
    router.push("/");
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <Header showBack={true} onBack={onBack} />
      <VoiceAITutor isCourseMode={false} />
    </div>
  );
};

export default VoiceSection;
