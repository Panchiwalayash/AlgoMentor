import { Conversation } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase credentials not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
    );
  }

  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const { conversations, selectedDay, courseId } = await req.json();

    if (!Array.isArray(conversations) || conversations.length === 0) {
      return NextResponse.json(
        { error: "No conversations to store" },
        { status: 400 }
      );
    }

    const transformedMessages = (conversations as Conversation[]).map((conv) => ({
      role:
        conv.speaker === "AlgoMentor" || conv.speaker === "AI Tutor"
          ? "assistant"
          : "user",
      content: conv.message,
    }));

    const supabase = getSupabase();
    const { error } = await supabase.from("conversations").insert({
      topic_id: courseId,
      session_day: selectedDay ?? 1,
      messages: transformedMessages,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing conversations:", error);
    return NextResponse.json(
      { error: "Failed to store conversations" },
      { status: 500 }
    );
  }
}
