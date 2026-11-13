"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Code2, ArrowLeft, LogOut, History, BookOpen, Mic, LogIn } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface Props {
  showBack: boolean;
  onBack?: () => void;
}

export const Header: React.FC<Props> = ({ showBack, onBack }) => {
  const router = useRouter();
  const { user, username, signOut, openAuthModal } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Back button & Logo */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">
                  AlgoMentor
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Voice DSA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Navigation shortcuts */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => router.push("/course")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            Curriculum
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            Free Practice
          </button>
          <button
            onClick={() => {
              if (user) {
                router.push("/history");
              } else {
                openAuthModal("signin");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-violet-400" />
            Session History
          </button>
        </div>

        {/* Right: Auth Profile / Guest Indicator */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/history")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-200 hover:text-white text-xs font-medium transition-all"
                title="View your persistent conversations"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{username}</span>
              </button>

              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Guest Mode
              </div>

              <button
                onClick={() => openAuthModal("signin")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
