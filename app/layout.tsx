import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLearn — Learn LLM Patterns by Doing",
  description:
    "Interactive exercises to master prompt engineering, evaluation frameworks, agent patterns, and RAG. No API key required.",
  openGraph: {
    title: "LLearn — Learn LLM Patterns by Doing",
    description:
      "Interactive exercises to master prompt engineering, evaluation frameworks, agent patterns, and RAG.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
