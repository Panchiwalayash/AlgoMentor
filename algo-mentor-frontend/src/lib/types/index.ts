export interface Conversation {
  speaker: string;
  message: string;
  timestamp: string;
}

export interface ActiveRoomProps {
  addConversation: (speaker: string, message: string) => void;
  courseId?: string;
  isCourseMode?: boolean;
  selectedDay?: number;
  isReset: boolean;
  setIsRest: (value: boolean) => void;
  conversations: Conversation[];
  onEndSession: () => void;
  isStoring?: boolean;
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
