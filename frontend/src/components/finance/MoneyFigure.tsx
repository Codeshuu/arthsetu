import React, { useEffect, useState } from 'react';
import { formatINR } from '../../lib/formatCurrency';

interface MoneyFigureProps {
  amount: number;
  className?: string;
  showSign?: boolean;
}

export const MoneyFigure: React.FC<MoneyFigureProps> = ({
  amount,
  className = '',
  showSign = false,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (amount - start) * ease);
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [amount]);

  return (
    <span
      className={`font-display font-bold tabular-nums tracking-tight ${className}`}
      aria-live="polite"
    >
      {formatINR(displayValue, showSign)}
    </span>
  );
};

