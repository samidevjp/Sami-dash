import React from 'react';
import { Heading } from '@/components/ui/heading';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const BookingSettings = () => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Heading
          title="Booking Settings"
          description="Configure your booking settings"
          titleClass="text-2xl"
          descriptionClass="text-sm"
        />
      </div>

      <div className="px-2 md:grid md:grid-cols-2 ">
        {/* Basic Settings */}

        <div className="md:border-r md:px-4">
          <Label className="text-sm font-medium">Button Text</Label>
          <p className="text-xs text-muted-foreground">
            The text that will be displayed on the button in the widget
          </p>
          <Input type="text" placeholder="Book Now" className="w-[200px]" />
        </div>

        <div className="md:px-4">
          <Label className="text-sm font-medium">Button Text</Label>
          <p className="text-xs text-muted-foreground">
            The text that will be displayed on the button in the widget
          </p>
          <Input type="text" placeholder="Book Now" className="w-[200px]" />
        </div>
      </div>
    </div>
  );
};

export default BookingSettings;
