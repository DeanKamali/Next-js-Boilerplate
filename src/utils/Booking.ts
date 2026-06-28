/** Possible lifecycle states of a booking. */
const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * Computes the end time of an appointment from its start and duration.
 * @param start The appointment start time.
 * @param durationMinutes The service duration in minutes.
 * @returns The computed end time.
 */
export const computeEndTime = (start: Date, durationMinutes: number) =>
  new Date(start.getTime() + durationMinutes * 60_000);

/**
 * Determines whether two time ranges overlap, treating touching edges as free.
 * @param aStart Start of the first range.
 * @param aEnd End of the first range.
 * @param bStart Start of the second range.
 * @param bEnd End of the second range.
 * @returns True when the ranges intersect.
 */
export const isOverlapping = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart < bEnd && bStart < aEnd;

/**
 * Formats a price in cents as a localized currency string.
 * @param cents The price in cents.
 * @param locale The active locale identifier.
 * @returns A currency string, or a "free" marker when the price is zero.
 */
export const formatPrice = (cents: number, locale: string) => {
  if (cents === 0) {
    return null;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};
