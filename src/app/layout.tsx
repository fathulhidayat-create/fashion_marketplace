import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "FashionMarket — Marketplace Fashion Mix & Formal",
    template: "%s | FashionMarket",
  },
  description:
    "Platform marketplace fashion terpercaya. Temukan koleksi mix & formal terbaik dari penjual pilihan di seluruh Indonesia.",
  keywords: ["fashion", "marketplace", "baju", "formal", "casual", "Indonesia"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "FashionMarket",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} antialiased bg-bg`}>
        <SessionProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
