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
    throw new Error("Supabase credentials are not configured.");
  }

  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const { conversations, selectedDay, courseId, userId, userEmail, userName, isGuest } =
      await req.json();

    // Guest Mode: strictly do not store conversation history
    if (isGuest || !userId) {
      return NextResponse.json({
        success: true,
        saved: false,
        message: "Guest session finished. Conversation history was not persisted.",
      });
    }

    if (!Array.isArray(conversations) || conversations.length === 0) {
      return NextResponse.json(
        { error: "No conversations to store" },
        { status: 400 }
      );
    }

    const messages = (conversations as Conversation[]).map((conv) => ({
      role: conv.speaker === "AlgoMentor" ? "assistant" : "user",
      content: conv.message,
      timestamp: conv.timestamp,
    }));

    // Generate a short 1-sentence recap for session resumption
    const lastUserMsg = [...conversations].reverse().find((c) => c.speaker === "User")?.message || "";
    const summary = lastUserMsg
      ? `Practiced ${courseId || "DSA"}. Last student focus: "${lastUserMsg.slice(0, 120)}..."`
      : `Practiced ${courseId || "DSA"} with ${messages.length} messages.`;

    const supabase = getSupabase();
    const { data, error } = await supabase.from("conversations").insert({
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      topic_id: courseId || "free-practice",
      session_day: selectedDay ?? 1,
      messages,
      summary,
    }).select();

    if (error) {
      console.error("[AlgoMentor Store Conversation] Supabase error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, saved: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to store conversations";
    console.error("[AlgoMentor Store Conversation Error]:", message);
    return NextResponse.json(
      { error: "Failed to store conversations", details: message },
      { status: 500 }
    );
  }
}
