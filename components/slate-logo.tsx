export function SlateLogo({ size = 36 }: { size?: number }) {
  const w = Math.round(size * 1.18);
  const h = size;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Clapperboard icon */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 50 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Board body */}
        <rect x="1" y="14" width="48" height="27" rx="4" fill="#1e3652" />
        <rect x="1" y="14" width="48" height="27" rx="4" stroke="rgba(201,150,46,0.55)" strokeWidth="1" />

        {/* Clapper bar */}
        <rect x="1" y="2" width="48" height="13" rx="3" fill="#0d1b29" />
        <rect x="1" y="2" width="48" height="13" rx="3" stroke="rgba(201,150,46,0.3)" strokeWidth="1" />

        {/* Diagonal white stripes */}
        <clipPath id="clapper-mask">
          <rect x="1" y="2" width="48" height="13" rx="3" />
        </clipPath>
        <g clipPath="url(#clapper-mask)">
          <polygon points="-1,2  7,2  5,15  -3,15" fill="#eef2f5" opacity="0.88" />
          <polygon points="13,2 21,2 19,15  11,15" fill="#eef2f5" opacity="0.88" />
          <polygon points="27,2 35,2 33,15  25,15" fill="#eef2f5" opacity="0.88" />
          <polygon points="41,2 49,2 47,15  39,15" fill="#eef2f5" opacity="0.88" />
        </g>

        {/* Hinge line */}
        <line x1="1" y1="15" x2="49" y2="15" stroke="#060e16" strokeWidth="2" />

        {/* Three rule lines on board (like a real film slate) */}
        <line x1="8" y1="24" x2="42" y2="24" stroke="rgba(160,200,230,0.15)" strokeWidth="1" />
        <line x1="8" y1="30" x2="42" y2="30" stroke="rgba(160,200,230,0.15)" strokeWidth="1" />
        <line x1="8" y1="36" x2="42" y2="36" stroke="rgba(160,200,230,0.15)" strokeWidth="1" />
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: size * 0.55,
          letterSpacing: "-0.03em",
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        Slate
      </span>
    </div>
  );
}
