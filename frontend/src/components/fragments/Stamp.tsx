import React from 'react';
import { motion } from 'framer-motion';

export type StampVariant =
  | 'supplied_not_authenticated'
  | 'owner_declared'
  | 'recorded'
  | 'owner_shared'
  | 'resolved'
  | 'unclassified';

interface StampProps {
  variant?: StampVariant;
  text?: string;
  subtext?: string;
  shape?: 'rect' | 'circle';
  rotation?: number;
  className?: string;
  animate?: boolean;
}

const STAMP_CONFIGS: Record<
  StampVariant,
  {
    text: string;
    subtext?: string;
    color: string;
    borderColor: string;
    shape: 'rect' | 'circle';
  }
> = {
  supplied_not_authenticated: {
    text: 'SUPPLIED · NOT AUTHENTICATED',
    subtext: 'ARTHSETU EVIDENCE',
    color: '#7A5A16',
    borderColor: '#B28A33',
    shape: 'rect',
  },
  owner_declared: {
    text: 'OWNER-DECLARED',
    subtext: 'UNVERIFIED CASH / DIARY',
    color: '#5A3E2B',
    borderColor: '#8A6446',
    shape: 'rect',
  },
  recorded: {
    text: 'RECORDED',
    subtext: 'IN KHATA DAYBOOK',
    color: '#2A6347',
    borderColor: '#14402F',
    shape: 'circle',
  },
  owner_shared: {
    text: 'OWNER-SHARED · SUPPLEMENTARY',
    subtext: 'NOT A CREDIT DECISION',
    color: '#14402F',
    borderColor: '#0F2E22',
    shape: 'rect',
  },
  resolved: {
    text: 'RESOLVED & NOTED',
    subtext: 'BY MERCHANT',
    color: '#6B7A3A',
    borderColor: '#6B7A3A',
    shape: 'rect',
  },
  unclassified: {
    text: 'NEEDS REVIEW',
    subtext: 'UNCLASSIFIED ENTRY',
    color: '#B5532F',
    borderColor: '#B5532F',
    shape: 'rect',
  },
};

export const Stamp: React.FC<StampProps> = ({
  variant = 'supplied_not_authenticated',
  text,
  subtext,
  shape,
  rotation = -3,
  className = '',
  animate = true,
}) => {
  const config = STAMP_CONFIGS[variant];
  const activeShape = shape || config.shape;
  const displayText = text || config.text;
  const displaySubtext = subtext !== undefined ? subtext : config.subtext;

  const content = activeShape === 'circle' ? (
    <div
      className={`relative inline-flex flex-col items-center justify-center rounded-full border-2 border-dashed p-3 text-center select-none ${className}`}
      style={{
        borderColor: config.borderColor,
        color: config.color,
        width: '90px',
        height: '90px',
      }}
    >
      <div className="text-[10px] font-bold tracking-widest uppercase font-mono leading-tight">
        {displayText}
      </div>
      {displaySubtext && (
        <div className="text-[7px] tracking-wider uppercase opacity-80 mt-0.5 font-sans">
          {displaySubtext}
        </div>
      )}
    </div>
  ) : (
    <div
      className={`relative inline-flex flex-col items-center justify-center px-3 py-1.5 border-2 border-dashed rounded text-center select-none ${className}`}
      style={{
        borderColor: config.borderColor,
        color: config.color,
      }}
    >
      <div className="text-[11px] font-extrabold tracking-widest uppercase font-mono leading-tight">
        {displayText}
      </div>
      {displaySubtext && (
        <div className="text-[8px] tracking-wider uppercase opacity-85 mt-0.5 font-sans">
          {displaySubtext}
        </div>
      )}
    </div>
  );

  if (!animate) {
    return (
      <div style={{ transform: `rotate(${rotation}deg)` }} className="inline-block pointer-events-none">
        {content}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 1.4, opacity: 0, rotate: rotation - 6 }}
      animate={{ scale: 1, opacity: 1, rotate: rotation }}
      transition={{ duration: 0.24, ease: [0.34, 1.56, 0.64, 1] }}
      className="inline-block pointer-events-none"
    >
      {content}
    </motion.div>
  );
};
