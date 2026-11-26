export function HeroGrowthIllustration() {
  return (
    <svg
      viewBox="0 0 420 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 420, height: 'auto' }}
      aria-label="Botanical growth and student opportunity illustration"
    >
      {/* Organic Background Blob */}
      <path
        d="M65 215C45 140 95 60 185 45C275 30 365 95 375 180C385 265 315 325 220 325C125 325 85 290 65 215Z"
        fill="var(--bg-badge-green)"
      />
      {/* Warm Sun */}
      <circle cx="315" cy="82" r="28" fill="#F6C827" opacity="0.9" />
      <circle cx="315" cy="82" r="40" stroke="#F6C827" strokeWidth="2" strokeDasharray="5 6" />

      {/* Soil Mound */}
      <path
        d="M95 282C130 258 290 258 325 282C300 296 120 296 95 282Z"
        fill="#493D33"
      />

      {/* Main Stem */}
      <path
        d="M210 272C210 218 208 165 212 108"
        stroke="#84C233"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Left Leaf (Impact) */}
      <path
        d="M210 215C155 215 122 182 122 140C168 140 210 172 210 215Z"
        fill="#84C233"
      />
      <path
        d="M204 210C178 190 154 168 138 152"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Right Leaf (Earn) */}
      <path
        d="M212 178C268 178 304 146 304 104C256 104 212 135 212 178Z"
        fill="#F6C827"
      />
      <path
        d="M218 173C246 154 270 132 288 116"
        stroke="#493D33"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Top Sprout / Bloom (Grow) */}
      <path
        d="M212 112C212 76 242 52 270 52C270 84 244 112 212 112Z"
        fill="#84C233"
      />
      <path
        d="M212 112C212 80 184 58 158 58C158 88 184 112 212 112Z"
        fill="#F7931E"
      />

      {/* Floating Accent Dots */}
      <circle cx="96" cy="112" r="7" fill="#F7931E" opacity="0.75" />
      <circle cx="348" cy="230" r="9" fill="#84C233" opacity="0.55" />
      <circle cx="144" cy="242" r="5" fill="#F6C827" opacity="0.9" />
    </svg>
  )
}

export function VolunteerGlobeIllustration() {
  return (
    <svg viewBox="0 0 140 120" fill="none" style={{ width: 116, height: 'auto' }} aria-hidden="true">
      <circle cx="70" cy="52" r="34" fill="#3B9CE2" />
      <path
        d="M52 36C60 32 68 38 66 46C64 54 54 56 50 48C46 42 48 38 52 36Z"
        fill="#84C233"
      />
      <path
        d="M78 40C86 38 96 46 92 58C88 68 74 70 72 60C70 50 72 42 78 40Z"
        fill="#84C233"
      />
      {/* Leaves around globe */}
      <path d="M36 56C22 48 20 34 26 26C36 32 40 44 36 56Z" fill="#84C233" />
      <path d="M104 56C118 48 120 34 114 26C104 32 100 44 104 56Z" fill="#F6C827" />
      {/* Hands */}
      <path
        d="M42 78C48 92 60 98 70 98C80 98 92 92 98 78"
        stroke="#F5C6A5"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TeamPlantingIllustration() {
  return (
    <svg viewBox="0 0 140 110" fill="none" style={{ width: 112, height: 'auto' }} aria-hidden="true">
      <circle cx="42" cy="24" r="10" fill="#F6C827" />
      <circle cx="78" cy="58" r="32" fill="#3B9CE2" opacity="0.9" />
      <path d="M62 46C70 40 84 44 82 58C80 68 66 72 60 62C56 54 58 48 62 46Z" fill="#84C233" />
      <path d="M90 52C98 50 104 58 100 68C94 74 86 72 86 62C86 56 86 54 90 52Z" fill="#84C233" />
      <path d="M40 94H116" stroke="#84C233" strokeWidth="5" strokeLinecap="round" />
      <circle cx="44" cy="70" r="7" fill="#493D33" />
      <rect x="38" y="78" width="12" height="16" rx="5" fill="#F7931E" />
      <circle cx="110" cy="68" r="7" fill="#493D33" />
      <rect x="104" y="76" width="12" height="18" rx="5" fill="#84C233" />
    </svg>
  )
}
