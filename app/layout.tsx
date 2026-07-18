import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  IBM_Plex_Mono,
  Lora,
  Source_Serif_4,
  Zilla_Slab,
} from "next/font/google";
import "./globals.css";
import BuildingHeader from "@/components/building-header";

const zillaSlab = Zilla_Slab({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-zilla-slab",
});

const lora = Lora({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-lora",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

// Homepage body serif — scoped to `.site`, never applied to app routes.
const sourceSerif = Source_Serif_4({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "Tuckpoint — The building's memory",
  description:
    "The shared record for Chicago's self-managed two-, three-, and six-flats — permit history, capital timeline, per-owner cost shares, and the §22.1 Seller's Packet the day anyone sells.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Signed-out visitors get the marketing homepage, which brings its own nav,
  // footer, and full-bleed chrome. Signed-in stewards get the app shell.
  const signedIn = (await cookies()).has("steward");

  return (
    <html
      lang="en"
      className={`${zillaSlab.variable} ${lora.variable} ${plexMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {signedIn ? (
          <div className="flex min-h-full flex-col">
            <BuildingHeader />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
              {children}
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
