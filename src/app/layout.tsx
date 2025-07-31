import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { ReduxProvider } from "@/components/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "errandmate",
  description: "errandmate team Incorporated",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* Main content with proper top padding to account for fixed header */}
              <main className="relative w-full min-h-screen">
                {/* Actual content container */}
                <div className="w-full min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4.5rem)] lg:min-h-[calc(100vh-5rem)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                  {children}
                </div>
              </main>
            </ThemeProvider>
          </ReduxProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
