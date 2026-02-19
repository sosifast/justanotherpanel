import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

import { getSettings } from "@/lib/settings";
import ScriptsInjector from "@/components/ScriptsInjector";
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
    icons: {
      icon: settings?.favicon_imagekit_url || '/favicon.ico',
      shortcut: settings?.favicon_imagekit_url || '/favicon.ico',
      apple: settings?.favicon_imagekit_url || '/apple-icon.png',
    },
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" />
        {children}
        <Analytics />

        <ScriptsInjector
          headerCode={settings?.google_search_code}
          footerCode={settings?.google_analytic_code}
        />
        {settings?.plausible_domain && (
          <Script
            defer
            data-domain={settings.plausible_domain}
            src="https://plausible.io/js/script.js"
          />
        )}
      </body>
    </html>
  );
}
