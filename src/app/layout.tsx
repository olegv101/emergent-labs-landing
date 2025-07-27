import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Emergent Labs",
  description: "Emergent Labs - Making work colourful",
  openGraph: {
    title: "Emergent Labs",
    description: "Emergent Labs - Making work colourful",
    images: [
      {
        url: "/social-image.png",
        width: 1200,
        height: 630,
        alt: "Emergent Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emergent Labs",
    description: "Emergent Labs - Making work colourful",
    images: ["/social-image.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
