import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/toaster';
import '@uploadthing/react/styles.css';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { Inter } from 'next/font/google';
import './globals.css';
import { auth } from '@/auth';
import { CookieConsent } from '@/components/CookieConsent';
import { TutorialSidebar } from '@/components/ui/tutorial-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wabi dashboard',
  description: 'Wabi dashboard for partners',
  keywords:
    'Wabi, dashboard, partners, business, management, company, wabi dashboard, wabi partners, wabi business, wabi management, wabi company, wabi business management, wabi company management, wabi partners dashboard, wabi business dashboard, wabi management dashboard, wabi company dashboard, wabi business management dashboard, wabi company management dashboard, wabi partners business, wabi partners management, wabi partners company, wabi business partners, wabi management partners, wabi company partners, wabi business management partners, wabi company management partners, wabi business partners dashboard, wabi management partners dashboard, wabi company partners dashboard, wabi business management partners dashboard, wabi company management partners dashboard'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      {/* <script src="https://js.stripe.com/terminal/v1/"></script> */}
      <body
        className={`${inter.className} overflow-hidden`}
        suppressHydrationWarning={true}
      >
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>
          <Toaster />
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
