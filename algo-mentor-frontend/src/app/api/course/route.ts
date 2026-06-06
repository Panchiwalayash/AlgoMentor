import { createLiveKitSessionToken } from "@/lib/server/livekit-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId") ?? undefined;
    const totalDays = parseInt(
      request.nextUrl.searchParams.get("total_days") ?? "1",
      10
    );

    const session = await createLiveKitSessionToken(
      courseId ? { courseId, totalDays } : undefined
    );

    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
