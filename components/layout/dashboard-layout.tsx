'use client';

import Header from '@/components/layout/header';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full flex-1 overflow-y-scroll">
      {pathname !== '/pos/payment' && <Header />}
      {children}
    </div>
  );
}
