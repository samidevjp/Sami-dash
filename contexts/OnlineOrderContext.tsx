import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';

const OnlineOrderContext = createContext<any>(null);

export function OnlineOrderProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { getOnlineOrders, updateOnlineOrder, getOnlineStoreSettings } =
    useApi();
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState<any>({});

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);
  };

  const fetchOrders = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];

      const settings = await getOnlineStoreSettings();
      setSettings(settings);
      const response = await getOnlineOrders(settings.widget_token, {
        date
      });
      const formattedOrders = response.data.orders;

      // Check for new orders
      setOrders((prevOrders) => {
        const newOrders = formattedOrders.filter(
          (newOrder: any) =>
            !prevOrders.some((oldOrder: any) => oldOrder.id === newOrder.id)
        );

        if (newOrders.length > 0) {
          if (settings.auto_accept_orders === 1) {
            newOrders.forEach(async (order: any) => {
              if (order.status === 'new') {
                try {
                  await updateOnlineOrder(settings.widget_token, order.id, 1);
                  playNotificationSound();
                } catch (error) {
                  console.error('Error auto-accepting order:', error);
                }
              }
            });
          }

          playNotificationSound();
          toast({
            title: 'New Order(s)',
            description: `${newOrders.length} new order${
              newOrders.length > 1 ? 's' : ''
            } received${
              settings.auto_accept_orders === 1 ? ' and auto-accepted' : ''
            }`,
            variant: 'success'
          });
        }
        return formattedOrders;
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 7000);
    return () => clearInterval(interval);
  }, [settings]);

  return (
    <OnlineOrderContext.Provider value={{ orders, settings, setSettings }}>
      {children}
    </OnlineOrderContext.Provider>
  );
}

export const useOnlineOrders = () => {
  const context = useContext(OnlineOrderContext);
  if (!context) {
    throw new Error(
      'useOnlineOrders must be used within an OnlineOrderProvider'
    );
  }
  return context;
};
