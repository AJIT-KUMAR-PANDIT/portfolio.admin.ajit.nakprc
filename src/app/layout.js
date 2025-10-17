"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/globals.scss";
import "../styles/admin.scss";
import { SessionProvider } from "@/components/SessionProvider";
import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";

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

  const pathname = usePathname();
  const isPublicRoute = pathname === "/";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {mounted ? (
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionProvider>
              {isPublicRoute ? children : <AuthGuard>{children}</AuthGuard>}
            </SessionProvider>
          </ThemeProvider>
        ) : (
          <div style={{ visibility: "hidden" }}>
            <SessionProvider>
              {isPublicRoute ? children : <AuthGuard>{children}</AuthGuard>}
            </SessionProvider>
          </div>
        )}
      </body>
    </html>
  );
}
