import '../styles.scss';
import { Providers } from './providers';
// import LocaleWrapper from '../components/LocaleWrapper'; // Removed
import { DynamicFavicon } from '../components/common/DynamicFavicon';
import { getPreferredLocale } from '../lib/server-locale';
import { getMergedMessages } from '../i18n/server-messages';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getPreferredLocale();
  const messages = await getMergedMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Providers locale={locale} messages={messages}>
          <DynamicFavicon />
          {children}
        </Providers>
      </body>
    </html>
  );
}
