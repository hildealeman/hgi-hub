import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
          <div className="flex-1 bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
