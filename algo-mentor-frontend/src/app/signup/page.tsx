"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/course");
    } else {
      openAuthModal("signup");
      router.push("/course");
    }
  }, [user, router, openAuthModal]);

  return null;
}
