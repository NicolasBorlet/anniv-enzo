import { AuthProvider } from "@/components/auth/auth-provider";
import { SparkleField } from "@/components/magic/sparkle-field";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Cormorant_Infant, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorantInfant = Cormorant_Infant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Anniv Enzo",
    template: "%s | Anniv Enzo",
  },
  description:
    "Galerie photos collaborative pour célébrer l'anniversaire d'Enzo — partagez et revivez vos meilleurs souvenirs.",
  openGraph: {
    title: "Anniv Enzo",
    description:
      "Galerie photos collaborative pour célébrer l'anniversaire d'Enzo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfairDisplay.variable} ${cormorantInfant.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <Analytics />
      <body className="relative flex min-h-full flex-col">
        <SparkleField />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Aller au contenu principal
        </a>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
