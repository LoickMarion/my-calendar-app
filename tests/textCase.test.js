import { describe, it, expect } from 'vitest';
import { applyTextCase } from '../src/state/textCase.js';

describe('applyTextCase', () => {
  it('lowercases everything in lower mode', () => {
    expect(applyTextCase('Buy Milk AND Eggs', 'lower')).toBe('buy milk and eggs');
  });

  it('leaves text unchanged for an unknown mode', () => {
    expect(applyTextCase('Buy Milk', 'anything-else')).toBe('Buy Milk');
  });

  it('coerces non-string input to a string', () => {
    expect(applyTextCase(42, 'lower')).toBe('42');
  });

  describe('title mode', () => {
    it('capitalizes major words and lowercases small words in the middle', () => {
      expect(applyTextCase('the lord of the rings', 'title')).toBe('The Lord of the Rings');
    });

    it('always capitalizes the first and last word, even if small', () => {
      expect(applyTextCase('of mice and men', 'title')).toBe('Of Mice and Men');
    });

    it('preserves all-caps acronyms', () => {
      expect(applyTextCase('submit the NASA report', 'title')).toBe('Submit the NASA Report');
    });

    it('title-cases each segment of a hyphenated word', () => {
      expect(applyTextCase('a state-of-the-art design', 'title')).toBe('A State-of-the-Art Design');
    });
  });
});
