import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "7K Builder - จดโพย Guild War ง่าย ๆ ใน 10 วินาที",
  description:
    "จดโพย Guild War ง่าย ๆ ไม่ต้องเตรียม assets ไม่ต้องใช้ Google Sheet — แค่จิ้มก็ได้โพยของกิลด์ตัวเองแล้ว ฟรี ไม่ต้องสมัคร",
  keywords: ["7K Builder", "Guild War", "Seven Knights", "โพย", "กิลด์วอร์", "seven knights 2"],
  openGraph: {
    title: "7K Builder - จดโพย Guild War ง่าย ๆ ใน 10 วินาที",
    description:
      "ฟรี · ไม่ต้องสมัคร · ใช้ได้ทั้งมือถือและคอม — จดโพย Guild War ในเวลาเพียง 10 วินาที",
    type: "website",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "7K Builder - จดโพย Guild War",
    description: "จดโพย Guild War ง่าย ๆ ใน 10 วินาที",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={geist.variable}>
      <body className="min-h-screen bg-white antialiased font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
