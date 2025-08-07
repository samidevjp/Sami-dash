import { auth } from '@/auth';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { useEmployee } from '@/hooks/useEmployee';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';

export const metadata: Metadata = {
  title: 'Wabi POS',
  description: 'POS Wabi'
};

export default async function POSLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/');
  }

  return (
    <div className="flex h-screen flex-col bg-backgroundPos md:flex-row">
      {/* Mobile Navigation */}
      <div className="sticky top-0 z-50 flex h-12 items-center border-b bg-background px-4 md:hidden">
        <MobileSidebar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar name="POS" />
      </div>

      {/* Main Content */}
      <main className="w-full flex-1">{children}</main>
    </div>
  );
}
