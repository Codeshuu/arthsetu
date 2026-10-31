import React from 'react';

interface KiranaCounterSceneProps {
  className?: string;
  caption?: string;
}

export const KiranaCounterScene: React.FC<KiranaCounterSceneProps> = ({
  className = '',
  caption = 'Illustrative kirana shop scene; authentic Indian trading counter composition',
}) => {
  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-[#D6CAA8] bg-[#F1E8D0] shadow-paper-elevated p-4 sm:p-6 ${className}`}
      role="img"
      aria-label={caption}
    >
      {/* Background Shelves with Grains & Provisions */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#D08A1E_1px,transparent_1px)] [background-size:16px_16px]" />

      <svg
        className="w-full h-auto max-h-[380px] mx-auto select-none overflow-visible"
        viewBox="0 0 600 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rear wooden store shelves */}
        <rect x="20" y="30" width="560" height="18" rx="2" fill="#8A6446" />
        <rect x="20" y="90" width="560" height="18" rx="2" fill="#8A6446" />
        <rect x="20" y="150" width="560" height="18" rx="2" fill="#8A6446" />

        {/* Spice and grain glass jars on top shelf */}
        <g opacity="0.85">
          <rect x="50" y="8" width="30" height="22" rx="4" fill="#E8D6A3" stroke="#B28A33" />
          <rect x="90" y="5" width="28" height="25" rx="4" fill="#B5532F" stroke="#8A6446" />
          <rect x="130" y="8" width="32" height="22" rx="4" fill="#939F5B" stroke="#6B7A3A" />
          <rect x="175" y="6" width="35" height="24" rx="4" fill="#D08A1E" stroke="#7A5A16" />
          <rect x="420" y="8" width="32" height="22" rx="4" fill="#E8D6A3" stroke="#B28A33" />
          <rect x="465" y="5" width="36" height="25" rx="4" fill="#B7C4A0" stroke="#6B7A3A" />
          <rect x="515" y="7" width="30" height="23" rx="4" fill="#E8C3B0" stroke="#B5532F" />
        </g>

        {/* Middle shelf FMCG boxes & Tea packs */}
        <g opacity="0.8">
          <rect x="60" y="60" width="45" height="30" rx="2" fill="#2A6347" />
          <rect x="115" y="55" width="50" height="35" rx="2" fill="#B5532F" />
          <rect x="175" y="62" width="40" height="28" rx="2" fill="#D08A1E" />
          <rect x="400" y="58" width="48" height="32" rx="2" fill="#8A6446" />
          <rect x="460" y="52" width="55" height="38" rx="2" fill="#14402F" />
        </g>

        {/* Counter Top (Solid Teak Wood) */}
        <rect x="10" y="190" width="580" height="36" rx="4" fill="#5A3E2B" />
        <rect x="14" y="192" width="572" height="6" fill="#8A6446" opacity="0.6" />
        <rect x="25" y="226" width="550" height="90" fill="#4B3322" />

        {/* Brass Traditional Weighing Scale */}
        <g transform="translate(70, 115)">
          {/* Base & Column */}
          <rect x="42" y="70" width="16" height="8" rx="2" fill="#B28A33" />
          <line x1="50" y1="20" x2="50" y2="70" stroke="#7A5A16" strokeWidth="4" />
          {/* Balance Beam */}
          <line x1="10" y1="20" x2="90" y2="22" stroke="#B28A33" strokeWidth="3" />
          <circle cx="50" cy="20" r="4" fill="#D08A1E" />
          {/* Left Pan */}
          <line x1="15" y1="20" x2="8" y2="50" stroke="#7A5A16" strokeWidth="1" />
          <line x1="15" y1="20" x2="22" y2="50" stroke="#7A5A16" strokeWidth="1" />
          <path d="M 5 50 Q 15 58 25 50 Z" fill="#D08A1E" />
          {/* Right Pan with weights */}
          <line x1="85" y1="22" x2="78" y2="52" stroke="#7A5A16" strokeWidth="1" />
          <line x1="85" y1="22" x2="92" y2="52" stroke="#7A5A16" strokeWidth="1" />
          <path d="M 75 52 Q 85 60 95 52 Z" fill="#D08A1E" />
          <rect x="82" y="47" width="6" height="5" fill="#5A3E2B" />
        </g>

        {/* Open Bahi-Khata Ledger Book in Center */}
        <g transform="translate(210, 165)">
          {/* Red/Crimson cloth-bound khata cover underneath */}
          <rect x="-8" y="2" width="176" height="52" rx="4" fill="#B5532F" stroke="#8A6446" />
          {/* Left cream page */}
          <rect x="0" y="5" width="78" height="46" rx="2" fill="#FDFBF4" stroke="#D6CAA8" />
          <line x1="14" y1="8" x2="14" y2="48" stroke="#B5532F" strokeWidth="0.8" opacity="0.6" />
          <line x1="20" y1="16" x2="70" y2="16" stroke="#D6CAA8" strokeWidth="0.8" />
          <line x1="20" y1="24" x2="70" y2="24" stroke="#D6CAA8" strokeWidth="0.8" />
          <line x1="20" y1="32" x2="70" y2="32" stroke="#D6CAA8" strokeWidth="0.8" />
          <line x1="20" y1="40" x2="70" y2="40" stroke="#D6CAA8" strokeWidth="0.8" />

          {/* Right cream page */}
          <rect x="80" y="5" width="80" height="46" rx="2" fill="#FDFBF4" stroke="#D6CAA8" />
          <line x1="88" y1="16" x2="152" y2="16" stroke="#D6CAA8" strokeWidth="0.8" />
          <line x1="88" y1="24" x2="152" y2="24" stroke="#D6CAA8" strokeWidth="0.8" />
          <line x1="88" y1="32" x2="152" y2="32" stroke="#D6CAA8" strokeWidth="0.8" />
          <line x1="88" y1="40" x2="152" y2="40" stroke="#D6CAA8" strokeWidth="0.8" />

          {/* Sepia Fountain pen resting across */}
          <line x1="40" y1="50" x2="130" y2="10" stroke="#14402F" strokeWidth="3" strokeLinecap="round" />
          <polygon points="130,10 134,8 132,13" fill="#D08A1E" />
        </g>

        {/* Modern UPI QR Stand on Right */}
        <g transform="translate(425, 145)">
          {/* Triangular stand base */}
          <polygon points="25,55 0,72 50,72" fill="#7C766B" />
          {/* Acrylic QR placard */}
          <rect x="5" y="10" width="40" height="52" rx="3" fill="#FDFBF4" stroke="#D6CAA8" strokeWidth="1.5" />
          {/* UPI header strip */}
          <rect x="5" y="10" width="40" height="12" rx="2" fill="#14402F" />
          <text x="25" y="18" fill="#FDFBF4" fontSize="6" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
            UPI QR
          </text>
          {/* Fictional QR grid */}
          <rect x="13" y="26" width="24" height="24" fill="none" stroke="#2B2620" strokeWidth="1" />
          <rect x="16" y="29" width="6" height="6" fill="#2B2620" />
          <rect x="28" y="29" width="6" height="6" fill="#2B2620" />
          <rect x="16" y="41" width="6" height="6" fill="#2B2620" />
          <rect x="25" y="38" width="4" height="4" fill="#2B2620" />
        </g>

        {/* Warm overhead pendant light cone */}
        <path d="M 300 0 L 150 210 L 450 210 Z" fill="url(#warmGlow)" opacity="0.12" pointerEvents="none" />

        <defs>
          <linearGradient id="warmGlow" x1="300" y1="0" x2="300" y2="210" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D08A1E" stopOpacity="0.8" />
            <stop offset="1" stopColor="#D08A1E" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="text-center mt-2 text-[11px] text-[#7C766B] italic font-sans">
        {caption}
      </div>
    </div>
  );
};

