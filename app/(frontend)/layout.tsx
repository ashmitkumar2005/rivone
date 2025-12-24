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
  title: {
    default: "Rivone | Private Music Cloud",
    template: "%s | Rivone",
  },
  description: "Your private, encrypted music streaming vault. Powered by Edge Computing.",
  keywords: ["music", "streaming", "cloud", "private", "encrypted", "edge"],
  authors: [{ name: "Ashmit Kumar", url: "https://ashmit-kumar.vercel.app" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rivone.vercel.app",
    title: "Rivone | Private Music Cloud",
    description: "Your private, encrypted music streaming vault.",
    siteName: "Rivone",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rivone",
    description: "Private Music. Your Space.",
    creator: "@ashmitkumar",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
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
