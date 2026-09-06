import { AccessToken, VideoGrant } from "livekit-server-sdk";

interface CourseSessionMetadata {
  context: "course";
  courseId: string;
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
}) {
  const { apiKey, apiSecret, url } = getLiveKitCredentials();
  const roomName = Math.random().toString(36).slice(2);
  const expiration = new Date(Date.now() + 60 * 60 * 1000);

  const token = new AccessToken(apiKey, apiSecret, {
    identity: "human_user",
    ttl: 60 * 60,
    metadata: options?.courseId
      ? JSON.stringify({
        context: "course",
        courseId: options.courseId,
        timestamp: new Date().toISOString(),
      } satisfies CourseSessionMetadata)
      : undefined,
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
