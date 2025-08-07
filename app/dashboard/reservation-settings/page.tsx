'use client';
import React, { useEffect, useState } from 'react';
import WidgetContainer from './WidgetContainer';
import { useApi } from '@/hooks/useApi';
import { useSession } from 'next-auth/react';
const ReservationSettings = () => {
  const { getBusinessProfile } = useApi();
  const [businessProfile, setBusinessProfile] = useState<any>([]);
  const { data: session } = useSession();
  const widgetToken = session?.user?.widget_token;
  const asyncFunction = async () => {
    try {
      const businessProfileRes = await getBusinessProfile();
      setBusinessProfile(businessProfileRes.data.business_profile);
    } catch (error) {
      console.error(error, 'error getBusinessProfile');
    }
  };
  useEffect(() => {
    asyncFunction();
  }, []);
  return (
    <WidgetContainer
      businessProfile={businessProfile}
      widgetToken={widgetToken}
    />
  );
};
export default ReservationSettings;
