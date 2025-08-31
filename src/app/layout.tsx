import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";

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
        <SessionProvider>
          <div className="w-full flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 bg-white border-b border-gray-200">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
