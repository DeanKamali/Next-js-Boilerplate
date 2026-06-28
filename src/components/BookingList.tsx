import { getTranslations } from 'next-intl/server';
import { cancelBooking } from '@/app/[locale]/(auth)/dashboard/bookings/actions';
import type { BookingStatus } from '@/utils/Booking';

type BookingRow = {
  id: number;
  serviceName: string;
  customerName: string;
  startTime: Date;
  status: BookingStatus;
};

const statusClass: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

export const BookingList = async (props: { bookings: BookingRow[]; locale: string }) => {
  const t = await getTranslations('BookingsPage');

  if (props.bookings.length === 0) {
    return <p className="text-sm text-gray-500">{t('empty')}</p>;
  }

  const dateFormatter = new Intl.DateTimeFormat(props.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-300 text-gray-500">
          <th className="py-2 font-semibold">{t('column_service')}</th>
          <th className="py-2 font-semibold">{t('column_customer')}</th>
          <th className="py-2 font-semibold">{t('column_start')}</th>
          <th className="py-2 font-semibold">{t('column_status')}</th>
          <th className="py-2 font-semibold">{t('column_actions')}</th>
        </tr>
      </thead>
      <tbody>
        {props.bookings.map((booking) => (
          <tr key={booking.id} className="border-b border-gray-100">
            <td className="py-2">{booking.serviceName}</td>
            <td className="py-2">{booking.customerName}</td>
            <td className="py-2">{dateFormatter.format(booking.startTime)}</td>
            <td className="py-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass[booking.status]}`}>
                {t(`status_${booking.status}`)}
              </span>
            </td>
            <td className="py-2">
              {booking.status === 'cancelled' ? (
                <span className="text-xs text-gray-400">—</span>
              ) : (
                <form action={cancelBooking}>
                  <input type="hidden" name="id" value={booking.id} />
                  <button type="submit" className="text-xs text-red-600 hover:text-red-700">
                    {t('cancel_button')}
                  </button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
