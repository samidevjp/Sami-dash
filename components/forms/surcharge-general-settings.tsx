'use client';

import { Label } from '@/components/ui/label';
import { Phone, Package, Utensils } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface SurchargeGeneralSettingsProps {
  phoneOrders: boolean;
  takeawayOrders: boolean;
  dineInOrders: boolean;
  setPhoneOrders: (value: boolean) => void;
  setTakeawayOrders: (value: boolean) => void;
  setDineInOrders: (value: boolean) => void;
}

export default function SurchargeGeneralSettings({
  phoneOrders,
  takeawayOrders,
  dineInOrders,
  setPhoneOrders,
  setTakeawayOrders,
  setDineInOrders
}: SurchargeGeneralSettingsProps) {
  return (
    <div className="">
      <div className="mb-8">
        <h2 className="font-semibold">General Setting</h2>
        {/* <p className="text-sm text-muted-foreground">
          This gives you the ability to customise surcharging for card or even
          specific dates to your customers.
        </p> */}
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[
          {
            id: 'phone-orders',
            label: 'Phone Orders',
            description: 'Apply surcharge for all phone orders',
            icon: <Phone size={12} />,
            checked: phoneOrders,
            onCheckedChange: setPhoneOrders
          },
          {
            id: 'takeaway-orders',
            label: 'Take Away Orders',
            description: 'Apply surcharge for Take away order',
            icon: <Package size={12} />,
            checked: takeawayOrders,
            onCheckedChange: setTakeawayOrders
          },
          {
            id: 'dinein-orders',
            label: 'Dine In Orders',
            description: 'Apply surcharge for Diner in orders',
            icon: <Utensils size={12} />,
            checked: dineInOrders,
            onCheckedChange: setDineInOrders
          }
        ].map((method) => (
          <Label
            key={method.id}
            className="relative cursor-pointer space-y-2 rounded-lg border bg-secondary p-4 transition-colors"
          >
            <div className="flex items-center justify-between gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-background text-secondary-foreground">
                    {method.icon}
                  </div>
                  <p>{method.label}</p>
                </div>
                <p className=" text-xs text-muted-foreground">
                  {method.description}
                </p>
              </div>
              <Checkbox
                checked={method.checked}
                onCheckedChange={() => method.onCheckedChange(!method.checked)}
              />
            </div>
          </Label>
        ))}
      </div>
    </div>
  );
}
