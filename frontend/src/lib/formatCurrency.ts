// Indian currency formatting utilities

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrNumberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

/**
 * Format amount as standard INR string: e.g. ₹1,23,456
 */
export function formatINR(amount: number, showSign = false): string {
  if (isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const formatted = inrFormatter.format(abs);
  if (showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

/**
 * Format amount without ₹ symbol: e.g. 1,23,456
 */
export function formatNumberIN(num: number): string {
  if (isNaN(num)) return '0';
  return inrNumberFormatter.format(num);
}

/**
 * Format compact Indian denomination: e.g. ₹1.2L, ₹4.5Cr, ₹25K
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${sign}₹${abs}`;
}

