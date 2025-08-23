import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BudEvent - Discover Amazing Events",
  description: "Find and join the best events in your area",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-[#FAF9F6] text-[#2D3436] antialiased`}>
        <div className="max-w-3xl mx-auto p-4">
          <TopNav />
          {children}
        </div>
      </body>
    </html>
  );
}
