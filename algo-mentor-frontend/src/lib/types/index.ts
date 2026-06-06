export type Speaker = "User" | "AlgoMentor";

export interface Conversation {
  speaker: Speaker;
  message: string;
  timestamp: string;
}

export interface ActiveRoomProps {
  courseId?: string;
  isCourseMode?: boolean;
  conversations: Conversation[];
  isReset: boolean;
  isStoring?: boolean;
  addConversation: (speaker: Speaker, message: string) => void;
  onEndSession: () => void;
}

export interface VoiceTutorProps {
  courseId?: string;
  isCourseMode?: boolean;
  selectedDay?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  difficulty?: string;
}
