'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq, gt, lt, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { bookingSchema, serviceSchema } from '@/models/Schema';
import { computeEndTime } from '@/utils/Booking';
import type { BookingInput } from '@/validations/BookingValidation';
import { BookingValidation } from '@/validations/BookingValidation';

type ActionResult = { success: true } | { success: false; error: string };

const BOOKINGS_PATH = '/dashboard/bookings';

/**
 * Creates an appointment for the signed-in user after validating the input,
 * resolving the service duration, and rejecting slots that overlap an existing booking.
 * @param input The raw booking details submitted from the form.
 * @returns A success flag or an error key describing why the booking was refused.
 */
export const createBooking = async (input: BookingInput): Promise<ActionResult> => {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'unauthorized' };
  }

  const parsed = BookingValidation.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: 'invalid_input' };
  }

  const [service] = await db
    .select()
    .from(serviceSchema)
    .where(eq(serviceSchema.id, parsed.data.serviceId))
    .limit(1);

  if (!service) {
    return { success: false, error: 'unknown_service' };
  }

  const startTime = new Date(parsed.data.startTime);
  const endTime = computeEndTime(startTime, service.durationMinutes);

  const [conflict] = await db
    .select({ id: bookingSchema.id })
    .from(bookingSchema)
    .where(
      and(
        eq(bookingSchema.ownerId, userId),
        ne(bookingSchema.status, 'cancelled'),
        lt(bookingSchema.startTime, endTime),
        gt(bookingSchema.endTime, startTime),
      ),
    )
    .limit(1);

  if (conflict) {
    return { success: false, error: 'conflict' };
  }

  await db.insert(bookingSchema).values({
    ownerId: userId,
    serviceId: parsed.data.serviceId,
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    startTime,
    endTime,
    notes: parsed.data.notes,
  });

  logger.info('Booking created');
  revalidatePath(BOOKINGS_PATH);

  return { success: true };
};

/**
 * Cancels a booking owned by the signed-in user.
 * @param formData The submitted form data carrying the booking id.
 */
export const cancelBooking = async (formData: FormData) => {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const id = Number(formData.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  await db
    .update(bookingSchema)
    .set({ status: 'cancelled' })
    .where(and(eq(bookingSchema.id, id), eq(bookingSchema.ownerId, userId)));

  logger.info('Booking cancelled');
  revalidatePath(BOOKINGS_PATH);
};
