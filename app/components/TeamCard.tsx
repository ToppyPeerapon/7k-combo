interface TeamCardProps {
  label: string;
  count: number;
  mainChars: string[];
  subChars: string[];
  badge: string;
  subBadge: string;
}

function CharSlot({ name, size = "lg" }: { name: string; size?: "lg" | "sm" }) {
  const dim = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const text = size === "lg" ? "text-xs" : "text-[10px]";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${dim} rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 font-bold ${text} text-center leading-tight border border-gray-200 overflow-hidden`}
      >
        <span className="px-1">{name.slice(0, 2)}</span>
      </div>
      {size === "lg" && (
        <span className="text-[10px] text-gray-500 max-w-[64px] text-center leading-tight">
          {name}
        </span>
      )}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${color} shrink-0`}
    >
      {label}
    </div>
  );
}

export default function TeamCard({
  label,
  count,
  mainChars,
  subChars,
  badge,
  subBadge,
}: TeamCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-red-400">{label}</span>
        <span className="text-xs text-gray-400">{count} ทีมแก้</span>
      </div>

      {/* Main team row */}
      <div className="bg-pink-50 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {mainChars.map((name, i) => (
            <CharSlot key={i} name={name} size="lg" />
          ))}
          <Badge label={badge} color="bg-pink-400" />
          <div className="flex gap-1">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-100"
              />
            ))}
          </div>
        </div>

        {/* Sub team row */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {subChars.map((name, i) => (
            <CharSlot key={i} name={name} size="lg" />
          ))}
          <Badge label={subBadge} color="bg-blue-300" />
          <div className="flex gap-1">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-100"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Star rating */}
      <div className="flex gap-0.5 mt-2">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
