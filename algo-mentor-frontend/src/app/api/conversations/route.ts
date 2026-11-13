import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase credentials are not configured.");
  }

  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const topicId = searchParams.get("topicId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required to fetch persistent sessions." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    let query = supabase
      .from("conversations")
      .select("id, topic_id, session_day, messages, summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (topicId) {
      query = query.eq("topic_id", topicId);
    }

    const { data, error } = await query.limit(30);

    if (error) {
      console.error("[AlgoMentor Get Conversations] Error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      conversations: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch conversations";
    return NextResponse.json(
      { error: "Failed to fetch conversations", details: message },
      { status: 500 }
    );
  }
}
