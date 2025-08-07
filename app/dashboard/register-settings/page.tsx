'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import RegisterSettingsForm from '@/components/forms/register-settings-form';
import { useToast } from '@/components/ui/use-toast';

export default function RegisterSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      // TODO: Implement API call to save register settings
      console.log('Register settings:', data);

      toast({
        title: 'Success',
        variant: 'success',

        description: 'Register settings have been updated successfully.'
      });
    } catch (error) {
      console.error('Error saving register settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update register settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer scrollable>
      <div className="container mx-auto py-6">
        <h1 className="mb-8 text-3xl font-bold">Register settings</h1>
        <RegisterSettingsForm onSubmit={handleSubmit} />
      </div>
    </PageContainer>
  );
}
