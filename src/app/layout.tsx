import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NUEDU — Học viện đào tạo nghề PT Gym",
    template: "%s | NUEDU",
  },
  description:
    "NUEDU là học viện đào tạo huấn luyện viên thể hình (PT Gym) hàng đầu Việt Nam — giải phẫu, dinh dưỡng, kỹ thuật tập luyện, thực hành và giới thiệu việc làm sau tốt nghiệp.",
  openGraph: {
    siteName: "NUEDU",
    type: "website",
    images: [`${SITE_URL}/images/logo.png`],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  );
}
