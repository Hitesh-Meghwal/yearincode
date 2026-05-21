import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "yearincode",
  description: "Spotify Wrapped for your git history.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
