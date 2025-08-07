'use client';
import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { TableProvider } from '@/hooks/useBookings';
import { InternetConnectionProvider } from '@/providers/InternetConnectionProvider';
// import { OnlineOrderProvider } from '@/contexts/OnlineOrderContext';
import { TutorialSidebar } from '../ui/tutorial-sidebar';

export default function Providers({
  session,
  children
}: {
  session: SessionProviderProps['session'];
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <InternetConnectionProvider>
          {/* <OnlineOrderProvider> */}
          {session ? (
            <>
              <TableProvider>{children}</TableProvider>
              <TutorialSidebar />
            </>
          ) : (
            children
          )}
        </InternetConnectionProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
