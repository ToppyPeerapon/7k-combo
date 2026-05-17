import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "7K Builder — Team Planner for Seven Knights Rebirth",
  description:
    "Build your formation, plan your skill sequence, and share it with your guild. Free, no sign-up required.",
  keywords: ["7K Builder", "Seven Knights Rebirth", "team planner", "skill sequence", "raid boss", "seven knights"],
  openGraph: {
    title: "7K Builder — Team Planner for Seven Knights Rebirth",
    description:
      "Build your formation · Plan skill order · Share with your guild. Free, no sign-up, works on mobile and desktop.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "7K Builder — Team Planner for Seven Knights Rebirth",
    description: "Build your formation · Plan skill order · Share with your guild. Free, no sign-up required.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={geist.variable}>
      <body className="bg-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
