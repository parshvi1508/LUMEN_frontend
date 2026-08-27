import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import {
  QueryProvider,
  AuthProvider,
  ToastProvider,
  ThemeProvider,
} from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://lumencrm-frontend.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Lumen - Customer Intelligence Platform",
    template: "%s | Lumen",
  },
  description:
    "Lumen scores every customer for churn risk and value, shows why each is flagged, and hands your team a ranked action list with the revenue attached.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Lumen",
    title: "Lumen - Customer Intelligence Platform",
    description:
      "See which customers are leaking revenue and exactly who to win back. Explainable ML scores, SHAP reasons, and one-click win-back campaigns.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen - Customer Intelligence Platform",
    description:
      "See which customers are leaking revenue and exactly who to win back.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Lumen",
              url: SITE_URL,
              description:
                "Customer intelligence platform that scores every customer for churn risk and value with explainable ML.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
              <CookieBanner />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
