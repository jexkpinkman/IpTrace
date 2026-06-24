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
  title: "iptrace — Cek IP & Geolokasi",
  description: "Cek alamat IP manapun untuk mendapatkan negara, kota, ISP, ASN, zona waktu, dan lokasi. Cepat dan gratis.",
  keywords: ["IP lookup", "IP geolocation", "IP address", "IPv4", "IPv6", "ASN", "ISP"],
  openGraph: {
    title: "iptrace — Cek IP & Geolokasi",
    description: "Cek alamat IP untuk mendapatkan data geolokasi, ISP, dan jaringan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <ToastProvider>
          <div className="min-h-screen bg-navy-900 text-slate-100">
            {/* Background effects */}
            <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
            <div
              className="fixed inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
            <Navbar />
            <main className="relative pt-14">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
