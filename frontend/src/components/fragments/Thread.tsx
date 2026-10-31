import React from 'react';
import { motion } from 'framer-motion';

interface ThreadProps {
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color?: string;
  dashed?: boolean;
  animate?: boolean;
  className?: string;
}

export const Thread: React.FC<ThreadProps> = ({
  startX = 10,
  startY = 10,
  endX = 190,
  endY = 90,
  color = '#B28A33',
  dashed = false,
  animate = true,
  className = '',
}) => {
  // Quadratic or cubic bezier curve path
  const midX = (startX + endX) / 2;
  const controlY = Math.min(startY, endY) - 30;
  const pathD = `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;

  return (
    <svg
      className={`overflow-visible pointer-events-none ${className}`}
      width={Math.max(startX, endX) + 20}
      height={Math.max(startY, endY) + 40}
      viewBox={`0 0 ${Math.max(startX, endX) + 20} ${Math.max(startY, endY) + 40}`}
      fill="none"
    >
      {/* Animated string / thread */}
      {animate ? (
        <motion.path
          d={pathD}
          stroke={color}
          strokeWidth="1.75"
          strokeDasharray={dashed ? '4 4' : 'none'}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <path
          d={pathD}
          stroke={color}
          strokeWidth="1.75"
          strokeDasharray={dashed ? '4 4' : 'none'}
          opacity={0.85}
        />
      )}

      {/* Brass Pin at Start */}
      <circle cx={startX} cy={startY} r="4" fill="#D08A1E" stroke="#5A3E2B" strokeWidth="1" />
      <circle cx={startX} cy={startY} r="1.5" fill="#FDFBF4" />

      {/* Brass Pin at End */}
      <circle cx={endX} cy={endY} r="4" fill="#D08A1E" stroke="#5A3E2B" strokeWidth="1" />
      <circle cx={endX} cy={endY} r="1.5" fill="#FDFBF4" />
    </svg>
  );
};

