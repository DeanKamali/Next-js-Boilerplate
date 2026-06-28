import * as z from 'zod';

export const BookingValidation = z.object({
  serviceId: z.coerce.number().int().positive(),
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.email().max(254),
  startTime: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), { error: 'invalid_date' })
    .refine((value) => new Date(value).getTime() > Date.now(), { error: 'past_date' }),
  notes: z.string().trim().max(500).optional(),
});

export type BookingInput = z.infer<typeof BookingValidation>;
