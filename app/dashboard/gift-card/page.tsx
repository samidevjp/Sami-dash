'use client';
import React, { useEffect, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';
import PageContainer from '@/components/layout/page-container';
import { ClipboardCopy, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import GiftCardPreview from '@/components/gift-card/gift-card-preview';
import { resizeImage, responseOK } from '@/lib/utils';
const GiftCardSetting = () => {
  const { data: session } = useSession();
  const widgetToken = session?.user?.widget_token;
  const businessName: string = session?.user?.name ?? '';
  const { toast } = useToast();
  // const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    primaryColor: '',
    secondaryColor: '',
    logoImage: null as any,
    stripImage: null as any,
    predefinedAmounts: [] as number[],
    allowCustomAmount: false,
    customAmountMin: 0,
    customAmountMax: 500,
    customAmountStep: 50,
    expirationDate: '',
    validityPeriodValue: '',
    validityPeriodUnit: ''
  });

  const {
    getGiftCardSettings,
    saveGiftCardSettings,
    saveGiftCardLogo,
    saveGiftCardStripImage,
    deleteGiftCardLogo,
    deleteGiftCardStripImage
  } = useApi();

  const init = async () => {
    try {
      const data = await getGiftCardSettings();
      setFormData({
        id: data.id || null,
        title: data.title || '',
        description: data.description || '',
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        logoImage: data.logo || null,
        stripImage: data.strip_image || null,
        predefinedAmounts: data.predefined_amounts || [],
        allowCustomAmount: !!data.custom_amount?.min,
        customAmountMin: data.custom_amount?.min ?? 0,
        customAmountMax: data.custom_amount?.max ?? 500,
        customAmountStep: data.custom_amount?.step ?? 50,
        expirationDate: data.expiration_date || '',
        validityPeriodValue: data.validity_period?.value ?? null,
        validityPeriodUnit: data.validity_period?.unit ?? null
      });
    } catch (error) {
      console.error('Error fetching gift card settings:', error);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = async (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked, files } = e.target;

    if (files && files.length > 0 && name === 'stripImage') {
      const file = files[0];

      try {
        const resized = await resizeImage(file, 1000, 1200); // 2MB max, 600px max width
        setFormData((prev) => ({
          ...prev,
          [name]: resized
        }));
      } catch (error) {
        console.error('Image resizing failed:', error);
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Failed to resize image.'
        });
      }
      return;
    }
    if (files && files.length > 0 && name === 'logoImage') {
      const file = files[0];

      try {
        setFormData((prev) => ({
          ...prev,
          [name]: file
        }));
      } catch (error) {
        console.error('Image resizing failed:', error);
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Failed to resize image.'
        });
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmpty = (value: any) => !value || value === '';

    if (isEmpty(formData.title)) {
      toast({
        title: 'Missing Title',
        variant: 'destructive',
        description: 'Title is required.'
      });
      return;
    }

    if (isEmpty(formData.description)) {
      toast({
        title: 'Missing Description',
        variant: 'destructive',
        description: 'Description is required.'
      });
      return;
    }

    if (isEmpty(formData.primaryColor)) {
      toast({
        title: 'Missing Primary Color',
        variant: 'destructive',
        description: 'Primary color is required.'
      });
      return;
    }

    if (isEmpty(formData.secondaryColor)) {
      toast({
        title: 'Missing Secondary Color',
        variant: 'destructive',
        description: 'Secondary color is required.'
      });
      return;
    }

    if (isEmpty(formData.expirationDate)) {
      toast({
        title: 'Missing Expiration Date',
        variant: 'destructive',
        description: 'Expiration date is required.'
      });
      return;
    }

    if (formData.predefinedAmounts.length === 0) {
      toast({
        title: 'Missing Predefined Amounts',
        variant: 'destructive',
        description: 'At least one predefined amount is required.'
      });
      return;
    }
    // Save gift card settings
    try {
      const response = await saveGiftCardSettings({
        title: formData.title,
        description: formData.description,
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor,
        predefined_amounts: formData.predefinedAmounts,
        custom_amount: formData.allowCustomAmount
          ? {
              min: formData.customAmountMin,
              max: formData.customAmountMax,
              step: formData.customAmountStep
            }
          : null,
        expiration_date: formData.expirationDate
          ? formData.expirationDate.slice(0, 10)
          : undefined
        // Note: validity_period is commented out as it was not used in the original code
        // validity_period:
        //   formData.validityPeriodValue && formData.validityPeriodUnit
        //     ? {
        //         value: Number(formData.validityPeriodValue),
        //         unit: formData.validityPeriodUnit
        //       }
        //     : undefined
      });
      if (responseOK(response)) {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Gift card settings saved successfully.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to save gift card settings.'
      });
    }
    try {
      if (formData.logoImage instanceof File && formData.id) {
        const formDataLogo = new FormData();
        formDataLogo.append('logo', formData.logoImage);

        await saveGiftCardLogo({
          id: formData.id,
          logo: formData.logoImage
        });

        toast({
          title: 'Success',
          variant: 'success',
          description: 'Logo uploaded successfully.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to upload logo.'
      });
      console.error('Error uploading logo:', error);
    }

    try {
      if (formData.stripImage instanceof File && formData.id) {
        const formDataStrip = new FormData();
        formDataStrip.append('strip_image', formData.stripImage);

        await saveGiftCardStripImage({
          id: formData.id,
          strip_image: formData.stripImage
        });

        toast({
          title: 'Success',
          variant: 'success',
          description: 'Strip image uploaded successfully.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to upload strip image.'
      });
      console.error('Error uploading strip image:', error);
    }
  };

  const [linkCopied, setLinkCopied] = useState(false);
  const link =
    process.env.NEXT_PUBLIC_WIDGET_LINK + `/gift-card/${widgetToken}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1000);
  };

  const [stepWarning, setStepWarning] = useState('');
  useEffect(() => {
    const min = Math.max(1, formData.customAmountMin);
    const max = Math.max(min + 1, formData.customAmountMax);
    let step = formData.customAmountStep;

    if (step <= 0) step = 1;
    const range = max - min;

    if (step > range) step = range;

    let adjustedStep = step;
    let warning = '';

    if (range % step !== 0) {
      for (let i = step - 1; i >= 1; i--) {
        if (range % i === 0) {
          adjustedStep = i;
          warning = `Step value adjusted to ${i} so that it fits evenly between Min and Max.`;
          break;
        }
      }
    }

    if (
      min !== formData.customAmountMin ||
      max !== formData.customAmountMax ||
      adjustedStep !== formData.customAmountStep
    ) {
      setFormData((prev) => ({
        ...prev,
        customAmountMin: min,
        customAmountMax: max,
        customAmountStep: adjustedStep
      }));
      setStepWarning(warning);
    } else {
      setStepWarning('');
    }
  }, [
    formData.customAmountMin,
    formData.customAmountMax,
    formData.customAmountStep
  ]);

  return (
    <PageContainer scrollable>
      <div className="mb-8 w-full border-b pb-4">
        <Heading
          title="Gift Card Settings"
          description="Manage your Gift Card settings"
          titleClass="text-xl"
          descriptionClass="text-sm"
        />
      </div>
      <div className="gap-6 md:grid md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded border border-input bg-background px-3 py-2"
              placeholder="Describe your gift card"
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <Label>Logo</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="logo-input" className="cursor-pointer">
                  <div className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-400 text-white">
                    {formData.logoImage ? (
                      <div className="h-full">
                        <Image
                          width={60}
                          height={60}
                          src={
                            typeof formData.logoImage === 'string'
                              ? `${process.env.NEXT_PUBLIC_IMG_URL}${formData.logoImage}`
                              : URL.createObjectURL(formData.logoImage)
                          }
                          alt="Logo Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          className="absolute right-1 top-1 z-10 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await deleteGiftCardLogo();
                              setFormData((prev) => ({
                                ...prev,
                                logoImage: null
                              }));
                              toast({
                                title: 'Logo Deleted',
                                description:
                                  'Logo image was removed successfully.',
                                variant: 'success'
                              });
                            } catch (err) {
                              toast({
                                title: 'Error',
                                description: 'Failed to delete logo image.',
                                variant: 'destructive'
                              });
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xl">+</span>
                    )}
                  </div>
                </Label>
                <Input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  name="logoImage"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <Label>Strip Image</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="strip-input" className="cursor-pointer">
                <div className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-400 text-white">
                  {formData.stripImage ? (
                    <div className="h-full">
                      <Image
                        width={60}
                        height={60}
                        src={
                          typeof formData.stripImage === 'string'
                            ? `${process.env.NEXT_PUBLIC_IMG_URL}${formData.stripImage}`
                            : URL.createObjectURL(formData.stripImage)
                        }
                        alt="Strip Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        className="absolute right-1 top-1 z-10 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            await deleteGiftCardStripImage();
                            setFormData((prev) => ({
                              ...prev,
                              stripImage: null
                            }));
                            toast({
                              title: 'Strip Image Deleted',
                              description:
                                'Strip image was removed successfully.',
                              variant: 'success'
                            });
                          } catch (err) {
                            toast({
                              title: 'Error',
                              description: 'Failed to delete strip image.',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xl">+</span>
                  )}
                </div>
              </Label>
              <Input
                id="strip-input"
                type="file"
                accept="image/*"
                name="stripImage"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label>Fixed Amounts</Label>
            <div className="mt-2">
              {formData.predefinedAmounts.map((amount, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const updated = [...formData.predefinedAmounts];
                      updated[index] = Number(e.target.value);
                      setFormData({ ...formData, predefinedAmounts: updated });
                    }}
                    min={1}
                  />
                  <Button
                    variant="danger"
                    onClick={(e) => {
                      e.preventDefault();
                      const updated = formData.predefinedAmounts.filter(
                        (_, i) => i !== index
                      );
                      setFormData({ ...formData, predefinedAmounts: updated });
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  setFormData({
                    ...formData,
                    predefinedAmounts: [...formData.predefinedAmounts, 10]
                  });
                }}
              >
                Add Amount
              </Button>
            </div>
          </div>
          <div className="rounded-md border bg-muted/50 px-4 py-3">
            <div className="flex items-center justify-between ">
              <Label htmlFor="allow-custom" className="text-sm font-medium">
                Allow Custom Amount
              </Label>
              <Switch
                id="allow-custom"
                checked={formData.allowCustomAmount}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    allowCustomAmount: Boolean(checked)
                  })
                }
              />
            </div>
            <div
              className={` transition-all duration-300 ${
                formData.allowCustomAmount
                  ? 'mt-4 max-h-40 opacity-100 '
                  : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
              }`}
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <Label
                    htmlFor="customAmountMin"
                    className="text-sm text-muted-foreground"
                  >
                    Min
                  </Label>
                  <Input
                    id="customAmountMin"
                    type="number"
                    name="customAmountMin"
                    className="bg-background"
                    value={formData.customAmountMin}
                    onChange={handleChange}
                    min={1}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <Label
                    htmlFor="customAmountMax"
                    className="text-sm text-muted-foreground"
                  >
                    Max
                  </Label>
                  <Input
                    id="customAmountMax"
                    type="number"
                    name="customAmountMax"
                    className="bg-background"
                    value={formData.customAmountMax}
                    onChange={handleChange}
                    min={formData.customAmountMin + 1}
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <Label
                    htmlFor="customAmountStep"
                    className="text-sm text-muted-foreground"
                  >
                    Step
                  </Label>
                  <Input
                    id="customAmountStep"
                    type="number"
                    name="customAmountStep"
                    className="bg-background"
                    value={formData.customAmountStep}
                    onChange={handleChange}
                    min={1}
                    max={formData.customAmountMax - formData.customAmountMin}
                  />
                  {stepWarning && (
                    <p className="text-xs text-orange-500">{stepWarning}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="w-1/2">
              <Label>Expiration Date</Label>
            </div>
            <Input
              type="date"
              name="expirationDate"
              className="max-w-36 flex-1"
              value={formData.expirationDate}
              onChange={handleChange}
            />
          </div>

          {/* {!formData.expirationDate && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                name="validityPeriodValue"
                placeholder="e.g. 1"
                value={formData.validityPeriodValue}
                onChange={handleChange}
              />
              <select
                name="validityPeriodUnit"
                value={formData.validityPeriodUnit}
                onChange={handleChange}
                className="rounded border px-3 py-2"
              >
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          )} */}

          <div className="flex items-center gap-4">
            <Label className="w-1/2">Primary Color</Label>
            <Input
              type="color"
              className="flex-1"
              name="primaryColor"
              value={formData.primaryColor}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-1/2">Secondary Color</Label>
            <Input
              type="color"
              className="flex-1"
              name="secondaryColor"
              value={formData.secondaryColor}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" className="rounded border px-4 py-2">
              Cancel
            </button>
            <Button type="submit" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded border p-6 md:mt-0">
          <h3 className="text-md mb-2 font-semibold">PREVIEW</h3>
          <div className="mb-4 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold">Gift Card Link</p>
              <p className="text-xs text-gray-400">{link}</p>
            </div>
            <div className="relative mt-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center rounded bg-gray-500 px-3 py-2 text-xs text-white"
              >
                Copy Link <ClipboardCopy size={16} className="ml-1" />
              </button>
              {linkCopied && (
                <p className="absolute right-0 top-[-25px] rounded bg-gray-500 px-2 py-1 text-xs text-white">
                  Copied!
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {/* Simple Design */}
            <div className="rounded border p-4 shadow">
              <p className="mb-2 text-xs font-semibold text-gray-500">Simple</p>
              <GiftCardPreview
                formData={formData}
                businessName={businessName}
                showStripImage={false}
              />
            </div>

            {/* Visual Design */}
            {formData.stripImage && (
              <div className="rounded border p-4 shadow">
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  Visual
                </p>
                <GiftCardPreview
                  formData={formData}
                  businessName={businessName}
                  showStripImage={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default GiftCardSetting;
