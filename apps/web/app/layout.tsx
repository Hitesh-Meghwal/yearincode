import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://yearincode.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "yearincode — your year in code, wrapped",
    template: "%s · yearincode",
  },
  description:
    "Turn a year of your GitHub activity into an animated Spotify-Wrapped-style recap. Commits, streaks, archetypes, top languages — shareable in 60 seconds.",
  applicationName: "yearincode",
  keywords: [
    "github wrapped",
    "year in code",
    "spotify wrapped for github",
    "developer wrapped",
    "git history visualization",
    "github stats",
    "coding stats",
    "dev recap",
    "github 2026 wrapped",
    "yearincode",
  ],
  authors: [{ name: "Hitesh Meghwal", url: "https://github.com/Hitesh-Meghwal" }],
  creator: "Hitesh Meghwal",
  publisher: "yearincode",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "yearincode",
    title: "yearincode — your year in code, wrapped",
    description:
      "Turn a year of your GitHub activity into an animated Spotify-Wrapped-style recap. Shareable in 60 seconds.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "yearincode — your year in code, wrapped",
    description:
      "Turn a year of your GitHub activity into an animated Spotify-Wrapped-style recap.",
    creator: "@Hitesh_Meghwal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Icons are auto-discovered from app/icon.svg and (when you add one)
  // app/apple-icon.png — leaving metadata.icons unset keeps that convention.
  manifest: "/manifest.webmanifest",
  verification: {
    google: "RQ_MY6z_gU2NX-JxJM3MoEidw7A2RFg9n-pPMnyixrk",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
