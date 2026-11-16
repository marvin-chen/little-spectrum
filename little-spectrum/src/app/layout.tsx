import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Little Spectrum",
    template: "%s | Little Spectrum",
  },
  description: "A little color. A little closer. Short games, shared moments, and a garden that grows with your friends.",
  applicationName: "Little Spectrum",
  appleWebApp: { capable: true, title: "Little Spectrum", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#15131d" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
