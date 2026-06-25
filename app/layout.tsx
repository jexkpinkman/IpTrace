import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jexk Tracker — Cek IP & Geolokasi",
  description: "Lacak IP, lokasi, dan perangkat siapapun yang membuka linkmu.",
  keywords: ["IP lookup", "IP tracker", "IP geolocation", "link tracker"],
  openGraph: {
    title: "Jexk Tracker — Cek IP & Geolokasi",
    description: "Lacak IP, lokasi, dan perangkat siapapun yang membuka linkmu.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased bg-[#0a0a0a]`}>
        <ToastProvider>
          <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
            <Navbar />
            <main className="relative pt-14">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
