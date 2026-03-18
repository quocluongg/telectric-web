import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://telectric.vn";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "TElectric - Chuyên dụng cụ đo lường chính hãng",
  description: "Chuyên cung cấp các loại dụng cụ đo lường điện chính hãng, giá tốt nhất thị trường.",
  alternates: {
    canonical: defaultUrl,
  },
  openGraph: {
    title: "TElectric - Chuyên dụng cụ đo lường chính hãng",
    description: "Chuyên cung cấp các loại dụng cụ đo lường điện chính hãng, giá tốt nhất thị trường.",
    type: "website",
    siteName: "TElectric",
    images: ["/img/banner.png"],
  },
  icons: {
    icon: [
      { url: '/img/icon.png' },
      new URL('/img/icon.png', 'https://telectric.vn').href,
    ],
    apple: [
      { url: '/img/icon.png' },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TElectric - Chuyên dụng cụ đo lường chính hãng",
    description: "Chuyên cung cấp các loại dụng cụ đo lường điện chính hãng, giá tốt nhất thị trường.",
    images: ["/img/banner.png"],
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

import { Toaster } from "@/components/ui/toaster";
import DefaultLayout from "@/components/layout/DefaultLayout";
import ZaloButton from "@/components/common/ZaloButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        {/* Organization Structured Data cho Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TELECTRIC",
              url: "https://telectric.vn",
              logo: "https://telectric.vn/img/icon.png",
              description: "Chuyên cung cấp các loại dụng cụ đo lường điện chính hãng, giá tốt nhất thị trường.",
              sameAs: [],
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {/* <DefaultLayout> */}
          {children}
          {/* </DefaultLayout> */}
          <Toaster />
          <ZaloButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
