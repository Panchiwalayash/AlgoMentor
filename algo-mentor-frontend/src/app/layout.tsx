import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/lib/livekitClient";
import "./globals.css";

const geistSans = localFont({
  src: "../styles/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AlgoMentor — Voice AI DSA Tutor",
  description:
    "Talk through coding problems with AlgoMentor. Voice tutoring grounded in curated DSA study material.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
