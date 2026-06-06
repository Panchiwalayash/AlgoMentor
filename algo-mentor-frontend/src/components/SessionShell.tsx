"use client";

import { Header } from "@/components/Header";

interface SessionShellProps {
  children: React.ReactNode;
  onBack: () => void;
}

export function SessionShell({ children, onBack }: SessionShellProps) {
  return (
    <div className="h-screen bg-slate-950 pt-14 flex flex-col overflow-hidden">
      <Header showBack onBack={onBack} />
      {children}
    </div>
  );
}
