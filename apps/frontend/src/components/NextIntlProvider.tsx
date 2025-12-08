'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface NextIntlProviderProps {
  children: ReactNode;
  locale: string;
  messages?: any;
  timeZone?: string;
}

const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export default function NextIntlProvider({
  children,
  locale,
  messages,
  timeZone = DEFAULT_TIME_ZONE,
}: NextIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  );
}
