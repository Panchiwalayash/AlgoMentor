import { AccessToken, VideoGrant } from "livekit-server-sdk";

export interface CourseSessionMetadata {
  context: "course" | "voice-ai";
  courseId?: string;
  userId?: string;
  userName?: string;
  historySummary?: string;
  timestamp: string;
}

function getLiveKitCredentials() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !url) {
    throw new Error("LiveKit is not configured");
  }

  return { apiKey, apiSecret, url };
}

export async function createLiveKitSessionToken(options?: {
  courseId?: string;
  userId?: string;
  userName?: string;
  historySummary?: string;
}) {
  const { apiKey, apiSecret, url } = getLiveKitCredentials();
  const roomName = Math.random().toString(36).slice(2);
  const expiration = new Date(Date.now() + 60 * 60 * 1000);

  const metadata: CourseSessionMetadata = {
    context: options?.courseId ? "course" : "voice-ai",
    courseId: options?.courseId,
    userId: options?.userId,
    userName: options?.userName,
    historySummary: options?.historySummary,
    timestamp: new Date().toISOString(),
  };

  const identity = options?.userName
    ? `${options.userName.replace(/\s+/g, "_")}_${Math.random().toString(36).slice(2, 6)}`
    : `student_${Math.random().toString(36).slice(2, 8)}`;

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: 60 * 60,
    metadata: JSON.stringify(metadata),
  });

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };

  token.addGrant(grant);

  return {
    accessToken: await token.toJwt(),
    url,
    expiresAt: expiration.toISOString(),
  };
}
