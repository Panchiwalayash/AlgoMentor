import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/lib/livekitClient";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";

const geistSans = localFont({
  src: "../styles/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AlgoMentor — Voice-First DSA Scaffolding Tutor",
  description:
    "Master Data Structures and Algorithms through real-time voice mentorship, Socratic scaffolding, vector-grounded RAG, and persistent session memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-slate-950 text-slate-100 min-h-screen`}>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
