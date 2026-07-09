"use client";

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-orange" : i < current ? "w-1.5 bg-orange/50" : "w-1.5 bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}
