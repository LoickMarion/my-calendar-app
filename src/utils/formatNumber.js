// formatNumber.js
// Compact display formatting for large numbers, e.g. for goal-progress labels.

const TIERS = [
  { value: 1e12, symbol: 'T' },
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'k' },
];

function roundToSigFigs(value, sigFigs) {
  if (value === 0) return 0;
  const magnitude = Math.ceil(Math.log10(Math.abs(value)));
  const factor = 10 ** (sigFigs - magnitude);
  return Math.round(value * factor) / factor;
}

/**
 * Numbers under 1000 are shown as-is. 1000 and up are shown with at most
 * 3 significant figures and a k/M/B/T suffix, e.g. 12345 -> "12.3k".
 */
export function formatCompactNumber(n) {
  const sign = n < 0 ? '-' : '';
  const num = Math.abs(n);
  if (num < 1000) return `${sign}${num}`;

  for (let i = 0; i < TIERS.length; i++) {
    const tier = TIERS[i];
    if (num >= tier.value) {
      let scaled = roundToSigFigs(num / tier.value, 3);
      let symbol = tier.symbol;

      // Rounding can push us into the next tier, e.g. 999.5k -> "1000k" -> "1M"
      if (scaled >= 1000 && i > 0) {
        scaled = roundToSigFigs(scaled / 1000, 3);
        symbol = TIERS[i - 1].symbol;
      }

      return `${sign}${scaled}${symbol}`;
    }
  }
  return `${sign}${num}`;
}
