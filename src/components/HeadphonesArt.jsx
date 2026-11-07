// A drawing of the headphones, shown while the 3D model loads.
// color: the chosen color (changes the band and the cups)
export default function HeadphonesArt({ color }) {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]" aria-hidden="true">
      <defs>
        {/* Light from the top-left, shadow at the bottom-right: makes it look round */}
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Headband */}
      <path d="M62 170 V130 a88 88 0 0 1 176 0 V170" fill="none" stroke={color} strokeWidth="22" strokeLinecap="round" />
      <path d="M62 170 V130 a88 88 0 0 1 176 0 V170" fill="none" stroke="url(#shade)" strokeWidth="22" strokeLinecap="round" />
      <path d="M86 140 a64 64 0 0 1 128 0" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="10" strokeLinecap="round" />

      {/* Left and right ear cups */}
      {[62, 238].map((x) => (
        <g key={x}>
          <rect x={x - 34} y="150" width="68" height="100" rx="34" fill={color} />
          <rect x={x - 34} y="150" width="68" height="100" rx="34" fill="url(#shade)" />
          <rect x={x - 22} y="164" width="44" height="72" rx="22" fill="#000" fillOpacity="0.25" />
        </g>
      ))}
    </svg>
  );
}
