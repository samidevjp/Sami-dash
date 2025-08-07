import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wabi dashboard',
  description: 'Dashboard Wabi'
};

export default function PINLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <main className="w-full flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
