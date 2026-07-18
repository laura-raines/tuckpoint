import type { Metadata } from "next";
import { IBM_Plex_Mono, Public_Sans, Zilla_Slab } from "next/font/google";
import "./globals.css";
import BuildingHeader from "@/components/building-header";

const zillaSlab = Zilla_Slab({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-zilla-slab",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Tuckpoint",
  description:
    "The building's record — permit history, capital timeline, and §22.1 disclosures for Chicago's self-managed condo buildings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${zillaSlab.variable} ${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <BuildingHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
