"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { X, Mail, Lock, User as UserIcon, CheckCircle2, AlertCircle, ArrowRight, Sparkles, RefreshCw } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    continueAsGuest,
    signIn,
    signUp,
    resendVerification,
    pendingVerificationEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetFormState = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  };

  const handleTabChange = (tab: "signin" | "signup" | "verify") => {
    resetFormState();
    openAuthModal(tab);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const res = await signIn(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to sign in. Please check your credentials.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg("Please enter a username.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const res = await signUp(email, password, username);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to create account. Please try again.");
    } else if (res.needsEmailVerification) {
      setSuccessMsg(`Verification email dispatched to ${email}! Please verify before logging in.`);
    } else {
      setSuccessMsg("Account created and signed in successfully!");
    }
  };

  const handleResend = async () => {
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail) {
      setErrorMsg("Please enter your email to resend confirmation.");
      return;
    }

    setIsResending(true);
    setErrorMsg(null);
    const res = await resendVerification(targetEmail);
    setIsResending(false);

    if (res.success) {
      setSuccessMsg(`Verification link resent to ${targetEmail}. Please check your spam or inbox!`);
    } else {
      setErrorMsg(res.error || "Failed to resend email. Try again shortly.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-emerald-500/10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              {authModalTab === "signin"
                ? "Sign in to AlgoMentor"
                : authModalTab === "signup"
                ? "Create Account"
                : "Confirm Your Email"}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {authModalTab === "verify"
              ? "We sent a confirmation link to your inbox. Please check your email to complete signup."
              : "Sign in to persist your interview sessions, track problem intuition, and resume past conversations."}
          </p>
        </div>

        {/* Modal Tabs */}
        {authModalTab !== "verify" && (
          <div className="flex rounded-xl bg-slate-950/60 p-1 mb-5 border border-slate-800/80">
            <button
              type="button"
              onClick={() => handleTabChange("signin")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalTab === "signin"
                  ? "bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("signup")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalTab === "signup"
                  ? "bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-950/60 border border-red-800/60 p-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {authModalTab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 px-9 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 px-9 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400 focus:outline-none disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Signing in…" : "Sign In & Access Progress"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* TAB 2: SIGN UP */}
        {authModalTab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. yash_algo"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 px-9 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 px-9 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 px-9 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400 focus:outline-none disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Creating Account…" : "Create Account"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* TAB 3: EMAIL VERIFICATION */}
        {authModalTab === "verify" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-200 text-sm">
                Check Your Inbox
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We sent an email verification link to{" "}
                <span className="text-emerald-400 font-semibold">
                  {pendingVerificationEmail || email || "your email"}
                </span>
                . Click the link in that email to activate your account.
              </p>
            </div>

            {/* Email verification instructions */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 text-xs text-slate-300 space-y-2">
              <p className="flex items-center gap-2 text-slate-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Waiting for email confirmation
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Click the confirmation button in the email to activate your account. Once confirmed, you can log in and start your voice session.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "Resending Email…" : "Resend Verification Email"}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("signin")}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors py-1"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Guest Mode Divider */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 transition-colors"
          >
            Or explore AlgoMentor directly as Guest (Sessions won&apos;t be stored)
          </button>
        </div>
      </div>
    </div>
  );
}
