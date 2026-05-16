"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">7K Builder</Link>
          <Link href="/builder" className={`text-sm font-medium transition-colors ${pathname === "/builder" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
            Team Builder
          </Link>
        </div>
        <button
          onClick={() => setDark(!dark)}
          aria-label="Toggle dark mode"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
