"use client";

export function Logo({ size = 28, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={spinning ? "animate-spinSlow" : ""}
      aria-hidden
    >
      <defs>
        <path id="logoTopArc" d="M 30 100 A 70 70 0 0 1 170 100" fill="none" />
        <path id="logoBottomArc" d="M 32 118 A 70 70 0 0 0 168 118" fill="none" />
      </defs>

      <circle cx="100" cy="100" r="94" fill="#F7EEDF" stroke="#8B9B6E" strokeWidth="5" />

      <text fill="#7C8C5E" fontSize="21" fontWeight="800" letterSpacing="2" fontFamily="Georgia, serif">
        <textPath href="#logoTopArc" startOffset="50%" textAnchor="middle">
          COCINA
        </textPath>
      </text>
      <text fill="#7C8C5E" fontSize="16" fontWeight="800" letterSpacing="2" fontFamily="Georgia, serif">
        <textPath href="#logoBottomArc" startOffset="50%" textAnchor="middle">
          SIN ESTRÉS
        </textPath>
      </text>

      {/* fork */}
      <g transform="rotate(-10 68 100)" stroke="#8B9B6E" strokeWidth="5" strokeLinecap="round" fill="none">
        <line x1="56" y1="66" x2="56" y2="92" />
        <line x1="64" y1="66" x2="64" y2="92" />
        <line x1="72" y1="66" x2="72" y2="92" />
        <path d="M 56 92 Q 56 100 64 100 Q 72 100 72 92" />
        <line x1="64" y1="100" x2="64" y2="146" />
      </g>

      {/* spoon */}
      <g transform="rotate(10 132 100)" stroke="#D97A47" strokeWidth="5" strokeLinecap="round" fill="none">
        <ellipse cx="132" cy="78" rx="12" ry="17" />
        <line x1="132" y1="95" x2="132" y2="146" />
      </g>

      {/* plate / clock */}
      <circle cx="100" cy="102" r="38" fill="#FBF5E9" stroke="#8B9B6E" strokeWidth="3.5" />
      <circle cx="100" cy="70" r="2" fill="#8B9B6E" />
      <circle cx="132" cy="102" r="2" fill="#8B9B6E" />
      <circle cx="100" cy="134" r="2" fill="#8B9B6E" />
      <circle cx="68" cy="102" r="2" fill="#8B9B6E" />
      <g stroke="#8B9B6E" strokeWidth="4" strokeLinecap="round">
        <line x1="100" y1="102" x2="85" y2="80" />
        <line x1="100" y1="102" x2="122" y2="86" />
      </g>
      <circle cx="100" cy="102" r="3.5" fill="#8B9B6E" />
    </svg>
  );
}
