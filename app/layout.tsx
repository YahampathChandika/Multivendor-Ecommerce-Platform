// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FashionHub - Best Trendy Collection",
  description:
    "Discover the best collection of trendy fashion items. Quality, style, and comfort in every piece.",
  keywords: "fashion, clothing, trendy, style, ecommerce, shopping",
  authors: [{ name: "FashionHub" }],
  openGraph: {
    title: "FashionHub - Best Trendy Collection",
    description: "Discover the best collection of trendy fashion items",
    type: "website",
    siteName: "FashionHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
