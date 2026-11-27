export default function NotesWallpaper() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-teal-800 opacity-[0.065] dark:text-teal-300 dark:opacity-[0.055]"
    >
      <svg className="h-full w-full" xmlns="http://w3.org">
        <defs>
          <pattern id="mynote-doodle" width="220" height="220" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {/* Надпись MyNotePro под углом */}
              <text
                x="18"
                y="58"
                transform="rotate(-18 55 52)"
                fill="currentColor"
                stroke="none"
                fontSize="16"
                fontWeight="700"
                fontFamily="'Caveat', cursive"
                letterSpacing="0.5"
              >
                MyNotePro
              </text>
              <text
                x="118"
                y="168"
                transform="rotate(14 155 162)"
                fill="currentColor"
                stroke="none"
                fontSize="16"
                fontWeight="700"
                fontFamily="'Caveat', cursive"
                letterSpacing="0.5"
              >
                MyNotePro
              </text>
              {/* Блокнотик */}
              <g transform="translate(132, 22) rotate(12)">
                <rect x="0" y="0" width="20" height="24" rx="3" />
                <line x1="5" y1="7" x2="15" y2="7" />
                <line x1="5" y1="12" x2="15" y2="12" />
                <line x1="5" y1="17" x2="11" y2="17" />
              </g>
              {/* Ручка */}
              <g transform="translate(185, 76) rotate(35)">
                <path d="M0 18 L14 4 L18 8 L4 22 L0 22 Z" />
              </g>
              {/* Календарик */}
              <g transform="translate(24, 102) rotate(-10)">
                <rect x="0" y="3" width="22" height="19" rx="3" />
                <line x1="0" y1="9" x2="22" y2="9" />
                <line x1="6" y1="0" x2="6" y2="5" />
                <line x1="16" y1="0" x2="16" y2="5" />
              </g>
              {/* Часы */}
              <g transform="translate(96, 94)">
                <circle cx="11" cy="11" r="10" />
                <polyline points="11,6 11,11 15,13" />
              </g>
              {/* Микрофон */}
              <g transform="translate(166, 118) rotate(-14)">
                <rect x="6" y="0" width="8" height="13" rx="4" />
                <path d="M2 10 A8 8 0 0 0 18 10" />
                <line x1="10" y1="18" x2="10" y2="22" />
              </g>
              {/* Принтер */}
              <g transform="translate(26, 166) rotate(8)">
                <path d="M5 7 V2 H17 V7" />
                <rect x="2" y="7" width="18" height="10" rx="2" />
                <rect x="6" y="14" width="10" height="6" />
              </g>
              {/* Смартфон */}
              <g transform="translate(82, 168) rotate(-16)">
                <rect x="0" y="0" width="14" height="22" rx="3" />
                <line x1="5" y1="18" x2="9" y2="18" />
              </g>
              {/* Мелкие звёздочки и точки */}
              <circle cx="96" cy="34" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="68" cy="136" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="204" cy="196" r="1.5" fill="currentColor" stroke="none" />
              <path d="M148 76 L150 80 L154 82 L150 84 L148 88 L146 84 L142 82 L146 80 Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mynote-doodle)" />
      </svg>
    </div>
  );
}
