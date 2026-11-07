export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_CODE = 'BDT';

/**
 * Format any numerical value into Bangladeshi Taka (৳) string
 * Example: formatTaka(4500) -> "৳4,500.00" or formatTaka(4500, 0) -> "৳4,500"
 */
export function formatTaka(amount: number | undefined | null, decimals: number = 2): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return decimals > 0 ? '৳0.00' : '৳0';
  }
  return `৳${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Compact formatting for charts or dense widgets
 * Example: ৳45.2k or ৳1.2L
 */
export function formatTakaCompact(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '৳0';
  if (Math.abs(amount) >= 100000) {
    return `৳${(amount / 1000).toFixed(0)}k`;
  }
  if (Math.abs(amount) >= 1000) {
    return `৳${(amount / 1000).toFixed(1)}k`;
  }
  return `৳${amount.toLocaleString()}`;
}
