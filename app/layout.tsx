import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CompliancePulse - Never miss a compliance deadline again",
  description: "AI-powered compliance calendar for regulated SMBs. ADA Title II deadline April 24, 2026 — 15 days left. Non-compliance = lawsuits + $75K-$150K fines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
