"use client";
import { useState, useId, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { HEROES, Hero } from "@/app/data/heroes";
import { toPng } from "html-to-image";

type TeamSlot = {
  hero: Hero | null;
  weapon: string[];
  notes: string;
  speed: string;
};

type SkillStep = {
  id: string;
  slotIndex: number;
  skillNum: 2 | 3;
};

type Formation = "1/4" | "2/3" | "3/2" | "4/1";
const FRONT_COUNT: Record<Formation, number> = { "1/4": 1, "2/3": 2, "3/2": 3, "4/1": 4 };
const FORMATIONS: Formation[] = ["1/4", "2/3", "3/2", "4/1"];

const emptySlot = (): TeamSlot => ({ hero: null, weapon: [], notes: "", speed: "" });

const STAT_BADGES = [
  { id: "crit_rate", label: "Crit Rate 100", icon: "/icons/stats/icon_crit_rate.webp",              on: "bg-red-500 text-white border-red-500",      off: "bg-white text-red-600 border-red-300 hover:bg-red-50" },
  { id: "weakness",  label: "Weakness 100",  icon: "/icons/stats/icon_weakness_hit_chance.webp",    on: "bg-orange-500 text-white border-orange-500", off: "bg-white text-orange-600 border-orange-300 hover:bg-orange-50" },
  { id: "crit_dmg",  label: "Crit Dmg ↑",   icon: "/icons/stats/icon_crit_damage.webp",            on: "bg-yellow-500 text-white border-yellow-500", off: "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50" },
  { id: "atk",       label: "Atk (บิสกิต)", icon: "/icons/stats/icon_physical_attack.webp",        on: "bg-green-500 text-white border-green-500",   off: "bg-white text-green-700 border-green-300 hover:bg-green-50" },
  { id: "def",       label: "Def",           icon: "/icons/stats/icon_defense.webp",                on: "bg-blue-500 text-white border-blue-500",     off: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50" },
] as const;

function skillImg(hero: Hero, n: number) {
  return `/skills/${hero.rarity}_${hero.id}_${n}.webp`;
}

export default function BuilderClient() {
  const uid = useId();
  const dragFromRef = useRef<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragInsertPos, setDragInsertPos] = useState<number | null>(null);

  const formationDragRef = useRef<number | null>(null);
  const [formationDragOver, setFormationDragOver] = useState<number | null>(null);

  const [team, setTeam] = useState<TeamSlot[]>(Array.from({ length: 5 }, emptySlot));
  const [formation, setFormation] = useState<Formation>("2/3");
  const [sequence, setSequence] = useState<SkillStep[]>([]);
  const [pickerOpen, setPickerOpen] = useState<number | null>(null);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [search, setSearch] = useState("");

  const filteredHeroes = HEROES.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
  const usedIds = team.map(s => s.hero?.id).filter(Boolean);
  const filledCount = team.filter(s => s.hero !== null).length;
  const frontCount = FRONT_COUNT[formation];

  // Live drag preview: rearrange sequence to show where the card will land
  const isDragging = dragFrom !== null && dragInsertPos !== null;
  const previewSequence = (() => {
    if (!isDragging) return sequence;
    const from = dragFrom!;
    const to = dragInsertPos!;
    if (from === to || from === to - 1) return sequence;
    const next = [...sequence];
    const [item] = next.splice(from, 1);
    next.splice(to > from ? to - 1 : to, 0, item);
    return next;
  })();
  const movedToIdx = isDragging && dragFrom !== dragInsertPos && dragFrom !== dragInsertPos! - 1
    ? (dragInsertPos! > dragFrom! ? dragInsertPos! - 1 : dragInsertPos!)
    : null;

  function selectHero(hero: Hero) {
    if (pickerOpen === null) return;
    const cur = pickerOpen;
    const newTeam = team.map((s, i) => i === cur ? { ...s, hero } : s);
    setTeam(newTeam);
    setActiveSlot(cur);
    setSearch("");
    const remaining = [0, 1, 2, 3, 4].filter(i => i !== cur && newTeam[i].hero === null);
    setPickerOpen(remaining.length === 0 ? null : (remaining.find(i => i > cur) ?? remaining[0]));
  }

  function removeHero(i: number) {
    setTeam(prev => { const next = [...prev]; next[i] = emptySlot(); return next; });
    setSequence(prev => prev.filter(s => s.slotIndex !== i));
  }

  function toggleBadge(i: number, badge: string) {
    setTeam(prev => {
      const next = [...prev];
      const cur = next[i].weapon;
      next[i] = { ...next[i], weapon: cur.includes(badge) ? cur.filter(b => b !== badge) : [...cur, badge] };
      return next;
    });
  }

  function updateField(i: number, field: "notes" | "speed", value: string) {
    setTeam(prev => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
  }

  function setPriority(i: number, value: string) {
    setTeam(prev => prev.map((s, idx) => {
      if (idx === i) return { ...s, speed: s.speed === value ? "" : value };
      if (s.speed === value) return { ...s, speed: "" };
      return s;
    }));
  }

  function swapSlots(a: number, b: number) {
    if (a === b) return;
    setTeam(prev => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
    setSequence(prev => prev.map(step => {
      if (step.slotIndex === a) return { ...step, slotIndex: b };
      if (step.slotIndex === b) return { ...step, slotIndex: a };
      return step;
    }));
  }

  function addStep(slotIndex: number, skillNum: 2 | 3) {
    setSequence(prev => [...prev, { id: `${uid}-${Date.now()}-${Math.random()}`, slotIndex, skillNum }]);
  }

  function removeStep(id: string) {
    setSequence(prev => prev.filter(s => s.id !== id));
  }

  function insertStep(fromIdx: number, insertPos: number) {
    if (fromIdx === insertPos || fromIdx === insertPos - 1) return;
    setSequence(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      const adjustedPos = insertPos > fromIdx ? insertPos - 1 : insertPos;
      next.splice(adjustedPos, 0, item);
      return next;
    });
  }

  function renderSlot(s: TeamSlot, i: number) {
    const isActive = activeSlot === i;
    return (
      <div key={i}
        draggable={!!s.hero}
        onDragStart={(e) => { formationDragRef.current = i; e.dataTransfer.effectAllowed = "move"; }}
        onDragOver={(e) => { e.preventDefault(); setFormationDragOver(i); }}
        onDragLeave={() => setFormationDragOver(null)}
        onDrop={(e) => { e.preventDefault(); if (formationDragRef.current !== null) swapSlots(formationDragRef.current, i); formationDragRef.current = null; setFormationDragOver(null); }}
        onDragEnd={() => { formationDragRef.current = null; setFormationDragOver(null); }}
        className={`relative z-20 w-[68px] md:w-[85px] flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition-all shrink-0
          ${isActive ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-gray-50"}
          ${formationDragOver === i ? "border-blue-400 bg-blue-50 scale-105 shadow-md" : ""}
          ${s.hero ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
        onClick={() => { setActiveSlot(i); if (!s.hero) setPickerOpen(i); }}>
        <div className="relative w-full">
          {s.hero ? (
            <>
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-200">
                <img src={s.hero.image} alt={s.hero.name} className="object-cover object-top w-full h-full" />
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeHero(i); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
            </>
          ) : (
            <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors text-xl">+</div>
          )}
        </div>
        <p className="text-[10px] text-center font-medium text-gray-700 leading-tight min-h-[1.5rem] flex items-center">
          {s.hero ? s.hero.name : <span className="text-gray-400">Empty</span>}
        </p>
      </div>
    );
  }

  const slot = team[activeSlot];
  const heroRow = activeSlot < frontCount ? "Front" : "Back";
  const [capturing, setCapturing] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileTab, setMobileTab] = useState<"formation" | "skills">("formation");

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function captureImages() {
    setCapturing(true);
    try {
      const opts = { backgroundColor: "#f9fafb", pixelRatio: 2 };
      const detailEl = document.getElementById("share-detail-capture");
      const seqEl = document.getElementById("skill-sequence");
      if (!detailEl || !seqEl) return;
      const [detailUrl, seqUrl] = await Promise.all([
        toPng(detailEl, opts),
        toPng(seqEl, opts),
      ]);

      const toFile = (dataUrl: string, name: string) => {
        const [header, data] = dataUrl.split(",");
        const mime = header.match(/:(.*?);/)![1];
        const bytes = atob(data);
        const u8 = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) u8[i] = bytes.charCodeAt(i);
        return new File([u8], name, { type: mime });
      };

      const files = [toFile(detailUrl, "formation.png"), toFile(seqUrl, "sequence.png")];
      if (typeof navigator.canShare === "function" && navigator.canShare({ files })) {
        await navigator.share({ files, title: "7K Builder Team" });
        return;
      }

      const dl = (url: string, name: string) => {
        const a = document.createElement("a");
        a.href = url; a.download = name; a.click();
      };
      dl(detailUrl, "formation.png");
      dl(seqUrl, "sequence.png");
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div id="builder-root" className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* ── DESKTOP NAVBAR ── */}
      <nav className="hidden md:flex shrink-0 items-center justify-between px-5 h-12 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link href="/"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/" className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors">7K Builder</Link>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-500">Team Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.73 0-.71-.71M6.34 6.34l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
            {dark ? "Light" : "Dark"}
          </button>
          <button onClick={captureImages} disabled={capturing}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-400 transition px-3 py-1.5 rounded-lg disabled:opacity-60">
            {capturing ? (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
            Share
          </button>
        </div>
      </nav>

      {/* ── MOBILE TAB BAR ── */}
      <div className="md:hidden flex items-center shrink-0 bg-white border-b border-gray-200 px-2 gap-1">
        {/* Home button */}
        <Link href="/" className="w-9 h-9 flex items-center justify-center text-gray-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        {/* Tabs */}
        {([
          { id: "formation", label: "Formation" },
          { id: "skills",    label: "Skills & Seq" },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setMobileTab(tab.id)}
            className={`flex-1 py-3 text-xs font-semibold transition border-b-2 ${mobileTab === tab.id ? "text-blue-600 border-blue-500" : "text-gray-500 border-transparent"}`}>
            {tab.label}
          </button>
        ))}
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center text-gray-500 shrink-0">
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.73 0-.71-.71M6.34 6.34l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>

      <div id="builder-main" className="flex-1 flex flex-row gap-3 p-3 min-h-0 overflow-hidden">

        {/* ── LEFT STACK: Formation + Hero Detail ── */}
        <div id="left-panel" className={`flex-col gap-3 w-full md:w-[400px] md:shrink-0 overflow-y-auto min-h-0 pb-24 md:pb-0 ${mobileTab === "formation" ? "flex" : "hidden md:flex"}`}>

        {/* capture wrapper for share image 1 */}
        <div id="share-detail-capture" className="flex flex-col gap-3">

        {/* ── Formation ── */}
        <section id="formation" className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Formation</h2>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
              {FORMATIONS.map(f => (
                <button key={f} onClick={() => setFormation(f)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all ${formation === f ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <div className="relative flex gap-2 justify-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
                <span className="text-[10px] font-bold text-orange-500 shrink-0 pr-1">F</span>
                <div className="flex-1 border-t-2 border-dashed border-orange-300/70" />
              </div>
              {team.slice(0, frontCount).map((s, i) => renderSlot(s, i))}
            </div>
            <div className="relative flex gap-2 justify-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
                <span className="text-[10px] font-bold text-indigo-400 shrink-0 pr-1">B</span>
                <div className="flex-1 border-t-2 border-dashed border-indigo-300/70" />
              </div>
              {team.slice(frontCount).map((s, i) => renderSlot(s, frontCount + i))}
            </div>
          </div>
        </section>

        {/* ── Hero Detail (all slots) ── */}
        <section id="hero-detail" className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col gap-3">
          <h2 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Hero Detail</h2>
          {team.map((s, i) => {
            const row = i < frontCount ? "F" : "B";
            return (
              <div key={i} className={`flex flex-col gap-2 pb-4 ${i < 4 ? "border-b border-gray-100" : ""}`}>
                <div className="flex gap-3">
                  {/* Hero image */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    {s.hero ? (
                      <>
                        <div className="w-14 h-[72px] rounded-xl overflow-hidden border border-gray-200">
                          <img src={s.hero.image} alt={s.hero.name} className="object-cover object-top w-full h-full" />
                        </div>
                        <p className="text-[8px] text-center font-semibold text-gray-500 w-14 truncate">{s.hero.name}</p>
                      </>
                    ) : (
                      <div className="w-14 h-[72px] rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                        <button onClick={() => { setActiveSlot(i); setPickerOpen(i); }} className="text-lg text-blue-400">+</button>
                      </div>
                    )}
                    <p className="text-[8px] text-gray-400">{row}{i + 1}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {/* Speed */}
                    <div className="flex items-center gap-1">
                      <img src="/icons/stats/icon_speed.webp" alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                      <span className="text-[9px] text-gray-400 shrink-0 w-10">Speed</span>
                      {[1, 2, 3, 4, 5].map(n => {
                        const active = s.speed === String(n);
                        return (
                          <button key={n} onClick={() => setPriority(i, String(n))}
                            className={`flex-1 h-5 rounded text-[9px] font-bold border transition-all ${active ? "bg-amber-400 text-white border-amber-400" : "bg-white text-gray-400 border-gray-200 hover:border-amber-300 hover:text-amber-500"}`}>
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    {/* Stat badges — 2-column grid with priority order */}
                    <div className="grid grid-cols-2 gap-1">
                      {STAT_BADGES.map(b => {
                        const active = s.weapon.includes(b.id);
                        const priority = active ? s.weapon.indexOf(b.id) + 1 : null;
                        return (
                          <button key={b.id} onClick={() => toggleBadge(i, b.id)}
                            className={`relative flex items-center gap-1 px-2 py-1 rounded-lg border text-left transition-all ${active ? b.on : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                            {active && (
                              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-gray-900 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md leading-none border-2 border-white">
                                {priority}
                              </span>
                            )}
                            <img src={b.icon} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                            <span className="text-[9px] font-medium truncate">{b.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <textarea value={s.notes}
                  onChange={(e) => updateField(i, "notes", e.target.value)}
                  placeholder="Notes..."
                  maxLength={255}
                  rows={1}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1 text-[10px] outline-none focus:ring-2 focus:ring-blue-200 transition resize-none" />
              </div>
            );
          })}
        </section>

        </div>{/* end share-detail-capture */}

        {/* ── Skill Pool (desktop only — hidden on mobile) ── */}
        <section className="hidden md:flex bg-white rounded-2xl border border-gray-200 p-3 flex-col gap-2">
          <h2 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Skill Pool</h2>
          {filledCount > 0 ? (() => {
            const filledSlots = team.map((s, i) => ({ slot: s, idx: i })).filter(({ slot }) => slot.hero !== null);
            return (
              <div className="bg-gray-50 rounded-xl p-2 space-y-1.5">
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">คลิกสกิลเพื่อเพิ่ม</p>
                <div className="grid gap-x-2 gap-y-1.5" style={{ gridTemplateColumns: `repeat(${filledSlots.length}, minmax(44px, 44px))` }}>
                  {filledSlots.map(({ slot, idx }) => (
                    <div key={`h-${idx}`} className="flex justify-center">
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200">
                        <img src={slot.hero!.image} alt={slot.hero!.name} className="object-cover object-top w-full h-full" />
                      </div>
                    </div>
                  ))}
                  {filledSlots.map(({ slot, idx }) => (
                    <button key={`s2-${idx}`} onClick={() => addStep(idx, 2)}
                      className="w-11 h-11 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all bg-gray-100">
                      <img src={skillImg(slot.hero!, 2)} alt="skill 2" className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = slot.hero!.image; }} />
                    </button>
                  ))}
                  {filledSlots.map(({ slot, idx }) => (
                    <button key={`s3-${idx}`} onClick={() => addStep(idx, 3)}
                      className="w-11 h-11 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all bg-gray-100">
                      <img src={skillImg(slot.hero!, 3)} alt="skill 3" className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = slot.hero!.image; }} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })() : (
            <p className="text-xs text-gray-400">เพิ่มฮีโร่ในทีมก่อน</p>
          )}
        </section>

        </div>{/* end left stack */}

        {/* ── PANEL 2: Skills + Sequence ── */}
        <div className={`flex-col gap-3 min-h-0 md:flex md:flex-1 md:min-w-0 ${mobileTab === "skills" ? "flex flex-1 min-w-0" : "hidden md:flex"}`}>

        {/* ── Skill Pool (mobile only) ── */}
        <section id="skill-pool" className="md:hidden bg-white rounded-2xl border border-gray-200 p-3 flex flex-col gap-2 shrink-0">
          <h2 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Skill Pool</h2>
          {filledCount > 0 ? (() => {
            const filledSlots = team.map((s, i) => ({ slot: s, idx: i })).filter(({ slot }) => slot.hero !== null);
            return (
              <div className="bg-gray-50 rounded-xl p-2 space-y-1.5">
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">คลิกสกิลเพื่อเพิ่ม</p>
                <div className="grid gap-x-2 gap-y-1.5" style={{ gridTemplateColumns: `repeat(${filledSlots.length}, minmax(44px, 44px))` }}>
                  {filledSlots.map(({ slot, idx }) => (
                    <div key={`h-${idx}`} className="flex justify-center">
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200">
                        <img src={slot.hero!.image} alt={slot.hero!.name} className="object-cover object-top w-full h-full" />
                      </div>
                    </div>
                  ))}
                  {filledSlots.map(({ slot, idx }) => (
                    <button key={`s2-${idx}`} onClick={() => addStep(idx, 2)}
                      className="w-11 h-11 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all bg-gray-100">
                      <img src={skillImg(slot.hero!, 2)} alt="skill 2" className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = slot.hero!.image; }} />
                    </button>
                  ))}
                  {filledSlots.map(({ slot, idx }) => (
                    <button key={`s3-${idx}`} onClick={() => addStep(idx, 3)}
                      className="w-11 h-11 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all bg-gray-100">
                      <img src={skillImg(slot.hero!, 3)} alt="skill 3" className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = slot.hero!.image; }} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })() : (
            <p className="text-xs text-gray-400">เพิ่มฮีโร่ในทีมก่อน</p>
          )}
        </section>

        {/* ── Sequence ── */}
        <section id="skill-sequence" className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col gap-2 flex-1 min-h-0">
          <h2 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Sequence</h2>
          <div className="flex-1 overflow-y-auto min-h-0">
            {sequence.length > 0 ? (
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
                {previewSequence.map((step, idx) => {
                      const heroSlot = team[step.slotIndex];
                      const isBeingDragged = dragFrom !== null && sequence[dragFrom]?.id === step.id && isDragging;
                      const isPreviewTarget = idx === movedToIdx;
                      return (
                        <div
                          key={step.id}
                          id={`seq-step-${idx + 1}`}
                          draggable
                          onDragStart={(e) => {
                            const originalIdx = sequence.indexOf(step);
                            dragFromRef.current = originalIdx;
                            setDragFrom(originalIdx);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            const originalIdx = sequence.indexOf(step);
                            if (originalIdx === dragFromRef.current) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDragInsertPos(e.clientX < rect.left + rect.width / 2 ? originalIdx : originalIdx + 1);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (dragFromRef.current !== null && dragInsertPos !== null) insertStep(dragFromRef.current, dragInsertPos);
                            dragFromRef.current = null; setDragFrom(null); setDragInsertPos(null);
                          }}
                          onDragEnd={() => { dragFromRef.current = null; setDragFrom(null); setDragInsertPos(null); }}
                          className={`flex flex-col items-center gap-1 rounded-xl p-1.5 cursor-grab active:cursor-grabbing select-none transition-all border-2
                            ${isPreviewTarget ? "border-blue-400 bg-blue-50 scale-105 shadow-md" : "border-gray-100 bg-gray-50"}
                            ${isBeingDragged ? "opacity-30" : "opacity-100"}`}>
                          <span className="pointer-events-none w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div id={`seq-skill-${idx + 1}`} className="pointer-events-none w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            {heroSlot.hero && (
                              <img src={skillImg(heroSlot.hero, step.skillNum)} alt=""
                                className="object-cover w-full h-full"
                                onError={(e) => { (e.target as HTMLImageElement).src = heroSlot.hero!.image; }} />
                            )}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                            className="w-full py-0.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition text-[10px] font-bold flex items-center justify-center border border-red-100 hover:border-red-200">
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 h-full py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-400">Skill Sequence</p>
                      <p className="text-xs text-gray-300 mt-0.5">Tap a skill from the pool above<br />to add it to the sequence</p>
                    </div>
                  </div>
                )}
          </div>
        </section>

        </div>{/* end panel 2 */}

      </div>


      {/* ── FLOAT SHARE BUTTON (mobile only) ── */}
      <button onClick={captureImages} disabled={capturing}
        className="md:hidden fixed bottom-5 right-5 z-40 h-12 px-4 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60">
        {capturing ? (
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="md:hidden text-sm font-bold">Share</span>
          </>
        )}
      </button>

      {/* ── HERO PICKER MODAL ── */}
      {pickerOpen !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setPickerOpen(null); setSearch(""); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col" style={{ height: "90svh" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาฮีโร่..." autoFocus
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                {filledCount}/5 · Slot {pickerOpen + 1}
              </span>
              <button onClick={() => { setPickerOpen(null); setSearch(""); }}
                className="text-gray-400 hover:text-gray-700 text-xl w-7 h-7 flex items-center justify-center shrink-0">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 sm:grid-cols-7 gap-2 content-start min-h-0">
              {filteredHeroes.map((hero) => {
                const inTeam = usedIds.includes(hero.id);
                return (
                  <button key={hero.id} onClick={() => !inTeam && selectHero(hero)} disabled={inTeam}
                    className={`group flex flex-col items-center gap-1 p-1.5 rounded-xl border transition ${inTeam ? "opacity-30 cursor-not-allowed border-gray-100" : "hover:border-blue-300 hover:bg-blue-50 border-gray-100"}`}>
                    <div className="w-12 aspect-[3/4] rounded-lg overflow-hidden border border-gray-100">
                      <img src={hero.image} alt={hero.name} className="object-cover object-top w-full h-full" />
                    </div>
                    <span className="text-[9px] text-center text-gray-600 group-hover:!text-black leading-tight font-medium group-hover:!font-bold">{hero.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
