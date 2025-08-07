'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import SurchargeSettingsForm from '@/components/forms/surcharge-settings-form';
import { useToast } from '@/components/ui/use-toast';
import { Heading } from '@/components/ui/heading';
import TabMenu from './TabMenu';

export default function SurchargeSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Custom-Surcharge');
  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      // TODO: Implement API call to save surcharge settings
      // We tried to make it more convinient, but since there is no API call (even iOS), so just commented out for now.
      console.log('Surcharge settings:', data);
      toast({
        title: 'Success',
        description: 'Surcharge settings have been updated successfully.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error saving surcharge settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update surcharge settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer scrollable>
      <div className="mb-4 ml-8">
        <Heading
          title={`Surcharge Settings`}
          description="Manage surcharge settings"
          titleClass="text-xl"
          descriptionClass="text-sm"
        />
        <div className="mb-8 mt-4 border-b">
          <TabMenu setSelectedTab={setSelectedTab} />
        </div>
        <SurchargeSettingsForm
          onSubmit={handleSubmit}
          selectedTab={selectedTab}
        />
      </div>
    </PageContainer>
  );
}
