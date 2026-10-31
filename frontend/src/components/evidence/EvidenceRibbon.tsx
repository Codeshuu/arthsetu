import React from 'react';
import { motion } from 'framer-motion';
import { EvidenceClass } from '../../services/types';
import { EvidenceSegment } from '../../selectors/evidenceSelectors';
import { formatCompactINR } from '../../lib/formatCurrency';
import { useI18n } from '../../i18n/i18nContext';

interface EvidenceRibbonProps {
  segments: EvidenceSegment[];
  height?: number;
  showLabels?: boolean;
  onSegmentClick?: (cls: EvidenceClass) => void;
  className?: string;
}

export const EvidenceRibbon: React.FC<EvidenceRibbonProps> = ({
  segments,
  height = 20,
  showLabels = true,
  onSegmentClick,
  className = '',
}) => {
  const { language } = useI18n();

  return (
    <div className={`w-full select-none ${className}`}>
      {/* Segmented Bar */}
      <div
        className="w-full flex rounded overflow-hidden border border-[#D6CAA8] bg-[#E6DAB9]/40 shadow-inner"
        style={{ height: `${height}px` }}
      >
        {segments.map((seg, idx) => {
          if (seg.percentage === 0 && seg.cls !== 'source_authenticated') return null;

          // For locked source_authenticated, give a minimal width or tooltip if 0%
          const widthPercent = seg.cls === 'source_authenticated' ? 0 : seg.percentage;

          return (
            <motion.div
              key={seg.cls}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: `${widthPercent}%`,
                backgroundColor: seg.config.color,
                transformOrigin: 'left',
              }}
              title={`${language === 'hi' ? seg.config.labelHi : seg.config.labelEn}: ${seg.percentage}% (${formatCompactINR(
                seg.amount
              )})`}
              onClick={() => onSegmentClick?.(seg.cls)}
              className={`h-full relative transition-opacity hover:opacity-90 ${
                onSegmentClick ? 'cursor-pointer' : ''
              } ${seg.cls === 'estimated' ? 'bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:12px_12px]' : ''}`}
            />
          );
        })}
      </div>

      {/* Legend / Percentage summary */}
      {showLabels && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] font-mono">
          {segments.map((seg) => {
            const label = language === 'hi' ? seg.config.labelHi : seg.config.labelEn;
            return (
              <div
                key={seg.cls}
                onClick={() => onSegmentClick?.(seg.cls)}
                className={`flex items-center space-x-1.5 ${
                  onSegmentClick ? 'cursor-pointer hover:underline' : ''
                } ${seg.cls === 'source_authenticated' ? 'opacity-65' : ''}`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm border"
                  style={{
                    backgroundColor: seg.config.color,
                    borderColor: seg.config.borderColor,
                  }}
                />
                <span className="font-sans font-medium text-[#2B2620]">{label}:</span>
                <span className="font-bold text-[#14402F]">{seg.percentage}%</span>
                {seg.amount > 0 && (
                  <span className="text-[10px] text-[#7C766B]">({formatCompactINR(seg.amount)})</span>
                )}
                {seg.cls === 'source_authenticated' && (
                  <span className="text-[9px] text-[#8A6446]">(Locked ₹0)</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

