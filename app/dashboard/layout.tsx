import { auth } from '@/auth';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Wabi dashboard',
  description: 'Dashboard Wabi'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect('/');
  }

  return (
    <div className="relative md:pl-16">
      <div className="fixed left-0 top-0 z-40">
        <Sidebar />
      </div>
      <main className="w-full flex-1 overflow-hidden">
        <Header />
        <RouteGuard>{children}</RouteGuard>
      </main>
    </div>
  );
}
