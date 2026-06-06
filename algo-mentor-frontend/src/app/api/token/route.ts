import { AccessToken, VideoGrant } from "livekit-server-sdk";

export async function GET() {
  const roomName = Math.random().toString(36).substring(7);
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API key or secret not configured");
  }

  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);

  const at = new AccessToken(apiKey, apiSecret, {
    identity: "human_user",
    ttl: expiration.getTime() - Date.now(),
  });

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };

  at.addGrant(grant);

  return Response.json({
    accessToken: await at.toJwt(),
    url: process.env.LIVEKIT_URL,
    expiresAt: expiration.toISOString(),
  });
}
