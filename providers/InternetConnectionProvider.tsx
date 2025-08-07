'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface InternetConnectionContextType {
  isOnline: boolean;
}

const InternetConnectionContext = createContext<InternetConnectionContextType>({
  isOnline: true
});
interface InternetConnectionContextType {
  isOnline: boolean;
}
export function InternetConnectionProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      toast({
        title: 'Connected',
        description: 'Your internet connection has been restored',
        variant: 'success'
      });
    }

    function handleOffline() {
      setIsOnline(false);
      toast({
        title: 'Disconnected',
        description: 'You are currently offline',
        variant: 'destructive',
        duration: 999999
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <InternetConnectionContext.Provider value={{ isOnline }}>
      {children}
    </InternetConnectionContext.Provider>
  );
}

export function useInternetConnection() {
  return useContext(InternetConnectionContext);
}
