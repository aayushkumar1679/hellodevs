import type { Metadata } from "next";
import {
  Manrope,
  Space_Grotesk,
  Inter,
  Plus_Jakarta_Sans,
  Outfit,
  DM_Sans,
  Sora,
} from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Polyglot — AI Visual Web Builder",
  description:
    "Prompt, design, and export polished websites with Polyglot's AI-powered visual builder.",
};

import NextAuthProvider from "@/components/NextAuthProvider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = [
    manrope.variable,
    spaceGrotesk.variable,
    inter.variable,
    plusJakartaSans.variable,
    outfit.variable,
    dmSans.variable,
    sora.variable,
  ].join(" ");

  return (
    <html lang="en">
      <body className={fontVars}>
        <NextAuthProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </NextAuthProvider>
      </body>
    </html>
  );
}
