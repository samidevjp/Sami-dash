import { auth } from '@/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wabi Order',
  description: 'Live orders'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="flex h-screen bg-backgroundPos">
      <main className="w-full flex-1">{children}</main>
    </div>
  );
}
