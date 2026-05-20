import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Toaster } from "@/components/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "한표투표 — 내 한 표를 위한 가이드",
  description: "20~30대 유권자를 위한 선거구·공약·모의투표 안내",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <main
            className="flex-1"
            style={{ paddingBottom: 'calc(var(--bottom-tab-height) + var(--safe-area-bottom))' }}
          >
            {children}
          </main>
          <BottomTabBar />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
