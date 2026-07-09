"use client";

export function Logo({ size = 28, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={spinning ? "animate-spinSlow" : ""}
      aria-hidden
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 360) / 12;
        return (
          <rect
            key={i}
            x="47"
            y="8"
            width="6"
            height="26"
            rx="3"
            fill="#E8672C"
            opacity={0.35 + (i % 3) * 0.22}
            transform={`rotate(${angle} 50 50)`}
          />
        );
      })}
    </svg>
  );
}
