import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PostsProvider } from "@/contexts/PostsContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: "LoCult — Local Information Sharing Platform",
  description:
    "Your community. Your information. One trusted place. Map-driven community knowledge and action platform.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LoCult" />
      </head>
      <body className={`${inter.className}`} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <AuthProvider>
            <PostsProvider>
              <LocationProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </LocationProvider>
            </PostsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
