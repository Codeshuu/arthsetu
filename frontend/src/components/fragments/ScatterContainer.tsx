import React from 'react';

interface ScatterItemProps {
  children: React.ReactNode;
  x?: number; // percentage or px
  y?: number;
  rotation?: number; // deg
  zIndex?: number;
  scale?: number;
  className?: string;
}

export const ScatterItem: React.FC<ScatterItemProps> = ({
  children,
  x = 0,
  y = 0,
  rotation = 0,
  zIndex = 1,
  scale = 1,
  className = '',
}) => {
  return (
    <div
      className={`absolute transition-transform duration-300 ${className}`}
      style={{
        left: typeof x === 'number' ? `${x}%` : x,
        top: typeof y === 'number' ? `${y}%` : y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        zIndex,
      }}
    >
      {children}
    </div>
  );
};

export const ScatterContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  height?: string;
}> = ({ children, className = '', height = '500px' }) => {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ minHeight: height }}
    >
      {children}
    </div>
  );
};

