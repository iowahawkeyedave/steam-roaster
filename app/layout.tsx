import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Steam Library Roaster | Roast Your Gaming Habits 🔥",
  description: "Enter your Steam ID and get roasted by AI. Analyze your gaming library, discover your habits, and share the burns with friends. The ultimate Steam library analyzer.",
  keywords: ["Steam", "Gaming", "Roast", "Steam Library", "Game Stats", "AI Roast", "Gaming Habits"],
  authors: [{ name: "David" }],
  creator: "David",
  publisher: "Steam Library Roaster",
  metadataBase: new URL("https://steam-roaster-rho.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://steam-roaster-rho.vercel.app",
    siteName: "Steam Library Roaster",
    title: "Steam Library Roaster | Roast Your Gaming Habits 🔥",
    description: "Enter your Steam ID and get roasted by AI. Discover your gaming habits and share the burns!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Steam Library Roaster - Get Roasted by AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steam Library Roaster | Roast Your Gaming Habits 🔥",
    description: "Enter your Steam ID and get roasted by AI. Discover your gaming habits and share the burns!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
