// textCase.js

const SMALL_WORDS = new Set([
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'at', 'by', 'in', 'into', 'of', 'off', 'on', 'out', 'over', 'to', 'up', 'with', 'from'
]);

function applyTrueTitleCase(str) {
  if (typeof str !== 'string') return str;

  const words = str.split(/\s+/);

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();

      // Always capitalize first and last word
      const isFirst = index === 0;
      const isLast = index === words.length - 1;

      // Preserve acronyms (ALL CAPS)
      if (/^[A-Z0-9]+$/.test(word)) return word;

      // Handle hyphenated words (e.g., "state-of-the-art")
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part, i) => {
            const partLower = part.toLowerCase();
            const shouldCap =
              i === 0 || !SMALL_WORDS.has(partLower);
            return shouldCap
              ? partLower.charAt(0).toUpperCase() + partLower.slice(1)
              : partLower;
          })
          .join('-');
      }

      // Small words stay lowercase unless first/last
      if (!isFirst && !isLast && SMALL_WORDS.has(lower)) {
        return lower;
      }

      // Default: capitalize
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export function applyTextCase(str, mode) {
  if (typeof str !== 'string') str = String(str);

  if (mode === 'title') {
    return applyTrueTitleCase(str);
  }

  if (mode === 'lower') {
    return str.toLowerCase();
  }

  return str;
}
