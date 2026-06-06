import { AccessToken, VideoGrant } from "livekit-server-sdk";
import { NextRequest } from "next/server";

interface ConversationMessage {
  role: string;
  content: string;
}

interface TutorMetadata {
  context: string;
  courseId: string;
  totalDays: number;
  timestamp: string;
  conversations?: { day: number; messages: ConversationMessage[] }[];
}

export async function GET(request: NextRequest) {
  try {
    const roomName = Math.random().toString(36).substring(7);
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId") || "";
    const totalDays = parseInt(searchParams.get("total_days") || "5");

    if (!apiKey || !apiSecret) {
      throw new Error("LiveKit API key or secret not configured");
    }

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);

    const metadata: TutorMetadata = {
      context: "course",
      courseId: courseId,
      totalDays: totalDays,
      timestamp: new Date().toISOString(),
    };

    const at = new AccessToken(apiKey, apiSecret, {
      identity: "human_user",
      ttl: expiration.getTime() - Date.now(),
      metadata: JSON.stringify(metadata),
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
  } catch (error) {
    console.error("Error generating token:", error);
    return Response.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
