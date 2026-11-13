import { createLiveKitSessionToken } from "@/lib/server/livekit-token";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId") ?? undefined;
    const userId = request.nextUrl.searchParams.get("userId") ?? undefined;
    const userName = request.nextUrl.searchParams.get("userName") ?? undefined;

    let historySummary: string | undefined = undefined;

    // If student is logged in, query Supabase for their previous session context on this topic
    if (userId) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          let query = supabase
            .from("conversations")
            .select("summary, messages, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1);

          if (courseId) {
            query = query.eq("topic_id", courseId);
          }

          const { data } = await query;
          if (data && data.length > 0 && data[0].summary) {
            historySummary = data[0].summary;
          }
        }
      } catch (err) {
        console.warn("[AlgoMentor API Course] Could not fetch session history:", err);
      }
    }

    const session = await createLiveKitSessionToken({
      courseId,
      userId,
      userName,
      historySummary,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[AlgoMentor Token Generation Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
