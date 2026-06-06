"use client";

import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/SessionShell";
import { VoiceAITutor } from "@/components/VoiceAITutor";

export default function FreePracticePage() {
  const router = useRouter();

  return (
    <SessionShell onBack={() => router.push("/course")}>
      <VoiceAITutor />
    </SessionShell>
  );
}
