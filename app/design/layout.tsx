import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wabi design template',
  description: 'Dashboard Wabi design template'
};

export default function DesignLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* <main className="w-full flex-1 overflow-auto">{children}</main> */}
      <main className="w-full flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
}
