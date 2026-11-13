"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/course");
    } else {
      openAuthModal("signin");
      router.push("/course");
    }
  }, [user, router, openAuthModal]);

  return null;
}
