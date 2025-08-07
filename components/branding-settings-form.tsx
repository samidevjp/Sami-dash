'use client';

import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface BrandingSettingsProps {
  session: any;
  logo: File | null;
  setLogo: React.Dispatch<React.SetStateAction<File | null>>;
  logoPreviewUrl: string | null;
  setLogoPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  primaryColor: string;
  setPrimaryColor: React.Dispatch<React.SetStateAction<string>>;
  secondaryColor: string;
  setSecondaryColor: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  update: any;
  router: any;
  clearCurrentEmployee: () => void;
  originalBranding: any;
  setOriginalBranding: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: () => void;
}

export default function BrandingSettings({
  session,
  logo,
  setLogo,
  logoPreviewUrl,
  setLogoPreviewUrl,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  setLoading,
  loading,
  update,
  router,
  clearCurrentEmployee,
  originalBranding,
  setOriginalBranding,
  handleSubmit
}: BrandingSettingsProps) {
  const handleReset = () => {
    if (originalBranding) {
      setLogo(null);
      setLogoPreviewUrl(originalBranding.logoPreviewUrl);
      setPrimaryColor(originalBranding.primaryColor);
      setSecondaryColor(originalBranding.secondaryColor);
      toast({
        title: 'Reset',
        description: 'Branding has been reset to original values',
        variant: 'default'
      });
    }
  };
  const hasChanges =
    originalBranding.primaryColor !== primaryColor ||
    originalBranding.secondaryColor !== secondaryColor ||
    logoPreviewUrl !== originalBranding.logoPreviewUrl;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreviewUrl?: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (setPreviewUrl) {
        setPreviewUrl(URL.createObjectURL(selected));
      }
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="items-ce flex items-center gap-8">
          <div>
            <Label className="mb-2 block font-semibold">Logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setLogo, setLogoPreviewUrl)}
              className="max-w-48"
            />
          </div>
          {logoPreviewUrl && (
            <div className="mt-6 h-12 w-12 overflow-hidden rounded border">
              <Image
                src={logoPreviewUrl}
                alt="Logo Preview"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <div>
            <Label className="mb-2 block font-semibold">Primary Color</Label>
            <HexColorPicker
              color={primaryColor}
              onChange={setPrimaryColor}
              style={{ maxWidth: '192px' }}
            />
            <Input
              type="text"
              className="mt-2 w-48"
              value={primaryColor}
              onChange={(e) => {
                let value = e.target.value;
                if (!value.startsWith('#')) {
                  value = '#' + value.replace(/^#+/, '');
                }
                setPrimaryColor(value);
              }}
            />
          </div>
          <div>
            <Label className="mb-2 block font-semibold">Secondary Color</Label>
            <HexColorPicker
              color={secondaryColor}
              onChange={setSecondaryColor}
              style={{ maxWidth: '192px' }}
            />
            <Input
              type="text"
              className="mt-2 w-48"
              value={secondaryColor}
              onChange={(e) => {
                let value = e.target.value;
                if (!value.startsWith('#')) {
                  value = '#' + value.replace(/^#+/, '');
                }
                setSecondaryColor(value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center justify-end gap-4 bg-background sm:flex-row">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={loading || !hasChanges}
          className="w-full  md:w-1/2"
        >
          Reset
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !hasChanges}
          className="w-full  md:w-1/2"
        >
          {loading ? 'Updating...' : 'Update Branding'}
        </Button>
      </div>
    </>
  );
}
