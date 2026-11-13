"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  username: string;
  email: string;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "signin" | "signup" | "verify";
  pendingVerificationEmail: string | null;
  openAuthModal: (tab?: "signin" | "signup" | "verify") => void;
  closeAuthModal: () => void;
  continueAsGuest: () => void;
  signUp: (email: string, password: string, username: string) => Promise<{
    success: boolean;
    needsEmailVerification: boolean;
    error: string | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    needsEmailVerification: boolean;
    error: string | null;
  }>;
  verifyOtp: (email: string, token: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  resendVerification: (email: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup" | "verify">("signin");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    // Check initial guest state from sessionStorage
    const storedGuest = typeof window !== "undefined" ? sessionStorage.getItem("algomentor_guest") : null;
    if (storedGuest === "true") {
      setIsGuest(true);
    }

    let isMounted = true;

    // Fetch initial active session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        setIsGuest(false);
      }
      setLoading(false);
    }).catch((err) => {
      console.warn("[AlgoMentor Auth] Failed to get session:", err);
      if (isMounted) setLoading(false);
    });

    // Listen for auth state transitions (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        setIsGuest(false);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("algomentor_guest");
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const openAuthModal = (tab: "signin" | "signup" | "verify" = "signin") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("algomentor_guest", "true");
    }
    setIsAuthModalOpen(false);
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const cleanUsername = username.trim();
      const cleanEmail = email.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            full_name: cleanUsername,
          },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/verify` : undefined,
        },
      });

      if (error) {
        return { success: false, needsEmailVerification: false, error: error.message };
      }

      // Supabase returns a user object. If email confirmation is required and no session yet:
      const needsEmailVerification = !data.session && data.user !== null;
      if (needsEmailVerification) {
        setPendingVerificationEmail(cleanEmail);
        setAuthModalTab("verify");
      } else if (data.session) {
        setUser(data.user);
        setSession(data.session);
        setIsGuest(false);
        setIsAuthModalOpen(false);
      }

      return {
        success: true,
        needsEmailVerification,
        error: null,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
      return { success: false, needsEmailVerification: false, error: message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes("email not confirmed") || errorMsg.includes("confirm your email")) {
          setPendingVerificationEmail(cleanEmail);
          setAuthModalTab("verify");
          return {
            success: false,
            needsEmailVerification: true,
            error: "Please verify your email address before signing in. Check your inbox for the confirmation link.",
          };
        }
        return { success: false, needsEmailVerification: false, error: error.message };
      }

      setUser(data.user);
      setSession(data.session);
      setIsGuest(false);
      setIsAuthModalOpen(false);
      return { success: true, needsEmailVerification: false, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during signin.";
      return { success: false, needsEmailVerification: false, error: message };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "signup",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsGuest(false);
        setIsAuthModalOpen(false);
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to verify token.";
      return { success: false, error: message };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend confirmation email.";
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsGuest(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("algomentor_guest", "true");
      }
    } catch (err) {
      console.warn("[AlgoMentor Auth] Sign out error:", err);
    }
  };

  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Guest");

  const email = user?.email || "";

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        email,
        session,
        loading,
        isGuest,
        isAuthModalOpen,
        authModalTab,
        pendingVerificationEmail,
        openAuthModal,
        closeAuthModal,
        continueAsGuest,
        signUp,
        signIn,
        verifyOtp,
        resendVerification,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
