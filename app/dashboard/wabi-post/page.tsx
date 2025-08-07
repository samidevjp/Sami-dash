'use client';
import React, { useEffect, useState } from 'react';
import WabiPostContainer from './WabiPostContainer';
import { useApi } from '@/hooks/useApi';
import { Heading } from '@/components/ui/heading';

interface WabiPostProps {
  businessProfile: any;
  entitySearch: any;
}
const WabiPost = () => {
  const { getEntitySearch } = useApi();
  const [entitySearch, setEntitySearch] = useState<
    WabiPostProps['entitySearch']
  >([]);
  const fetchEntitySearch = async () => {
    try {
      const response = await getEntitySearch();
      setEntitySearch(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchEntitySearch();
  }, []);

  return (
    <>
      <div className="w-full">
        <div className="mb-4 pl-6">
          <Heading
            title={`Wabi Post`}
            description="This is where you can create and edit articles for the Wabi Widget."
            titleClass="text-xl"
            descriptionClass="text-sm"
          />
        </div>
      </div>
      <div>
        <WabiPostContainer
          entitySearch={entitySearch}
          setEntitySearch={setEntitySearch}
          fetchEntitySearch={fetchEntitySearch}
        />
      </div>
    </>
  );
};
export default WabiPost;
