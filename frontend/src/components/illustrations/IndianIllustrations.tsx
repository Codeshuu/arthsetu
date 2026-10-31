import React from 'react';

/**
 * Illustrated Indian kirana shop scene as an SVG
 * Used in landing page hero and onboarding backgrounds.
 * Entirely self-contained — no external image references.
 */
export const KiranaShopIllustration: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 1 }) => (
  <svg
    viewBox="0 0 480 320"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* Shop exterior wall */}
    <rect x="20" y="60" width="440" height="240" fill="#E8D4A8" rx="2" />
    
    {/* Brick texture rows */}
    {[70, 86, 102, 118, 134, 150, 166, 182, 198, 214, 230, 246, 262, 278].map((y, i) => (
      <g key={y}>
        {[0, 1, 2, 3, 4, 5, 6].map((x) => (
          <rect
            key={x}
            x={20 + x * 63 + (i % 2 === 0 ? 0 : 31.5)}
            y={y}
            width={60}
            height={14}
            fill="none"
            stroke="#C8A87A"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            rx="0.5"
          />
        ))}
      </g>
    ))}

    {/* Shop awning / sunshade */}
    <path d="M10 60 L470 60 L450 80 L30 80 Z" fill="#D08A1E" opacity="0.85" />
    {/* Awning stripe pattern */}
    {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420].map((x) => (
      <line key={x} x1={x} y1="60" x2={x - 20} y2="80" stroke="#B57415" strokeWidth="8" strokeOpacity="0.25" />
    ))}

    {/* Shop sign board */}
    <rect x="100" y="20" width="280" height="45" fill="#14402F" rx="4" />
    <rect x="103" y="23" width="274" height="39" fill="none" stroke="#D08A1E" strokeWidth="1.5" rx="3" />
    {/* Shop name text (stylized) */}
    <text x="240" y="38" textAnchor="middle" fill="#FDFBF4" fontFamily="serif" fontSize="11" fontWeight="bold" letterSpacing="2">
      LAKSHMI KIRANA STORE
    </text>
    <text x="240" y="52" textAnchor="middle" fill="#D08A1E" fontFamily="serif" fontSize="8.5" letterSpacing="1">
      लक्ष्मी किराना स्टोर
    </text>

    {/* Main shop window / opening */}
    <rect x="50" y="100" width="380" height="200" fill="#F5EDDA" rx="1" />
    
    {/* Shop counter */}
    <rect x="50" y="220" width="380" height="80" fill="#C8A060" rx="1" />
    <rect x="50" y="220" width="380" height="8" fill="#A07840" />

    {/* Wooden shelves */}
    {/* Left shelf unit */}
    <rect x="55" y="105" width="130" height="110" fill="#D4A870" rx="1" />
    <rect x="55" y="140" width="130" height="3" fill="#B88040" />
    <rect x="55" y="175" width="130" height="3" fill="#B88040" />
    
    {/* Shelf items — top shelf: jars */}
    {[65, 85, 105, 125, 145, 165].map((x) => (
      <g key={x}>
        <rect x={x} y="110" width="14" height="25" fill="#E8F0D8" rx="7" />
        <rect x={x + 1} y="108" width="12" height="5" fill="#B0C090" rx="2" />
      </g>
    ))}
    
    {/* Shelf items — middle shelf: packets */}
    {[60, 82, 104, 126, 148, 168].map((x) => (
      <g key={x}>
        <rect x={x} y="148" width="16" height="22" fill={['#E4A020', '#C44030', '#4080B0', '#60A040', '#E06820', '#B040A0'][Math.floor((x/20)%6)]} rx="1" opacity="0.7" />
        <line x1={x} y1="154" x2={x + 16} y2="154" stroke="white" strokeWidth="0.5" opacity="0.5" />
      </g>
    ))}

    {/* Right shelf unit */}
    <rect x="295" y="105" width="130" height="110" fill="#D4A870" rx="1" />
    <rect x="295" y="140" width="130" height="3" fill="#B88040" />
    <rect x="295" y="175" width="130" height="3" fill="#B88040" />
    
    {[305, 325, 345, 365, 385, 405].map((x) => (
      <g key={x}>
        <rect x={x} y="110" width="14" height="25" fill="#F0E8D0" rx="2" />
        <rect x={x + 2} y="108" width="10" height="4" fill="#C09060" rx="1" />
      </g>
    ))}
    
    {[300, 322, 344, 366, 388, 408].map((x) => (
      <g key={x}>
        <rect x={x} y="148" width="16" height="22" fill={['#20A040', '#E0A020', '#A02040', '#4060C0', '#C04080', '#60C080'][Math.floor((x/22)%6)]} rx="1" opacity="0.7" />
      </g>
    ))}

    {/* Center: UPI QR stand */}
    <rect x="205" y="195" width="70" height="30" fill="#F0E8D4" rx="2" stroke="#D6CAA8" strokeWidth="1" />
    <rect x="210" y="198" width="60" height="24" fill="#FDFBF4" rx="1" />
    {/* QR code mini representation */}
    <rect x="215" y="201" width="8" height="8" fill="#14402F" rx="0.5" />
    <rect x="225" y="201" width="8" height="8" fill="#14402F" rx="0.5" />
    <rect x="235" y="201" width="8" height="8" fill="#14402F" rx="0.5" />
    <rect x="245" y="201" width="8" height="8" fill="#14402F" rx="0.5" />
    <rect x="255" y="201" width="8" height="8" fill="#14402F" rx="0.5" />
    <rect x="215" y="212" width="8" height="8" fill="#14402F" rx="0.5" />
    <rect x="255" y="212" width="8" height="8" fill="#14402F" rx="0.5" />
    <text x="240" y="228" textAnchor="middle" fill="#D08A1E" fontSize="5" fontFamily="monospace" fontWeight="bold">UPI PAYMENT</text>
    {/* QR stand pole */}
    <rect x="236" y="222" width="8" height="12" fill="#C0A070" />
    <rect x="220" y="232" width="40" height="4" fill="#C0A070" rx="1" />

    {/* Khata book on counter */}
    <rect x="80" y="205" width="60" height="15" fill="#C0241C" rx="1" transform="rotate(-3, 110, 212)" />
    <rect x="82" y="206" width="56" height="13" fill="#D02820" rx="0.5" transform="rotate(-3, 110, 212)" />
    <line x1="110" y1="208" x2="110" y2="218" stroke="#A01810" strokeWidth="0.8" transform="rotate(-3, 110, 212)" />
    <text x="110" y="215" textAnchor="middle" fill="#FFE0DC" fontSize="5" fontFamily="serif" transform="rotate(-3, 110, 212)">KHATA</text>

    {/* Cash / currency notes */}
    <rect x="340" y="208" width="50" height="12" fill="#7CB270" rx="1" transform="rotate(4, 365, 214)" />
    <rect x="342" y="210" width="46" height="8" fill="#8CC280" rx="0.5" transform="rotate(4, 365, 214)" />
    <text x="365" y="216" textAnchor="middle" fill="#2A6020" fontSize="5.5" fontFamily="serif" fontWeight="bold" transform="rotate(4, 365, 214)">₹500</text>

    {/* Person silhouette (shopkeeper) */}
    {/* Head */}
    <circle cx="200" cy="155" r="20" fill="#C4956A" />
    {/* Hair */}
    <ellipse cx="200" cy="140" rx="20" ry="10" fill="#2A1A0A" />
    {/* Body */}
    <rect x="172" y="175" width="56" height="55" fill="#1A5A3A" rx="4" />
    {/* Kurta details */}
    <line x1="200" y1="175" x2="200" y2="230" stroke="#0F3020" strokeWidth="1" />
    {/* Arms */}
    <rect x="148" y="175" width="25" height="38" fill="#1A5A3A" rx="8" transform="rotate(10, 160, 194)" />
    <rect x="227" y="175" width="25" height="38" fill="#1A5A3A" rx="8" transform="rotate(-8, 239, 194)" />
    {/* Face */}
    <circle cx="194" cy="155" r="2" fill="#2A1A0A" />
    <circle cx="206" cy="155" r="2" fill="#2A1A0A" />
    <path d="M196 163 Q200 167 204 163" fill="none" stroke="#2A1A0A" strokeWidth="1.2" strokeLinecap="round" />

    {/* Potted plants flanking */}
    <rect x="25" y="265" width="22" height="28" fill="#8A5A28" rx="2" />
    <ellipse cx="36" cy="265" rx="18" ry="8" fill="#7A5020" />
    <path d="M36 240 Q36 255 36 265" stroke="#2A8020" strokeWidth="2" fill="none" />
    <ellipse cx="28" cy="248" rx="12" ry="8" fill="#38A030" transform="rotate(-20, 28, 248)" />
    <ellipse cx="44" cy="245" rx="12" ry="8" fill="#45B040" transform="rotate(20, 44, 245)" />
    <ellipse cx="36" cy="242" rx="10" ry="7" fill="#55C050" />

    <rect x="433" y="265" width="22" height="28" fill="#8A5A28" rx="2" />
    <ellipse cx="444" cy="265" rx="18" ry="8" fill="#7A5020" />
    <path d="M444 240 Q444 255 444 265" stroke="#2A8020" strokeWidth="2" fill="none" />
    <ellipse cx="436" cy="248" rx="12" ry="8" fill="#38A030" transform="rotate(-20, 436, 248)" />
    <ellipse cx="452" cy="245" rx="12" ry="8" fill="#45B040" transform="rotate(20, 452, 245)" />
    <ellipse cx="444" cy="242" rx="10" ry="7" fill="#55C050" />

    {/* Ground/floor */}
    <rect x="20" y="290" width="440" height="30" fill="#D4C090" rx="1" />
    <line x1="20" y1="295" x2="460" y2="295" stroke="#C0A870" strokeWidth="0.5" />

    {/* Marigold string decoration on awning */}
    <path d="M10 75 Q60 70 120 78 Q180 70 240 75 Q300 70 360 78 Q420 70 470 75"
      fill="none" stroke="#E8A020" strokeWidth="2" />
    {[30, 80, 130, 180, 230, 280, 330, 380, 430].map((x) => (
      <circle key={x} cx={x} cy={73} r={4} fill="#E8A020" opacity="0.7" />
    ))}
  </svg>
);

/**
 * Handwritten khata / ledger page illustration
 */
export const KhataBookIllustration: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 1,
}) => (
  <svg
    viewBox="0 0 320 220"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* Book spine shadow */}
    <rect x="5" y="8" width="310" height="204" rx="3" fill="#C0A070" />
    {/* Book cover */}
    <rect x="2" y="5" width="310" height="204" rx="3" fill="#C0241C" />
    {/* Cover spine line */}
    <rect x="20" y="5" width="4" height="204" fill="#A01810" />
    {/* Cover edge highlight */}
    <rect x="3" y="5" width="1" height="204" fill="#D84030" />
    
    {/* Inner pages — right side */}
    <rect x="24" y="10" width="284" height="194" rx="1" fill="#FDFBF4" />
    
    {/* Ruled lines */}
    {[28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148, 158, 168, 178, 188].map((y) => (
      <line key={y} x1="24" y1={y} x2="308" y2={y} stroke="#D6CAA8" strokeWidth="0.5" />
    ))}
    
    {/* Red margin line */}
    <line x1="60" y1="10" x2="60" y2="204" stroke="#E08080" strokeWidth="0.8" />
    
    {/* Header */}
    <text x="168" y="22" textAnchor="middle" fill="#14402F" fontSize="7" fontFamily="serif" fontWeight="bold">
      ॥ श्री ॥ खाता — DAYBOOK LEDGER
    </text>
    <text x="168" y="32" textAnchor="middle" fill="#8A6446" fontSize="6" fontFamily="monospace">
      Date: 28 October 2026 · Page No. 42
    </text>
    
    {/* Column headers */}
    <text x="30" y="44" fill="#5A3E2B" fontSize="5.5" fontFamily="serif" fontWeight="bold">विवरण (Particulars)</text>
    <text x="220" y="44" fill="#5A3E2B" fontSize="5.5" fontFamily="serif" fontWeight="bold" textAnchor="middle">जमा (Dr.)</text>
    <text x="280" y="44" fill="#5A3E2B" fontSize="5.5" fontFamily="serif" fontWeight="bold" textAnchor="middle">नामे (Cr.)</text>
    
    {/* Vertical column dividers */}
    <line x1="200" y1="48" x2="200" y2="204" stroke="#D6CAA8" strokeWidth="0.5" />
    <line x1="250" y1="48" x2="250" y2="204" stroke="#D6CAA8" strokeWidth="0.5" />
    
    {/* Handwritten entries */}
    {[
      { y: 58, desc: 'Counter naqad (Cash Sale)', dr: '5,200', cr: '' },
      { y: 68, desc: 'UPI — Phonepe settlement', dr: '3,800', cr: '' },
      { y: 78, desc: 'AMUL Dairy supplier paid', dr: '', cr: '1,200' },
      { y: 88, desc: 'Ramesh Udhaar (credit)', dr: '500', cr: '' },
      { y: 98, desc: 'Electricity bill paid', dr: '', cr: '650' },
      { y: 108, desc: 'Wholesale grains & dals', dr: '', cr: '4,200' },
      { y: 118, desc: 'Evening cash (UPI) sales', dr: '2,900', cr: '' },
      { y: 128, desc: 'Packing material bought', dr: '', cr: '320' },
    ].map((row, i) => (
      <g key={i}>
        <text x="64" y={row.y} fill={i % 2 === 0 ? '#2B2620' : '#4A3A2A'} fontSize="5.5" fontFamily="serif">
          {row.desc}
        </text>
        {row.dr && (
          <text x="220" y={row.y} fill="#14402F" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
            ₹{row.dr}
          </text>
        )}
        {row.cr && (
          <text x="280" y={row.y} fill="#B5532F" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
            ₹{row.cr}
          </text>
        )}
      </g>
    ))}
    
    {/* Total line (double underline) */}
    <line x1="200" y1="145" x2="308" y2="145" stroke="#2B2620" strokeWidth="0.7" />
    <line x1="200" y1="148" x2="308" y2="148" stroke="#2B2620" strokeWidth="0.7" />
    <text x="170" y="157" fill="#14402F" fontSize="6" fontFamily="serif" fontWeight="bold">TOTAL (DAILY)</text>
    <text x="220" y="157" fill="#14402F" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">₹12,400</text>
    <text x="280" y="157" fill="#B5532F" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">₹6,370</text>
    
    {/* Shopkeeper signature / initial */}
    <path d="M60 188 Q72 182 80 186 Q88 190 96 184" fill="none" stroke="#2B2620" strokeWidth="1.2" strokeLinecap="round" />
    <text x="64" y="198" fill="#8A6446" fontSize="5" fontFamily="serif">Proprietor Sign</text>

    {/* Stamp impression (owner declared) */}
    <rect x="230" y="172" width="62" height="24" fill="none" stroke="#14402F" strokeWidth="1" rx="2" strokeDasharray="2,1" />
    <text x="261" y="182" textAnchor="middle" fill="#14402F" fontSize="5" fontFamily="monospace" fontWeight="bold">OWNER DECLARED</text>
    <text x="261" y="190" textAnchor="middle" fill="#14402F" fontSize="4.5" fontFamily="monospace">ArthSetu · Verified</text>
  </svg>
);

/**
 * UPI payment flow illustration
 */
export const UpiFlowIllustration: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 1,
}) => (
  <svg
    viewBox="0 0 280 160"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* Phone */}
    <rect x="15" y="20" width="70" height="120" rx="8" fill="#1A1A1A" />
    <rect x="20" y="28" width="60" height="104" rx="4" fill="#F0F0F0" />
    {/* Phone notch */}
    <rect x="38" y="24" width="24" height="5" rx="2.5" fill="#0A0A0A" />
    
    {/* UPI app screen */}
    <rect x="20" y="28" width="60" height="104" rx="4" fill="#E8F4E8" />
    <rect x="20" y="28" width="60" height="22" rx="4" fill="#14402F" />
    <text x="50" y="40" textAnchor="middle" fill="#FDFBF4" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">UPI Pay</text>
    <text x="50" y="49" textAnchor="middle" fill="#B7C4A0" fontSize="4.5" fontFamily="monospace">PhonePe / GPay</text>
    
    {/* QR code on phone */}
    <rect x="28" y="56" width="44" height="44" fill="white" rx="2" />
    {[0,1,2,3].map(r => [0,1,2,3].map(c => (
      <rect key={`${r}-${c}`} x={31+c*10} y={59+r*10} width={8} height={8} fill={Math.random()>0.4?'#14402F':'white'} rx="0.5" />
    )))}
    
    <text x="50" y="110" textAnchor="middle" fill="#14402F" fontSize="7" fontFamily="serif" fontWeight="bold">₹340</text>
    <text x="50" y="120" textAnchor="middle" fill="#6B7A3A" fontSize="4.5" fontFamily="monospace">CONFIRMED ✓</text>
    <rect x="28" y="124" width="44" height="6" rx="3" fill="#14402F" />
    <text x="50" y="128.5" textAnchor="middle" fill="white" fontSize="4" fontFamily="sans-serif">PAY NOW</text>

    {/* Arrow */}
    <path d="M92 80 L136 80" stroke="#D08A1E" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arr)" />
    <defs>
      <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#D08A1E" />
      </marker>
    </defs>
    <text x="114" y="76" textAnchor="middle" fill="#D08A1E" fontSize="5" fontFamily="monospace">INSTANT</text>
    <text x="114" y="90" textAnchor="middle" fill="#8A6446" fontSize="4.5" fontFamily="monospace">SETTLEMENT</text>

    {/* Bank statement */}
    <rect x="140" y="40" width="120" height="100" rx="3" fill="#FDFBF4" stroke="#D6CAA8" strokeWidth="1" />
    <rect x="140" y="40" width="120" height="16" rx="3" fill="#14402F" />
    <text x="200" y="51" textAnchor="middle" fill="#FDFBF4" fontSize="5.5" fontFamily="monospace" fontWeight="bold">BANK STATEMENT</text>
    
    {[
      { y: 68, cr: '+ ₹340', desc: 'UPI-Customer-Scan', col: '#2A6347' },
      { y: 80, cr: '+ ₹1,250', desc: 'UPI-Phonpe-Settle', col: '#2A6347' },
      { y: 92, cr: '- ₹4,200', desc: 'NEFT-Wholesaler', col: '#B5532F' },
      { y: 104, cr: '+ ₹890', desc: 'UPI-GPay-Customer', col: '#2A6347' },
      { y: 116, cr: '+ ₹560', desc: 'Cash-Deposit-ATM', col: '#2A6347' },
    ].map((row, i) => (
      <g key={i}>
        <text x="148" y={row.y} fill="#5A3E2B" fontSize="4.5" fontFamily="monospace">{row.desc}</text>
        <text x="256" y={row.y} textAnchor="end" fill={row.col} fontSize="5" fontFamily="monospace" fontWeight="bold">{row.cr}</text>
        <line x1="143" y1={row.y + 3} x2="257" y2={row.y + 3} stroke="#E6DAB9" strokeWidth="0.4" />
      </g>
    ))}
    
    <text x="200" y="134" textAnchor="middle" fill="#D08A1E" fontSize="5" fontFamily="monospace" fontWeight="bold">ArthSetu imports → classifies</text>
  </svg>
);

/**
 * Scattered-to-organised records visual
 */
export const ScatterToLedgerIllustration: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 1,
}) => (
  <svg
    viewBox="0 0 400 200"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* Scattered records on left */}
    {/* Cash note — tilted */}
    <g transform="rotate(-15, 60, 60)">
      <rect x="25" y="45" width="70" height="38" rx="2" fill="#7CB270" opacity="0.85" />
      <rect x="28" y="48" width="64" height="32" rx="1" fill="none" stroke="#4A8040" strokeWidth="0.7" />
      <text x="60" y="62" textAnchor="middle" fill="#FDFBF4" fontSize="8" fontFamily="serif" fontWeight="bold">₹500</text>
      <text x="60" y="74" textAnchor="middle" fill="#C0F0B8" fontSize="5" fontFamily="monospace">CASH SALE</text>
    </g>
    
    {/* UPI slip — tilted other way */}
    <g transform="rotate(8, 130, 40)">
      <rect x="90" y="15" width="80" height="55" rx="2" fill="#FDFBF4" stroke="#D6CAA8" strokeWidth="1" />
      <rect x="90" y="15" width="80" height="14" fill="#6B7A3A" rx="2" />
      <text x="130" y="25" textAnchor="middle" fill="white" fontSize="5.5" fontFamily="monospace" fontWeight="bold">UPI PAYMENT</text>
      <text x="130" y="40" textAnchor="middle" fill="#14402F" fontSize="9" fontFamily="serif" fontWeight="bold">₹340</text>
      <text x="130" y="52" textAnchor="middle" fill="#5A3E2B" fontSize="4.5" fontFamily="monospace">Mohan Kumar QR Scan</text>
      <text x="130" y="62" textAnchor="middle" fill="#6B7A3A" fontSize="4.5" fontFamily="monospace">✓ SUCCESS · 28/10/2026</text>
    </g>
    
    {/* Handwritten khata — overlapping */}
    <g transform="rotate(-5, 65, 130)">
      <rect x="18" y="105" width="85" height="60" rx="2" fill="#C0241C" />
      <rect x="22" y="109" width="77" height="52" fill="#FDFBF4" />
      <line x1="22" y1="118" x2="99" y2="118" stroke="#D6CAA8" strokeWidth="0.5" />
      <line x1="22" y1="126" x2="99" y2="126" stroke="#D6CAA8" strokeWidth="0.5" />
      <line x1="22" y1="134" x2="99" y2="134" stroke="#D6CAA8" strokeWidth="0.5" />
      <text x="60" y="116" textAnchor="middle" fill="#2B2620" fontSize="4.5" fontFamily="serif">Daily Cash: ₹5,200</text>
      <text x="60" y="124" textAnchor="middle" fill="#2B2620" fontSize="4.5" fontFamily="serif">Supplier paid: ₹1,800</text>
      <text x="60" y="132" textAnchor="middle" fill="#2B2620" fontSize="4.5" fontFamily="serif">Udhaar: ₹450</text>
    </g>

    {/* Arrow (ArthSetu bridge) */}
    <g>
      <rect x="175" y="75" width="50" height="50" rx="25" fill="#14402F" />
      <text x="200" y="96" textAnchor="middle" fill="#D08A1E" fontSize="9" fontFamily="serif" fontWeight="bold">अ</text>
      <text x="200" y="110" textAnchor="middle" fill="#FDFBF4" fontSize="5" fontFamily="monospace">ArthSetu</text>
      <path d="M155 100 L172 100" stroke="#D08A1E" strokeWidth="2" markerEnd="url(#a1)" />
      <path d="M228 100 L245 100" stroke="#D08A1E" strokeWidth="2" markerEnd="url(#a2)" />
      <defs>
        <marker id="a1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#D08A1E" />
        </marker>
        <marker id="a2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#D08A1E" />
        </marker>
      </defs>
    </g>

    {/* Organised ledger on right */}
    <rect x="248" y="25" width="140" height="155" rx="3" fill="#FDFBF4" stroke="#D6CAA8" strokeWidth="1.5" />
    <rect x="248" y="25" width="140" height="20" fill="#14402F" rx="3" />
    <text x="318" y="39" textAnchor="middle" fill="#FDFBF4" fontSize="6" fontFamily="monospace" fontWeight="bold">CONSOLIDATED LEDGER</text>
    
    {/* Ledger rules */}
    {[55, 70, 85, 100, 115, 130, 145, 160].map((y) => (
      <line key={y} x1="248" y1={y} x2="388" y2={y} stroke="#E6DAB9" strokeWidth="0.5" />
    ))}
    <line x1="315" y1="48" x2="315" y2="178" stroke="#E6DAB9" strokeWidth="0.5" />
    <line x1="355" y1="48" x2="355" y2="178" stroke="#E6DAB9" strokeWidth="0.5" />
    
    <text x="278" y="52" fill="#8A6446" fontSize="4.5" fontFamily="serif" fontWeight="bold">Description</text>
    <text x="330" y="52" textAnchor="middle" fill="#8A6446" fontSize="4.5" fontFamily="serif" fontWeight="bold">Credit</text>
    <text x="372" y="52" textAnchor="middle" fill="#8A6446" fontSize="4.5" fontFamily="serif" fontWeight="bold">Debit</text>
    
    {[
      { d: 'Cash Sale (Daybook)', c: '5,200', e: '●' },
      { d: 'UPI Settlement', c: '3,410', e: '◆' },
      { d: 'Wholesale (Bank)', c: '', v: '4,200', e: '◆' },
      { d: 'Counter sales PM', c: '2,900', e: '●' },
      { d: 'Supplier Invoice', c: '', v: '1,800', e: '◆' },
      { d: 'Udhaar collected', c: '450', e: '●' },
    ].map((row, i) => (
      <g key={i}>
        <text x="252" y={63 + i * 15} fill="#2B2620" fontSize="4.5" fontFamily="serif">{row.d}</text>
        {row.c && <text x="330" y={63 + i * 15} textAnchor="middle" fill="#14402F" fontSize="4.5" fontFamily="monospace">₹{row.c}</text>}
        {row.v && <text x="372" y={63 + i * 15} textAnchor="middle" fill="#B5532F" fontSize="4.5" fontFamily="monospace">₹{row.v}</text>}
        <text x="386" y={63 + i * 15} fill="#D08A1E" fontSize="5">
          {row.e}
        </text>
      </g>
    ))}
    
    {/* Total */}
    <line x1="315" y1="162" x2="388" y2="162" stroke="#2B2620" strokeWidth="0.8" />
    <line x1="315" y1="165" x2="388" y2="165" stroke="#2B2620" strokeWidth="0.8" />
    <text x="330" y="174" textAnchor="middle" fill="#14402F" fontSize="5" fontFamily="monospace" fontWeight="bold">₹11,960</text>
    <text x="372" y="174" textAnchor="middle" fill="#B5532F" fontSize="5" fontFamily="monospace" fontWeight="bold">₹6,000</text>
  </svg>
);

/**
 * Financial Visibility Passport document illustration
 */
export const PassportIllustration: React.FC<{ className?: string; opacity?: number }> = ({
  className = '',
  opacity = 1,
}) => (
  <svg
    viewBox="0 0 240 320"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity }}
    aria-hidden="true"
  >
    {/* Document shadow */}
    <rect x="18" y="18" width="208" height="290" rx="5" fill="#C0A070" />
    {/* Document body */}
    <rect x="14" y="14" width="208" height="290" rx="5" fill="#FDFBF4" stroke="#D6CAA8" strokeWidth="1.5" />
    
    {/* Header band */}
    <rect x="14" y="14" width="208" height="70" rx="5" fill="#0F2E22" />
    {/* Gold border line */}
    <rect x="20" y="20" width="196" height="58" rx="3" fill="none" stroke="#D08A1E" strokeWidth="1.5" />
    
    {/* Logo */}
    <circle cx="50" cy="49" r="16" fill="#D08A1E" opacity="0.2" />
    <text x="50" y="54" textAnchor="middle" fill="#D08A1E" fontSize="16" fontFamily="serif" fontWeight="bold">अ</text>
    
    {/* Title text */}
    <text x="130" y="36" textAnchor="middle" fill="#D08A1E" fontSize="6" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
      OFFICIAL DOSSIER
    </text>
    <text x="130" y="49" textAnchor="middle" fill="#FDFBF4" fontSize="9" fontFamily="serif" fontWeight="bold">
      Financial Visibility
    </text>
    <text x="130" y="61" textAnchor="middle" fill="#FDFBF4" fontSize="9" fontFamily="serif" fontWeight="bold">
      Passport
    </text>
    
    {/* Business name section */}
    <rect x="20" y="90" width="196" height="40" fill="#F8F1DE" rx="2" />
    <text x="28" y="103" fill="#8A6446" fontSize="5.5" fontFamily="monospace" fontWeight="bold">BUSINESS NAME</text>
    <text x="28" y="118" fill="#14402F" fontSize="8.5" fontFamily="serif" fontWeight="bold">Lakshmi Kirana Store</text>
    <text x="200" y="103" textAnchor="end" fill="#8A6446" fontSize="5.5" fontFamily="monospace" fontWeight="bold">CATEGORY</text>
    <text x="200" y="118" textAnchor="end" fill="#14402F" fontSize="7" fontFamily="serif">Kirana &amp; Grocery</text>
    
    {/* Period */}
    <text x="28" y="140" fill="#8A6446" fontSize="5" fontFamily="monospace">OBSERVATION PERIOD</text>
    <text x="200" y="140" textAnchor="end" fill="#14402F" fontSize="6" fontFamily="monospace" fontWeight="bold">NOV 2025 – OCT 2026</text>
    
    {/* Divider */}
    <line x1="20" y1="148" x2="216" y2="148" stroke="#D6CAA8" strokeWidth="0.7" />
    <line x1="20" y1="151" x2="216" y2="151" stroke="#D6CAA8" strokeWidth="0.3" />
    
    {/* Financial Summary */}
    <text x="28" y="163" fill="#5A3E2B" fontSize="5.5" fontFamily="monospace" fontWeight="bold">RECORDED STATEMENT</text>
    {[
      { label: 'Recorded Sales (Inflow)', val: '₹8,24,180', col: '#14402F' },
      { label: 'Recorded Spending', val: '₹6,91,440', col: '#B5532F' },
      { label: 'Net Cash Movement', val: '₹1,32,740', col: '#2A6347' },
    ].map((row, i) => (
      <g key={i}>
        <text x="28" y={178 + i * 14} fill="#5A3E2B" fontSize="5.5" fontFamily="serif">{row.label}</text>
        <text x="208" y={178 + i * 14} textAnchor="end" fill={row.col} fontSize="6" fontFamily="monospace" fontWeight="bold">{row.val}</text>
        <line x1="28" y1={181 + i * 14} x2="208" y2={181 + i * 14} stroke="#E6DAB9" strokeWidth="0.4" />
      </g>
    ))}
    
    {/* Four dimensions miniature */}
    <rect x="20" y="228" width="196" height="52" fill="#F8F1DE" rx="2" />
    <text x="28" y="240" fill="#5A3E2B" fontSize="5.5" fontFamily="monospace" fontWeight="bold">FOUR DIMENSIONS</text>
    {[
      { label: 'Business Activity', val: 92, x: 28 },
      { label: 'Record Completeness', val: 86, x: 28 },
      { label: 'Pattern Consistency', val: 78, x: 120 },
      { label: 'Evidence Reliability', val: 68, x: 120 },
    ].map((dim, i) => (
      <g key={i}>
        <text x={dim.x} y={252 + (i % 2) * 16} fill="#5A3E2B" fontSize="4.5" fontFamily="serif">{dim.label}</text>
        <rect x={dim.x} y={255 + (i % 2) * 16} width={80} height={4} rx={2} fill="#D6CAA8" />
        <rect x={dim.x} y={255 + (i % 2) * 16} width={dim.val * 0.8} height={4} rx={2} fill="#14402F" />
        <text x={dim.x + 84} y={259 + (i % 2) * 16} fill="#14402F" fontSize="4.5" fontFamily="monospace" fontWeight="bold">{dim.val}%</text>
      </g>
    ))}
    
    {/* Integrity stamp */}
    <g transform="rotate(-12, 160, 175)">
      <rect x="128" y="160" width="72" height="32" fill="none" stroke="#14402F" strokeWidth="1.5" rx="3" strokeDasharray="3,1.5" />
      <text x="164" y="174" textAnchor="middle" fill="#14402F" fontSize="5.5" fontFamily="monospace" fontWeight="bold">SHA-256</text>
      <text x="164" y="184" textAnchor="middle" fill="#14402F" fontSize="4.5" fontFamily="monospace">INTEGRITY VERIFIED</text>
    </g>
    
    {/* Bottom note */}
    <text x="118" y="294" textAnchor="middle" fill="#8A6446" fontSize="4.5" fontFamily="monospace">
      Voluntary disclosure · Not a credit assessment
    </text>
    <text x="118" y="302" textAnchor="middle" fill="#C0B090" fontSize="4" fontFamily="monospace">
      arthsetu.in · Making Small Businesses Financially Visible
    </text>
  </svg>
);

/**
 * Marigold decorative divider SVG
 */
export const MarigoldDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 400 30" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Line */}
    <line x1="0" y1="15" x2="160" y2="15" stroke="#D6CAA8" strokeWidth="0.8" />
    <line x1="240" y1="15" x2="400" y2="15" stroke="#D6CAA8" strokeWidth="0.8" />
    
    {/* Center motif — stylized marigold / flower */}
    <circle cx="200" cy="15" r="12" fill="none" stroke="#D08A1E" strokeWidth="0.7" />
    <circle cx="200" cy="15" r="6" fill="#D08A1E" opacity="0.15" />
    <circle cx="200" cy="15" r="3" fill="#D08A1E" opacity="0.4" />
    {/* Petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const x = 200 + Math.cos(rad) * 9;
      const y = 15 + Math.sin(rad) * 9;
      return <circle key={angle} cx={x} cy={y} r="2" fill="#D08A1E" opacity="0.5" />;
    })}
    
    {/* Diamond accents */}
    <path d="M172 15 L176 12 L180 15 L176 18 Z" fill="#D08A1E" opacity="0.3" />
    <path d="M220 15 L224 12 L228 15 L224 18 Z" fill="#D08A1E" opacity="0.3" />
  </svg>
);

