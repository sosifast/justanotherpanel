import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

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

        {/* Safely inject SEO and Analytic codes at the end of the body to prevent breaking CSS/Layout */}
        {settings?.google_search_code && (
          <script
            id="google-search-console"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const temp = document.createElement('div');
                  temp.innerHTML = ${JSON.stringify(settings.google_search_code)}.trim();
                  while (temp.firstChild) {
                    if (temp.firstChild.nodeType === 1 || temp.firstChild.nodeType === 3) {
                      document.head.appendChild(temp.firstChild);
                    } else {
                      temp.removeChild(temp.firstChild);
                    }
                  }
                })();
              `,
            }}
          />
        )}
        {settings?.google_analytic_code && (
          <script
            id="google-analytics"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const temp = document.createElement('div');
                  temp.innerHTML = ${JSON.stringify(settings.google_analytic_code)}.trim();
                  while (temp.firstChild) {
                    document.body.appendChild(temp.firstChild);
                  }
                })();
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
