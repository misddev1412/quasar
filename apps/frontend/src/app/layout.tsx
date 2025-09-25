import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles.scss';
import { Providers } from './providers';
import LocaleWrapper from '../components/LocaleWrapper';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <LocaleWrapper>
          <Providers>
            {children}
          </Providers>
        </LocaleWrapper>
      </body>
    </html>
  );
}