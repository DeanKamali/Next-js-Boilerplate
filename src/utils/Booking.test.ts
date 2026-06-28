import { describe, expect, it } from 'vitest';
import { computeEndTime, formatPrice, isOverlapping } from './Booking';

describe('Booking', () => {
  describe('End time computation', () => {
    it('adds the service duration to the start time', () => {
      const start = new Date('2026-07-01T10:00:00.000Z');

      expect(computeEndTime(start, 90)).toStrictEqual(new Date('2026-07-01T11:30:00.000Z'));
    });

    it('leaves the start time unchanged for a zero duration', () => {
      const start = new Date('2026-07-01T10:00:00.000Z');

      expect(computeEndTime(start, 0)).toStrictEqual(start);
    });
  });

  describe('Overlap detection', () => {
    it('reports overlap for ranges that intersect', () => {
      const aStart = new Date('2026-07-01T10:00:00.000Z');
      const aEnd = new Date('2026-07-01T11:00:00.000Z');
      const bStart = new Date('2026-07-01T10:30:00.000Z');
      const bEnd = new Date('2026-07-01T11:30:00.000Z');

      expect(isOverlapping(aStart, aEnd, bStart, bEnd)).toBeTruthy();
    });

    it('treats touching edges as non-overlapping', () => {
      const aStart = new Date('2026-07-01T10:00:00.000Z');
      const aEnd = new Date('2026-07-01T11:00:00.000Z');
      const bStart = new Date('2026-07-01T11:00:00.000Z');
      const bEnd = new Date('2026-07-01T12:00:00.000Z');

      expect(isOverlapping(aStart, aEnd, bStart, bEnd)).toBeFalsy();
    });

    it('reports no overlap for disjoint ranges', () => {
      const aStart = new Date('2026-07-01T10:00:00.000Z');
      const aEnd = new Date('2026-07-01T11:00:00.000Z');
      const bStart = new Date('2026-07-01T12:00:00.000Z');
      const bEnd = new Date('2026-07-01T13:00:00.000Z');

      expect(isOverlapping(aStart, aEnd, bStart, bEnd)).toBeFalsy();
    });
  });

  describe('Price formatting', () => {
    it('formats a non-zero price as currency', () => {
      expect(formatPrice(12_000, 'en')).toBe('$120.00');
    });

    it('returns null for a free service', () => {
      expect(formatPrice(0, 'en')).toBeNull();
    });
  });
});
