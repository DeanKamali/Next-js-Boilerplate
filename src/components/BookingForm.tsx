'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createBooking } from '@/app/[locale]/(auth)/dashboard/bookings/actions';
import { useRouter } from '@/libs/I18nNavigation';
import { formatPrice } from '@/utils/Booking';
import { BookingValidation } from '@/validations/BookingValidation';

type Service = {
  id: number;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

const fieldClass =
  'mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 text-sm/tight text-gray-700 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden';

export const BookingForm = (props: { services: Service[]; locale: string }) => {
  const t = useTranslations('BookingForm');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const form = useForm({
    resolver: zodResolver(BookingValidation),
    defaultValues: {
      serviceId: props.services[0]?.id,
      customerName: '',
      customerEmail: '',
      startTime: '',
      notes: '',
    },
  });

  const serverErrorMessages: Record<string, string> = {
    conflict: t('error_conflict'),
    unauthorized: t('error_unauthorized'),
    invalid_input: t('error_invalid_input'),
    unknown_service: t('error_unknown_service'),
  };

  const handleCreate = form.handleSubmit(async (formData) => {
    setServerError(null);
    setIsDone(false);

    const result = await createBooking(formData);

    if (!result.success) {
      setServerError(serverErrorMessages[result.error] ?? t('error_invalid_input'));
      return;
    }

    form.reset({
      ...form.getValues(),
      customerName: '',
      customerEmail: '',
      startTime: '',
      notes: '',
    });
    setIsDone(true);
    router.refresh();
  });

  return (
    <form onSubmit={handleCreate} className="flex max-w-md flex-col gap-4">
      <div>
        <label className="text-sm font-bold text-gray-700" htmlFor="serviceId">
          {t('label_service')}
          <select id="serviceId" className={fieldClass} {...form.register('serviceId')}>
            {props.services.map((service) => {
              const price = formatPrice(service.priceCents, props.locale);

              return (
                <option key={service.id} value={service.id}>
                  {t('service_option', {
                    name: service.name,
                    duration: service.durationMinutes,
                    price: price ?? t('price_free'),
                  })}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700" htmlFor="customerName">
          {t('label_customer_name')}
          <input
            id="customerName"
            type="text"
            className={fieldClass}
            {...form.register('customerName')}
          />
        </label>
        {form.formState.errors.customerName && (
          <p className="mt-1 text-xs text-red-500 italic">{t('error_customer_name')}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700" htmlFor="customerEmail">
          {t('label_customer_email')}
          <input
            id="customerEmail"
            type="email"
            className={fieldClass}
            {...form.register('customerEmail')}
          />
        </label>
        {form.formState.errors.customerEmail && (
          <p className="mt-1 text-xs text-red-500 italic">{t('error_customer_email')}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700" htmlFor="startTime">
          {t('label_start_time')}
          <input
            id="startTime"
            type="datetime-local"
            className={fieldClass}
            {...form.register('startTime')}
          />
        </label>
        {form.formState.errors.startTime && (
          <p className="mt-1 text-xs text-red-500 italic">{t('error_start_time')}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700" htmlFor="notes">
          {t('label_notes')}
          <textarea id="notes" rows={3} className={fieldClass} {...form.register('notes')} />
        </label>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {isDone && <p className="text-sm text-green-600">{t('success')}</p>}

      <div>
        <button
          type="submit"
          className="rounded-sm bg-blue-500 px-5 py-1 font-bold text-white hover:bg-blue-600 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          disabled={form.formState.isSubmitting || props.services.length === 0}
        >
          {t('button_submit')}
        </button>
      </div>
    </form>
  );
};
