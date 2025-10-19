import type { Metadata } from "next";
import { Joan } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";

const joan = Joan({
  variable: "--font-joan",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Gas Station Management System",
  description: "Digital Management & Reporting System for Gas Station Operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${joan.variable} antialiased bg-gray-50`}
      >
        <div className="h-screen flex overflow-hidden">
          <Navigation />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
