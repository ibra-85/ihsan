import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Amiri } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/i18n-provider";
import { NavbarDynamic } from "@/components/navbar-dynamic";
import { PwaRegister } from "@/components/pwa-register";
import { ConfirmProvider } from "@/components/confirm-provider";
import { SonnerToaster } from "@/components/sonner-toaster";
import { cn } from "@/lib/utils";

const inter  = Inter({ subsets: ['latin'], variable: '--font-sans' });
const amiri  = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-arabic' });

export const metadata: Metadata = {
  title: "Ihsan — Bibliothèque islamique",
  description: "Ihsan — Plateforme d'apprentissage du Coran et des sciences islamiques",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ihsan",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)",  color: "#15803d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={cn("font-sans", inter.variable, amiri.variable)}>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ConfirmProvider>
              <NavbarDynamic />
              <main className="flex-1">{children}</main>
            </ConfirmProvider>
            <SonnerToaster />
          </LanguageProvider>
        </ThemeProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
