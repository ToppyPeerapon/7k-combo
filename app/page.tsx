import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-gray-900">7K Builder</span>
          <Link href="/builder"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Team Builder →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-6">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
          จดโพย Guild War<br />ง่าย ๆ ใน 10 วินาที
        </h1>
        <p className="text-gray-500 text-lg max-w-md">
          สร้างทีม · วางแผนสกิล · แชร์ให้เพื่อนในกิลด์ — ฟรี ไม่ต้องสมัคร
        </p>
        <Link href="/builder"
          className="mt-2 inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold px-8 py-3 rounded-2xl text-base transition-all shadow-md">
          เริ่มสร้างทีม
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {["Formation F/B", "Skill Sequence", "Speed Priority", "Export Image"].map(f => (
            <span key={f} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">{f}</span>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 gap-1 flex flex-col">
        <p>7K Builder — Seven Knights Rebirth Guild War Planner</p>
        <p>ฟรี · ไม่ต้องสมัคร · ใช้ได้ทั้งมือถือและคอม</p>
      </footer>

    </div>
  );
}
