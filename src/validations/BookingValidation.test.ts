import { describe, expect, it } from 'vitest';
import { BookingValidation } from './BookingValidation';

const futureIso = () => new Date(Date.now() + 60 * 60_000).toISOString();
const pastIso = () => new Date(Date.now() - 60 * 60_000).toISOString();

const validInput = () => ({
  serviceId: 1,
  customerName: 'Ada Lovelace',
  customerEmail: 'ada@example.com',
  startTime: futureIso(),
});

describe('Booking validation', () => {
  it('accepts a well-formed future booking', () => {
    expect(BookingValidation.safeParse(validInput()).success).toBeTruthy();
  });

  it('coerces a numeric string service id', () => {
    const result = BookingValidation.safeParse({ ...validInput(), serviceId: '2' });

    expect(result.success).toBeTruthy();
    expect(result.data?.serviceId).toBe(2);
  });

  it('rejects a malformed email', () => {
    const result = BookingValidation.safeParse({ ...validInput(), customerEmail: 'not-an-email' });

    expect(result.success).toBeFalsy();
  });

  it('rejects an empty customer name', () => {
    const result = BookingValidation.safeParse({ ...validInput(), customerName: '   ' });

    expect(result.success).toBeFalsy();
  });

  it('rejects a start time in the past', () => {
    const result = BookingValidation.safeParse({ ...validInput(), startTime: pastIso() });

    expect(result.success).toBeFalsy();
  });

  it('rejects an unparseable start time', () => {
    const result = BookingValidation.safeParse({ ...validInput(), startTime: 'tomorrow' });

    expect(result.success).toBeFalsy();
  });
});
