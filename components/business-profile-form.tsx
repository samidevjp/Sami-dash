'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'next-auth/react';

type BusinessProfile = {
  extension: string;
  phone_no: string;
  business_type: string;
  address: string;
  business_name: string;
};

interface BusinessProfileFormProps {
  businessName: string | null;
  setBusinessName: (name: string | null) => void;
}
export default function BusinessProfileForm({
  businessName,
  setBusinessName
}: BusinessProfileFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] =
    useState<BusinessProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    extension: '',
    phone_no: '',
    business_type: '',
    address: '',
    business_name: ''
  });
  const [saveMessage, setSaveMessage] = useState(false);
  const { getBusinessProfile, createBusinessProfile } = useApi();

  // Fetch current business profile on component mount
  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    setLoading(true);
    try {
      const response = await getBusinessProfile();
      if (response && response.data) {
        setBusinessProfile(response.data.business_profile);
        setOriginalProfile(response.data.business_profile);
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessProfile((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'business_name') {
      setBusinessName(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createBusinessProfile(businessProfile);
      setOriginalProfile(businessProfile);

      toast({
        title: 'Logging out soon',
        description:
          'Business profile updated successfully. Logging out in 3 seconds.',
        variant: 'default'
      });

      setTimeout(() => {
        signOut();
      }, 3000);
      setSaveMessage(true);
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business profile',
        variant: 'destructive'
      });
    } finally {
      // setSaveMessage(false);
    }
  };

  const handleReset = () => {
    if (originalProfile) {
      setBusinessProfile(originalProfile);
      toast({
        title: 'Reset',
        description: 'Form has been reset to original values',
        variant: 'default'
      });
    }
  };

  // Check if form values have been changed
  const hasChanges =
    originalProfile &&
    (originalProfile.business_name !== businessProfile.business_name ||
      originalProfile.phone_no !== businessProfile.phone_no ||
      originalProfile.address !== businessProfile.address);

  return (
    <>
      <div>
        {loading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={businessName || businessProfile.business_name}
                  onChange={handleInputChange}
                  placeholder="Enter business name"
                  required
                />
                {originalProfile &&
                  originalProfile.business_name !==
                    businessProfile.business_name && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Original: {businessName}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input
                  id="phone_no"
                  name="phone_no"
                  value={businessProfile.phone_no}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                />
                {originalProfile &&
                  originalProfile.phone_no !== businessProfile.phone_no && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Original: {originalProfile.phone_no}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={businessProfile.address}
                  onChange={handleInputChange}
                  placeholder="Enter business address"
                  required
                />
                {originalProfile &&
                  originalProfile.address !== businessProfile.address && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Original: {originalProfile.address}
                    </p>
                  )}
              </div>
            </div>
            <div className=" gap-4 bg-background pt-4 md:flex">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={saving || !hasChanges}
                className="md:max-w-1/2 mb-4 w-full md:mb-0"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={saving || !hasChanges}
                className="md:max-w-1/2 w-full"
              >
                {saving ? 'Updating...' : 'Update Business Profile'}
              </Button>
            </div>
            {saveMessage && (
              <p className="mt-2 text-sm text-muted-foreground">
                Profile updated. Signing you out in 3 seconds...
              </p>
            )}
          </form>
        )}
      </div>
    </>
  );
}
