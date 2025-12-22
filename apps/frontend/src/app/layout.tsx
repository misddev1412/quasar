import '../styles.scss';
import { Providers } from './providers';
import LocaleWrapper from '../components/LocaleWrapper';
import { DynamicFavicon } from '../components/common/DynamicFavicon';
import { getPreferredLocale } from '../lib/server-locale';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getPreferredLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <LocaleWrapper initialLocale={locale}>
          <Providers>
            <DynamicFavicon />
            {children}
          </Providers>
        </LocaleWrapper>
      </body>
    </html>
  );
}
