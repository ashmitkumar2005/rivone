import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const runtime = "edge";

import { Navbar } from "@/components/ui/navbar";
import { BackgroundManager } from "@/components/background-manager";
import { Footer } from "@/components/ui/footer";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rivone",
  description: "Private Music. Your Space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen select-none`}
      >
        <SmoothScroll />
        <Navbar />
        <BackgroundManager />
        {children}
        <Footer />
      </body>
    </html>
  );
}
