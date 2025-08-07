'use client';
import React, { useLayoutEffect, useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type SidebarProps = {
  className?: string;
  name?: string;
};

export default function Sidebar({ className, name }: SidebarProps) {
  const router = useRouter();
  const { isMinimized, toggle } = useSidebar();
  const handleToggle = () => {
    toggle();
  };
  const [isDarkMode, setIsDarkMode] = useState(false);

  useLayoutEffect(() => {
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // const handlePinClick = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.preventDefault();
  //     history.replaceState(null, '', '/pin');
  //     router.replace('/pin');
  //   },
  //   [router]
  // );

  return (
    <aside
      key={isDarkMode ? 'dark' : 'light'}
      className={cn(
        `relative hidden h-screen flex-none border-r bg-card transition-[width] duration-200 md:block`,
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      <div className="scroll- flex h-full flex-col">
        <div className="hidden max-w-[120px] p-5 pt-10 md:block">
          <Link href={'/dashboard'}>
            <Image
              width={400}
              height={400}
              className="logo-dark h-full w-32 text-inherit"
              alt="logo"
              onClick={() => router.push('/')}
              src={isDarkMode ? '/WhiteLogo.png' : '/BlackLogo.png'}
            />
          </Link>
        </div>
        <ChevronLeft
          className={cn(
            'absolute -right-3 top-10 z-50 cursor-pointer rounded-full border bg-background text-3xl text-foreground',
            isMinimized && 'rotate-180'
          )}
          onClick={handleToggle}
        />
        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          <div className="overflow-x-hidden px-3 py-2">
            <div className="mt-3 space-y-1">
              <DashboardNav items={navItems} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
