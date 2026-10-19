import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Motion from "@/components/kit/Motion";
const display = localFont({ src: "../public/fonts/space-grotesk-latin-wght-normal.woff2", variable: "--f-display", weight: "300 700", display: "swap" });
const sans = localFont({ src: "../public/fonts/inter-latin-wght-normal.woff2", variable: "--f-sans", weight: "100 900", display: "swap" });
const mono = localFont({ src: "../public/fonts/jetbrains-mono-latin-wght-normal.woff2", variable: "--f-mono", weight: "100 800", display: "swap" });
export const metadata: Metadata = { title: "Anorix Cosmos — Fly the solar system", description: "A 3D solar system explorer in the browser: real planet textures, real orbital periods, NASA facts. By Anorix.", openGraph: { title: "Anorix Cosmos — Fly the solar system", description: "A 3D solar system explorer in the browser. By Anorix.", type: "website" } };
export const viewport: Viewport = { themeColor: "#05060a", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} /></head>
      <body><Motion />{children}</body>
    </html>
  );
}
