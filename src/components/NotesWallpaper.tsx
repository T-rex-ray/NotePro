export default function NotesWallpaper() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-teal-700 opacity-[0.15] dark:text-teal-400 dark:opacity-[0.24] dark:drop-shadow-[0_0_4px_rgba(45,212,191,0.55)]"
    >
      <svg className="h-full w-full" xmlns="http://w3.org">
        <defs>
          <pattern id="mynote-doodle" width="200" height="200" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <text x="10" y="38" transform="rotate(-16 45 34)" fill="currentColor" stroke="none" fontSize="16" fontWeight="700" fontFamily="'Caveat', cursive">
                MyNotePro
              </text>
              <text x="104" y="128" transform="rotate(14 140 124)" fill="currentColor" stroke="none" fontSize="16" fontWeight="700" fontFamily="'Caveat', cursive">
                MyNotePro
              </text>
              <text x="24" y="186" transform="rotate(-12 60 182)" fill="currentColor" stroke="none" fontSize="15" fontWeight="700" fontFamily="'Caveat', cursive">
                MyNotePro
              </text>
              <g transform="translate(96, 10) rotate(10)">
                <rect x="0" y="0" width="18" height="22" rx="3" />
                <line x1="4" y1="6" x2="14" y2="6" />
                <line x1="4" y1="11" x2="14" y2="11" />
                <line x1="4" y1="16" x2="10" y2="16" />
              </g>
              <g transform="translate(142, 12) rotate(-14)">
                <path d="M9 2 A6 6 0 0 1 15 8 V13 L17 15 H1 L3 13 V8 A6 6 0 0 1 9 2 Z" />
                <path d="M7 18 A2 2 0 0 0 11 18" />
              </g>
              <g transform="translate(178, 22) rotate(28)">
                <path d="M6 16 V6 A4 4 0 0 1 14 6 V17 A6 6 0 0 1 2 17 V7" />
              </g>
              <g transform="translate(14, 62) rotate(-8)">
                <rect x="0" y="3" width="20" height="17" rx="3" />
                <line x1="0" y1="8" x2="20" y2="8" />
                <line x1="5" y1="0" x2="5" y2="5" />
                <line x1="15" y1="0" x2="15" y2="5" />
              </g>
              <g transform="translate(56, 56) rotate(12)">
                <path d="M0 4 A2 2 0 0 1 2 2 H8 L10 5 H18 A2 2 0 0 1 20 7 V16 A2 2 0 0 1 18 18 H2 A2 2 0 0 1 0 16 Z" />
              </g>
              <g transform="translate(114, 52) rotate(36)">
                <path d="M0 16 L13 3 L17 7 L4 20 L0 20 Z" />
              </g>
              <g transform="translate(158, 64) rotate(-10)">
                <path d="M2 8 A12 12 0 0 1 18 8" />
                <path d="M5 12 A7 7 0 0 1 15 12" />
                <circle cx="10" cy="16" r="1.4" fill="currentColor" stroke="none" />
              </g>
              <g transform="translate(18, 114)">
                <circle cx="10" cy="10" r="9" />
                <polyline points="10,5 10,10 14,12" />
              </g>
              <g transform="translate(62, 106) rotate(-15)">
                <rect x="5" y="0" width="7" height="12" rx="3.5" />
                <path d="M2 9 A7 7 0 0 0 15 9" />
                <line x1="8.5" y1="16" x2="8.5" y2="20" />
              </g>
              <g transform="translate(174, 112) rotate(10)">
                <rect x="2" y="8" width="14" height="11" rx="2.5" />
                <path d="M5 8 V5 A4 4 0 0 1 13 5 V8" />
              </g>
              <g transform="translate(12, 154) rotate(8)">
                <path d="M4 6 V2 H16 V6" />
                <rect x="1" y="6" width="18" height="9" rx="2" />
                <rect x="5" y="12" width="10" height="5" />
              </g>
              <g transform="translate(96, 152) rotate(-14)">
                <rect x="0" y="0" width="13" height="20" rx="2.5" />
                <line x1="5" y1="17" x2="8" y2="17" />
              </g>
              <g transform="translate(136, 156) rotate(16)">
                <path d="M2 2 H14 V19 L8 14 L2 19 Z" />
              </g>
              <g transform="translate(168, 160) rotate(-6)">
                <path d="M5 15 H16 A4 4 0 0 0 16 7 A5 5 0 0 0 6 6 A4 4 0 0 0 5 15 Z" />
              </g>
              <circle cx="84" cy="36" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="144" cy="46" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="46" cy="92" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="100" cy="96" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="156" cy="144" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="76" cy="144" r="1.4" fill="currentColor" stroke="none" />
              <path d="M188 94 L190 97 L193 99 L190 101 L188 104 L186 101 L183 99 L186 97 Z" />
              <path d="M124 186 L126 189 L129 191 L126 193 L124 196 L122 193 L119 191 L122 189 Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mynote-doodle)" />
      </svg>
    </div>
  );
}
