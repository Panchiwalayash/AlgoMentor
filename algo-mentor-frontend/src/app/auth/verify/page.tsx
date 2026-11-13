"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function AuthVerifyPage() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Check if session exists after redirect
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setVerifying(false);
      if (error) {
        setErrorMsg(error.message);
      } else if (session) {
        setSuccess(true);
      } else {
        // Look for URL hash or error
        const hash = window.location.hash;
        if (hash.includes("error")) {
          setErrorMsg("The email verification link has expired or is invalid. Please request a new one.");
        } else {
          setSuccess(true);
        }
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      <Header showBack={false} />

      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-12">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          {verifying ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
              <h2 className="text-xl font-bold">Verifying Email…</h2>
              <p className="text-slate-400 text-sm">
                Confirming your AlgoMentor student credentials.
              </p>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your email has been confirmed. Your DSA voice interview sessions will now be persistently saved to your profile.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/course")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Persistent Learning
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Verification Failed</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {errorMsg || "Unable to verify your email link. It may have expired."}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/course")}
                  className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm font-medium text-white transition-colors"
                >
                  Return to AlgoMentor
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
