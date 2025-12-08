import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundOrbits } from "@/components/BackgroundOrbits";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HGI Hub · Human-Grounded Intelligence",
  description: "Una ruta humana hacia la AGI, sin humo y con arquitectura seria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-zinc-50 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <BackgroundOrbits />
            </div>
            <div className="relative z-10">{children}</div>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
