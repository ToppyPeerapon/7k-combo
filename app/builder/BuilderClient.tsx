"use client";
import { useState, useId, useRef } from "react";
import { HEROES, Hero } from "@/app/data/heroes";

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
  { id: "crit_rate", label: "Crit Rate 100", on: "bg-red-500 text-white border-red-500",      off: "bg-white text-red-600 border-red-300 hover:bg-red-50" },
  { id: "weakness",  label: "Weakness 100",  on: "bg-orange-500 text-white border-orange-500", off: "bg-white text-orange-600 border-orange-300 hover:bg-orange-50" },
  { id: "crit_dmg",  label: "Crit Dmg ↑",   on: "bg-yellow-500 text-white border-yellow-500", off: "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50" },
  { id: "atk",       label: "Atk (บิสกิต)", on: "bg-green-500 text-white border-green-500",   off: "bg-white text-green-700 border-green-300 hover:bg-green-50" },
  { id: "def",       label: "Def",           on: "bg-blue-500 text-white border-blue-500",     off: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50" },
] as const;

function skillImg(hero: Hero, n: number) {
  return `/skills/${hero.rarity}_${hero.id}_${n}.webp`;
}

export default function BuilderClient() {
  const uid = useId();
  const dragFromRef = useRef<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragInsertPos, setDragInsertPos] = useState<number | null>(null);

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
      <div key={i} className={`relative z-20 w-[110px] flex flex-col items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all shrink-0 ${isActive ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-gray-50"}`}
        onClick={() => { setActiveSlot(i); if (!s.hero) setPickerOpen(i); }}>
        <div className="relative w-full">
          {s.hero ? (
            <>
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-200">
                <img src={s.hero.image} alt={s.hero.name} className="object-cover object-top w-full h-full" />
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeHero(i); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-black/65 rounded-b-xl py-1 px-1"
                onClick={(e) => e.stopPropagation()}>
                <span className="text-yellow-300 text-[11px] shrink-0">⚡</span>
                <input type="number" min={0} max={9999} value={s.speed}
                  onChange={(e) => updateField(i, "speed", e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="SPD"
                  className="w-10 text-center text-[11px] font-bold text-white bg-transparent outline-none placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              </div>
            </>
          ) : (
            <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors text-2xl">+</div>
          )}
        </div>
        <p className="text-[10px] text-center font-medium text-gray-700 leading-tight min-h-[2rem] flex items-center">
          {s.hero ? s.hero.name : <span className="text-gray-400">Empty</span>}
        </p>
      </div>
    );
  }

  const slot = team[activeSlot];
  const heroRow = activeSlot < frontCount ? "Front" : "Back";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Team Builder</h1>
        <p className="text-sm text-gray-500">สร้างทีม · วางแผนสกิล · เลือกไอเทม</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── TOP ROW: Formation + Hero Detail ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── TEAM FORMATION ── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Team Formation</h2>
            {/* Formation picker */}
            <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
              {FORMATIONS.map(f => (
                <button key={f} onClick={() => setFormation(f)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${formation === f ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Formation field — unified view */}
          <div className="space-y-3">
            {/* Front row — F line passes through heroes */}
            <div className="relative flex gap-3 justify-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
                <span className="text-[11px] font-bold text-orange-500 shrink-0 pr-1.5">F</span>
                <div className="flex-1 border-t-2 border-dashed border-orange-300/70" />
              </div>
              {team.slice(0, frontCount).map((s, i) => renderSlot(s, i))}
            </div>
            {/* Back row — B line passes through heroes */}
            <div className="relative flex gap-3 justify-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
                <span className="text-[11px] font-bold text-indigo-400 shrink-0 pr-1.5">B</span>
                <div className="flex-1 border-t-2 border-dashed border-indigo-300/70" />
              </div>
              {team.slice(frontCount).map((s, i) => renderSlot(s, frontCount + i))}
            </div>
          </div>
        </section>

          {/* ── HERO DETAIL PANEL ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              {slot.hero ? (
                <div className="w-12 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <img src={slot.hero.image} alt={slot.hero.name} className="object-cover object-top w-full h-full" />
                </div>
              ) : (
                <div className="w-12 h-16 rounded-xl bg-gray-100 shrink-0" />
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">{slot.hero?.name ?? "ยังไม่ได้เลือก"}</h2>
                <p className="text-xs text-gray-400">{heroRow} row · Slot {activeSlot + 1}</p>
              </div>
              {!slot.hero && (
                <button onClick={() => setPickerOpen(activeSlot)} className="text-sm text-blue-500 hover:underline shrink-0">เลือกฮีโร่</button>
              )}
            </div>

            {/* Speed */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-2xl shrink-0">⚡</span>
              <div className="flex-1">
                <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">Speed</p>
                <input type="number" min={0} max={9999}
                  value={team[activeSlot].speed}
                  onChange={(e) => updateField(activeSlot, "speed", e.target.value)}
                  placeholder="0"
                  className="text-2xl font-bold w-full outline-none bg-transparent text-amber-800 placeholder:text-amber-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              </div>
            </div>

            {/* Weapon badges */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">⚔️ Weapon</p>
              <div className="flex flex-wrap gap-1.5">
                {STAT_BADGES.map((b, idx) => {
                  const active = team[activeSlot].weapon.includes(b.id);
                  return (
                    <button key={b.id} onClick={() => toggleBadge(activeSlot, b.id)}
                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${active ? b.on : b.off}`}>
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes / Stats</p>
              <textarea value={team[activeSlot].notes}
                onChange={(e) => updateField(activeSlot, "notes", e.target.value)}
                placeholder="เช่น อัตราคริติคอล 90%, อัตราจุดอ่อน มากที่สุด..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition resize-none" />
            </div>
          </section>

        </div>{/* end top row grid */}

        {/* ── SKILL SEQUENCE ── full width */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex gap-5">

            {/* LEFT: Skill Pool */}
            <div className="shrink-0 space-y-3">
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Skill Pool</h2>
              {filledCount > 0 ? (() => {
                const filledSlots = team.map((s, i) => ({ slot: s, idx: i })).filter(({ slot }) => slot.hero !== null);
                return (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">คลิกสกิลเพื่อเพิ่ม</p>
                    <div className="grid gap-x-3 gap-y-2" style={{ gridTemplateColumns: `repeat(${filledSlots.length}, minmax(56px, 56px))` }}>
                      {filledSlots.map(({ slot, idx }) => (
                        <div key={`h-${idx}`} className="flex justify-center">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                            <img src={slot.hero!.image} alt={slot.hero!.name} className="object-cover object-top w-full h-full" />
                          </div>
                        </div>
                      ))}
                      {filledSlots.map(({ slot, idx }) => (
                        <button key={`s2-${idx}`} onClick={() => addStep(idx, 2)}
                          className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all bg-gray-100">
                          <img src={skillImg(slot.hero!, 2)} alt="skill 2" className="object-cover w-full h-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = slot.hero!.image; }} />
                        </button>
                      ))}
                      {filledSlots.map(({ slot, idx }) => (
                        <button key={`s3-${idx}`} onClick={() => addStep(idx, 3)}
                          className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all bg-gray-100">
                          <img src={skillImg(slot.hero!, 3)} alt="skill 3" className="object-cover w-full h-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = slot.hero!.image; }} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })() : (
                <p className="text-sm text-gray-400 py-2">เพิ่มฮีโร่ในทีมก่อน</p>
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-100 self-stretch" />

            {/* RIGHT: Sequence */}
            <div className="flex-1 space-y-3 min-w-0">
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Sequence</h2>
              {sequence.length > 0 ? (
                <div className="flex flex-wrap gap-3 items-start">
                  {previewSequence.map((step, idx) => {
                    const heroSlot = team[step.slotIndex];
                    const isBeingDragged = dragFrom !== null && sequence[dragFrom]?.id === step.id && isDragging;
                    const isPreviewTarget = idx === movedToIdx;
                    return (
                      <div
                        key={step.id}
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
                        className={`flex flex-col items-center gap-1.5 rounded-xl p-2 w-[100px] shrink-0 cursor-grab active:cursor-grabbing select-none transition-all border-2
                          ${isPreviewTarget ? "border-blue-400 bg-blue-50 scale-105 shadow-md" : "border-gray-100 bg-gray-50"}
                          ${isBeingDragged ? "opacity-30" : "opacity-100"}`}>
                        <span className="pointer-events-none w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="pointer-events-none w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 shrink-0">
                          {heroSlot.hero && (
                            <img src={skillImg(heroSlot.hero, step.skillNum)} alt=""
                              className="object-cover w-full h-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = heroSlot.hero!.image; }} />
                          )}
                        </div>
                        <span className="pointer-events-none text-[10px] text-gray-500 font-semibold">S{step.skillNum}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                          className="w-full py-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition text-sm font-bold flex items-center justify-center border border-red-100 hover:border-red-200">
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">คลิกสกิลในช่อง Pool เพื่อเพิ่ม</p>
              )}
            </div>

          </div>
        </section>
      </div>

      {/* ── HERO PICKER MODAL ── */}
      {pickerOpen !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setPickerOpen(null); setSearch(""); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col" style={{ height: "80vh" }}
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
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition ${inTeam ? "opacity-30 cursor-not-allowed border-gray-100" : "hover:border-blue-300 hover:bg-blue-50 border-gray-100"}`}>
                    <div className="w-12 aspect-[3/4] rounded-lg overflow-hidden border border-gray-100">
                      <img src={hero.image} alt={hero.name} className="object-cover object-top w-full h-full" />
                    </div>
                    <span className="text-[9px] text-center text-gray-600 leading-tight">{hero.name}</span>
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
