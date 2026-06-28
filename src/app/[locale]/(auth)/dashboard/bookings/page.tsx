import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookingForm } from '@/components/BookingForm';
import { BookingList } from '@/components/BookingList';
import { db } from '@/libs/DB';
import { bookingSchema, serviceSchema } from '@/models/Schema';

type BookingsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: BookingsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'BookingsPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function BookingsPage(props: BookingsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'BookingsPage' });
  const { userId } = await auth();

  const services = await db.select().from(serviceSchema).orderBy(serviceSchema.durationMinutes);

  const bookings = userId
    ? await db
        .select({
          id: bookingSchema.id,
          serviceName: serviceSchema.name,
          customerName: bookingSchema.customerName,
          startTime: bookingSchema.startTime,
          status: bookingSchema.status,
        })
        .from(bookingSchema)
        .innerJoin(serviceSchema, eq(bookingSchema.serviceId, serviceSchema.id))
        .where(eq(bookingSchema.ownerId, userId))
        .orderBy(desc(bookingSchema.startTime))
    : [];

  return (
    <div className="py-5 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold">
      <h1 className="text-2xl font-bold text-gray-900">{t('heading')}</h1>
      <p className="mt-2 text-gray-600">{t('intro')}</p>

      <h2>{t('new_heading')}</h2>
      <BookingForm
        services={services.map((service) => ({
          id: service.id,
          name: service.name,
          durationMinutes: service.durationMinutes,
          priceCents: service.priceCents,
        }))}
        locale={locale}
      />

      <h2>{t('list_heading')}</h2>
      <BookingList bookings={bookings} locale={locale} />
    </div>
  );
}
