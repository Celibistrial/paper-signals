import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | PaperSignals",
    default: "PaperSignals | NSE & BSE Tracker",
  },
  description: "A paper-themed stock tracker for the Indian market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-paper-light text-ink">
        <header className="border-b border-ink/5 py-4">
          <div className="container mx-auto px-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="p-2 bg-ink text-paper-light rounded group-hover:rotate-3 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold italic tracking-tight">PaperSignals</span>
            </Link>
          </div>
        </header>
        {children}
        <footer className="py-12 border-t border-ink/10 mt-auto">
          <div className="container mx-auto px-4 text-center space-y-2">
            <p className="font-serif italic text-ink/40 text-sm">
              Recorded in the Archives • {new Date().getFullYear()}
            </p>
            <p className="text-[10px] font-mono text-ink/20 uppercase tracking-widest">
              Market data provided by Yahoo Finance • Not Financial Advice
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
