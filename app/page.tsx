import Link from "next/link";
import Image from "next/image";

const BOSS_IMG = "/screenshots/boss.webp";

const DEMO_HEROES = [
  { img: "/heroes/l+_rudy.webp",    name: "Rudy" },
  { img: "/heroes/l+_rachel.webp",  name: "Rachel" },
  { img: "/heroes/l+_dellons.webp", name: "Dellons" },
  { img: "/heroes/l+_kris.webp",    name: "Kris" },
  { img: "/heroes/l+_eileene.webp", name: "Eileene" },
];

const DEMO_SEQ = [
  { skill: "/skills/l+_rudy_2.webp",    hero: "/heroes/l+_rudy.webp" },
  { skill: "/skills/l+_rachel_2.webp",  hero: "/heroes/l+_rachel.webp" },
  { skill: "/skills/l+_dellons_2.webp", hero: "/heroes/l+_dellons.webp" },
  { skill: "/skills/l+_rudy_3.webp",    hero: "/heroes/l+_rudy.webp" },
  { skill: "/skills/l+_kris_2.webp",    hero: "/heroes/l+_kris.webp" },
  { skill: "/skills/l+_eileene_2.webp", hero: "/heroes/l+_eileene.webp" },
  { skill: "/skills/l+_rachel_3.webp",  hero: "/heroes/l+_rachel.webp" },
  { skill: "/skills/l+_dellons_3.webp", hero: "/heroes/l+_dellons.webp" },
  { skill: "/skills/l+_rudy_2.webp",    hero: "/heroes/l+_rudy.webp" },
  { skill: "/skills/l+_kris_3.webp",    hero: "/heroes/l+_kris.webp" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-white">7K Builder</span>
          <Link href="/builder" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Team Builder →
          </Link>
        </div>
      </nav>

      {/* Hero — split layout */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* LEFT: Boss */}
        <div className="relative lg:w-1/2 h-[50vh] lg:h-auto overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BOSS_IMG}
            alt="Raid Boss"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent lg:hidden" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0f172a] hidden lg:block" />
        </div>

        {/* RIGHT: Builder preview + CTA */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center px-6 gap-3 text-center pt-10 pb-10">
          <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">Seven Knights Rebirth</span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            สร้าง Team เพื่อทำคะแนนให้สูง<br />สำหรับเหล่าบอสต่างๆ
          </h1>
          <p className="text-slate-400 text-sm max-w-xs">
            เคยลืมลำดับ Skill ตอนสู้บอสไหม?<br />
            จดโพยลำดับ Skill ของแต่ละฮีโร่ไว้ที่นี่ แล้วแชร์ให้ได้เลย
          </p>

          {/* Formation mockup */}
          <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-2.5 text-left">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Formation</p>
            <div className="flex gap-1.5 justify-center">
              {DEMO_HEROES.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="w-10 aspect-[3/4] rounded-lg overflow-hidden">
                    <Image src={h.img} alt={h.name} width={40} height={54} className="object-cover object-top w-full h-full" />
                  </div>
                  <span className="text-[7px] text-slate-400 truncate w-10 text-center">{h.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sequence mockup */}
          <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-2.5 text-left">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Skill Sequence</p>
            <div className="grid grid-cols-5 gap-1">
              {DEMO_SEQ.map((s, i) => (
                <div key={i} className="relative">
                  <div className="w-full aspect-square rounded-lg overflow-hidden border border-white/10">
                    <Image src={s.skill} alt="" width={40} height={40} className="object-cover w-full h-full"
                      onError={undefined} />
                  </div>
                  <span className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-slate-700 text-white rounded-full text-[7px] font-bold flex items-center justify-center">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/builder"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white font-bold px-8 py-3 rounded-2xl text-base transition-all shadow-lg shadow-blue-500/30 mt-2">
            เริ่มสร้างทีม
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>

      {/* How to use */}
      <section className="bg-[#0a1120] border-t border-white/10 py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center mb-2">วิธีใช้งาน</p>
          <h2 className="text-xl font-extrabold text-white text-center mb-10">ใช้งานง่าย 4 ขั้นตอน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                step: "1",
                title: "เลือกฮีโร่ใส่ Formation",
                desc: "คลิกช่องว่างแล้วเลือกฮีโร่ที่ต้องการ สูงสุด 5 ตัว จัดตำแหน่งหน้า/หลังได้ตามต้องการ",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "กำหนด Speed & Stats",
                desc: "ใส่ค่า Speed และเลือก Stat สำคัญ เช่น Crit Rate, Weakness ให้แต่ละฮีโร่",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "จัดลำดับ Skill Sequence",
                desc: "ลาก Skill จาก Pool มาเรียงลำดับที่ต้องการใช้ในบอส แล้วบันทึกไว้เป็นโพย",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                  </svg>
                ),
              },
              {
                step: "4",
                title: "แชร์ให้เพื่อนในกิลด์",
                desc: "กด Share เพื่อบันทึกเป็นรูป แล้วแชร์ในกลุ่มได้เลย ไม่ต้องสมัครสมาชิก",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      STEP {step}
                    </span>
                    <span className="text-sm font-bold text-white">{title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/builder"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white font-bold px-8 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/30">
              ลองใช้งานเลย
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-5 text-center text-xs text-slate-500 flex flex-col gap-1">
        <p>7K Builder — Seven Knights Rebirth Planner</p>
        <p>ฟรี · ไม่ต้องสมัคร · ใช้ได้ทั้งมือถือและคอม</p>
        <p className="text-slate-600">© {new Date().getFullYear()} 7K Builder. All rights reserved.</p>
      </footer>

    </div>
  );
}
