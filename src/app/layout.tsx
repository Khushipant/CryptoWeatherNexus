import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import WebSocketInitializer from "@/components/WebSocketInitializer";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoWeather Nexus",
  description: "Weather, Crypto, and News Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative`}>
        <StoreProvider>
          <WebSocketInitializer />
          {children}
          <ToastProvider />
        </StoreProvider>
      </body>
    </html>
  );
}
