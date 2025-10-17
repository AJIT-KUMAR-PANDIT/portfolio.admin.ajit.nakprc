"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/globals.scss";
import "../styles/admin.scss";
import { SessionProvider } from "../components/SessionProvider";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function moun() {
      setMounted(true);
    }
    moun();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {mounted ? (
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionProvider>{children}</SessionProvider>
          </ThemeProvider>
        ) : (
          <div style={{ visibility: "hidden" }}>
            <SessionProvider>{children}</SessionProvider>
          </div>
        )}
      </body>
    </html>
  );
}
