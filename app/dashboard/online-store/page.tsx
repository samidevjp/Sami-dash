'use client';
import React, { useEffect, useState } from 'react';
import OnlineStoreContainer from './components/layout/OnlineStoreContainer';
import { useApi } from '@/hooks/useApi';
import { Heading } from '@/components/ui/heading';
import PageContainer from '@/components/layout/page-container';

const OnlineStoreSettings = () => {
  const { getBusinessProfile, getProducts, getOnlineStoreSettings } = useApi();
  const [businessProfile, setBusinessProfile] = useState<any>([]);
  const [products, setProducts] = useState<any>([]);
  const [onlineStoreSettings, setOnlineStoreSettings] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const asyncFunction = async () => {
    try {
      const businessProfileResponse = await getBusinessProfile();
      setBusinessProfile(businessProfileResponse.data.business_profile);

      const productsResponse = await getProducts();
      setProducts(productsResponse.data.menu);

      const onlineStoreSettingsResponse = await getOnlineStoreSettings();
      setOnlineStoreSettings(onlineStoreSettingsResponse);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    asyncFunction();
  }, []);
  useEffect(() => {
    asyncFunction();
  }, [shouldRefetch]);

  return (
    <>
      <PageContainer scrollable>
        <div className="w-full">
          <div className="w-full border-b">
            <div className="mb-4">
              <Heading
                title={`Online Store`}
                description="Manage your Online Store"
                titleClass="text-xl"
                descriptionClass="text-sm"
              />
            </div>
          </div>
        </div>
        <div className="">
          <OnlineStoreContainer
            businessProfile={businessProfile}
            products={products}
            setProducts={setProducts}
            onlineStoreSettings={onlineStoreSettings}
            setOnlineStoreSettings={setOnlineStoreSettings}
            isLoading={isLoading}
            setShouldRefetch={setShouldRefetch}
          />
        </div>
      </PageContainer>
    </>
  );
};
export default OnlineStoreSettings;
