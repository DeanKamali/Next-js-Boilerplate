import { integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Bookable services that customers can reserve an appointment for.
export const serviceSchema = pgTable('service', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceCents: integer('price_cents').default(0).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Lifecycle of an appointment from creation to completion or cancellation.
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled']);

// Appointments booked by a signed-in user against a service for a time slot.
export const bookingSchema = pgTable('booking', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  serviceId: integer('service_id')
    .notNull()
    .references(() => serviceSchema.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }).notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
