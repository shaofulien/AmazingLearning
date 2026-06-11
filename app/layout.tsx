import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Amazing Learning — 線上英語課學習助手",
  description: "上課共筆、AI 單字錯題整理、間隔複習",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <body className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
