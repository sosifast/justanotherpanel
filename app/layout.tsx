import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: settings?.site_name || "JustAnotherPanel - SMM Panel Solutions",
    description: "The most advanced and reliable SMM panel provider for all your social media marketing needs.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <head>
        {settings?.google_search_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.google_search_code }} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {settings?.google_analytic_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.google_analytic_code }} />
        )}
        <Toaster position="top-right" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
