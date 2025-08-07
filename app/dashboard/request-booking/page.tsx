'use client';

import React, { useState } from 'react';
import RequestedBookings from './requested-bookings';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import TabMenu from './components/TabMenu';
import BookingSettings from './components/booking-settings';

export default function RequestBookingPage() {
  const [selectedTab, setSelectedTab] = useState<string>('Bookings');

  return (
    <PageContainer scrollable>
      <div className="relative z-10">
        <div className="sticky top-0 z-30 bg-background pr-6 pt-2">
          <div className="mb-6">
            <Heading
              title="Request Booking"
              description="Request Booking from Widget"
              titleClass="text-2xl"
              descriptionClass="text-sm"
            />
          </div>
          <div className="border-b">
            <TabMenu
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          </div>
        </div>
        <div className="z-20 pt-6">
          {selectedTab === 'Bookings' && (
            <>
              <RequestedBookings />
            </>
          )}
          {/* {selectedTab === 'Settings' && <BookingSettings />} */}
        </div>
      </div>
    </PageContainer>
  );
}
