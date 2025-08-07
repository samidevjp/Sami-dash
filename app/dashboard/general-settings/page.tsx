'use client';
import { useEffect, useState, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/page-container';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEmployee } from '@/hooks/useEmployee';
import { Heading } from '@/components/ui/heading';
import { Tabs } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
// import ShiftsForm from '@/components/signup/ShiftsForm';
import { useShiftsStore } from '@/hooks/useShiftsStore';
import ShiftsTable from '@/components/shifts-table';
import SpecialDaysForm from '@/components/forms/special-days-form';
import { useApi } from '@/hooks/useApi';
import TableLayoutEditor from '@/components/table-layout-editor';
import BusinessProfileForm from '@/components/business-profile-form';
import BrandingSettings from '@/components/branding-settings-form';
import { Loader2 } from 'lucide-react';
import { resizeImageTo512KB } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import Link from 'next/link';
import { isEqual } from 'lodash';
type Subscription = {
  id: number;
  amount: number;
  surcharge: number;
  total_amount: number;
  payment_intent_id: string;
  started_at: string;
  ends_at: string;
  terminated_at: string;
  unsubscribed_at: string;
  duration: number;
  admin_subscription_ids: number[];
  main_nav: number;
  team: number;
  pos: number;
  receipt_url: string;
  refunded_at: string;
};

export default function BrandingPage() {
  const { data: session, update } = useSession();
  const {
    setShifts,
    getShifts,
    removeSubscription,
    refundSubscription,
    getUserSubscription,
    getStripeAccount
  } = useApi();

  // @ts-ignore
  const [logo, setLogo] = useState<File | null>(session?.user.logo);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    session?.user.logo ?? null
  );
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { clearCurrentEmployee } = useEmployee();
  const [selectedTab, setSelectedTab] = useState<any>('Table Layout');
  const [businessName, setBusinessName] = useState<string | null>(
    session?.user.name ?? null
  );
  const tabs = [
    'Table Layout',
    'Shift Setting',
    'Business Setting',
    'Subscription'
    // 'Business Profile'
  ];
  const { shifts: allShifts, setShifts: setShiftsStore } = useShiftsStore();
  const [editableShifts, setEditableShifts] = useState<any>();
  const [initialShifts, setInitialShifts] = useState<any>();
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);
  const [loadingBranding, setLoadingBranding] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [originalBranding, setOriginalBranding] = useState({
    logoPreviewUrl: logoPreviewUrl,
    primaryColor,
    secondaryColor
  });
  const [subscriptionIdToCancel, setSubscriptionIdToCancel] = useState<
    number | null
  >(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionIdToRefund, setSubscriptionIdtoRefund] = useState<
    string | null
  >(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [openPinModal, setOpenPinModal] = useState(false);
  const [pinPreference, setPinPreference] = useState<string | null>(null);

  const handleGetShifts = async () => {
    try {
      const response = await getShifts();
      setShiftsStore(response.data.shifts);
      setEditableShifts(response.data.shifts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetSubscription = async () => {
    if (!session?.user?.id) return;

    setLoadingSubscription(true);
    try {
      const response = await getUserSubscription(session.user.id);
      setSubscriptionData(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription details',
        variant: 'destructive'
      });
    } finally {
      setLoadingSubscription(false);
    }
  };
  const handleGetStripeAccount = async () => {
    if (!session?.user?.id) return;
    setLoadingBranding(true);
    try {
      const response = await getStripeAccount();

      setSecondaryColor(
        response.settings.branding.secondary_color
          ? response.settings.branding.secondary_color
          : '#000000'
      );
      setPrimaryColor(
        response.settings.branding.primary_color
          ? response.settings.branding.primary_color
          : '#ffffff'
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBranding(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      const unsubscribedAt = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      await removeSubscription(subscriptionId, unsubscribedAt);
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
        variant: 'success'
      });
      console.log(
        'Subscription cancelled successfully',
        subscriptionId,
        unsubscribedAt
      );

      handleGetSubscription();

      console.log(
        'Subscription cancelled successfully',
        subscriptionId,
        unsubscribedAt
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive'
      });
    }
  };

  const handleRefundSubscription = async (subscriptionId: string) => {
    try {
      await refundSubscription(subscriptionId);
      toast({
        title: 'Success',
        description: 'Subscription refunded successfully',
        variant: 'success'
      });
      handleGetSubscription();
      setSubscriptionIdtoRefund(null);
      setShowRefundModal(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refund subscription',
        variant: 'destructive'
      });
    }
  };

  const isEligibleForCancel = (subscription: any) => {
    const today = new Date();
    const endsAt = new Date(subscription.ends_at);
    if (subscription.refund_id) return false;
    const terminatedAt = subscription.unsubscribed_at
      ? new Date(subscription.unsubscribed_at)
      : null;

    // If already terminated, not eligible for cancellation
    if (terminatedAt) return false;

    // Can cancel if end date is in the future
    return endsAt > today;
  };

  const isEligibleForRefund = (subscription: any) => {
    if (!subscription.unsubscribed_at || subscription.refund_id) return false;
    const endsDate = new Date(subscription.ends_at);
    const today = new Date();
    return endsDate > today;
  };

  useEffect(() => {
    handleGetShifts();
  }, []);

  const hasFetchedStripeAccountRef = useRef(false);
  useEffect(() => {
    if (selectedTab === 'Subscription') {
      handleGetSubscription();
    }
    if (
      selectedTab === 'Business Setting' &&
      !hasFetchedStripeAccountRef.current
    ) {
      handleGetStripeAccount();
      hasFetchedStripeAccountRef.current = true;
    }
  }, [selectedTab]);

  // if (!session?.user.stripeAccount) {
  //   return (
  //     <div className="flex min-h-screen flex-col items-center justify-center">
  //       <h1 className="text-4xl font-bold">No Stripe Account connected</h1>
  //       <p className="text-lg">
  //         Please contact our team to connect your Stripe Account
  //       </p>
  //       <Button
  //         onClick={() => {
  //           const pinPreference = localStorage.getItem('pinPreference');
  //           localStorage.setItem(
  //             'pinPreference',
  //             pinPreference === 'true' ? 'false' : 'true'
  //           );
  //           clearCurrentEmployee();
  //           router.push('/pin');
  //         }}
  //       >
  //         Change PIN Preference
  //       </Button>
  //     </div>
  //   );
  // }

  // ---------------------------------------------------------
  // Shift Settings
  // ---------------------------------------------------------
  useEffect(() => {
    if (editableShifts && editableShifts.length > 0 && !initialShifts) {
      setInitialShifts(editableShifts);
    }
  }, [editableShifts, initialShifts]);

  const editShifts = (fields: Partial<{ shifts: any }>) => {
    if (fields.shifts) {
      setEditableShifts(fields.shifts);
      if (!initialShifts || initialShifts.length === 0) {
        setInitialShifts(fields.shifts);
      }
    }
  };
  const hasChanges = !isEqual(initialShifts, editableShifts);
  const submitShifts = async () => {
    try {
      console.log(editableShifts, 'editableShifts');
      // const kari = editableShifts.map((shift: any) => {
      //   shift.id = 0;
      //   return shift;
      // });
      const response = await setShifts(editableShifts);
      console.log(response, 'response');
      toast({
        title: 'Success',
        variant: 'success',
        description: 'Successfully Edited Shifts'
      });
      setInitialShifts(editableShifts);
    } catch (error) {
      toast({
        title: 'Error',
        // @ts-ignore
        description: err?.response?.data?.message || 'Error Editing Shifts',
        variant: 'destructive',
        duration: 5000
      });
      console.error(error);
    }
  };

  const imageSubmit = async (file: File, type: string) => {
    let resizedFile = file;
    if (file.size > 512 * 1024) {
      try {
        resizedFile = await resizeImageTo512KB(file);
      } catch (error) {
        console.error('Error resizing image:', error);
      }
    }
    try {
      const formData = new FormData();
      formData.append('name', resizedFile.name);
      formData.append('file', resizedFile);
      formData.append(
        'type',
        type === 'logo' ? 'business_logo' : 'business_icon'
      );
      const response = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      const fileUrl = result.file.links.data[0].url;
      const fileId = result.file.id;

      if (type === 'logo') {
        await update({ logo: fileUrl });
      }
      return fileId;
    } catch (err) {
      console.error(err);
    }
  };
  const handleSubmit = async () => {
    if (!session?.user.stripeAccount) return;
    setLoading(true);
    try {
      let logoImageId;
      if (logo) logoImageId = await imageSubmit(logo, 'logo');

      const formData = new FormData();
      if (logoImageId) formData.append('logo', logoImageId);
      formData.append('primaryColor', primaryColor);
      formData.append('secondaryColor', secondaryColor);
      formData.append('accountId', session?.user.stripeAccount);

      await fetch('/api/account/update', {
        method: 'POST',
        body: formData
      });

      setOriginalBranding({
        logoPreviewUrl: logoPreviewUrl ?? '',
        primaryColor,
        secondaryColor
      });
      setLogo(null);

      toast({
        title: 'Success',
        description: 'Branding updated successfully!',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update branding',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pinPreference = localStorage.getItem('pinPreference');
    console.log(pinPreference, 'pinPreference');
  }, []);
  const selectedSubscription = subscriptionData.find(
    (sub) => sub.id === subscriptionIdToCancel
  );

  const getSubscriptionStatus = (subscription: Subscription) => {
    const isRefunded = Boolean(subscription.refunded_at);
    const isTerminated = Boolean(subscription.terminated_at);
    const isUnsubscribed = Boolean(subscription.unsubscribed_at);

    let statusText = 'Active';
    let statusColor = 'text-green-500 border-green-500';

    if (isRefunded || isTerminated) {
      statusText = 'Terminated';
      statusColor = 'text-red-500 border-red-500';
    } else if (isUnsubscribed) {
      statusText = 'Ending Soon';
      statusColor = 'text-yellow-500 border-yellow-500';
    }

    return { statusText, statusColor };
  };
  return (
    <PageContainer scrollable>
      <div className="mb-4 ml-8">
        <Heading
          title={`General Settings`}
          description="Manage your restaurant's general settings"
          titleClass="text-xl"
          descriptionClass="text-sm"
        />
      </div>
      <div className="border-b pl-4">
        <Tabs defaultValue="Table Layout" onValueChange={setSelectedTab}>
          <TabsList className="flex w-fit flex-wrap bg-background md:block md:flex-nowrap">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 py-2 text-center hover:text-primary data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {selectedTab === 'Table Layout' && (
        <div className="mt-4">
          <TableLayoutEditor />
        </div>
      )}

      {selectedTab === 'Shift Setting' && (
        <div className="my-8">
          {/* <ShiftsForm key="shifts" shifts={allShifts} /> */}
          <div className="mb-20 px-6">
            <div className="mb-8">
              <h2 className="text-base font-semibold">Weekly Shift Setup</h2>
              <p className="text-sm text-muted-foreground">
                Define your team’s weekly shifts, including working days, hours,
                and shift colours.
              </p>
            </div>
            <ShiftsTable
              shifts={editableShifts}
              updateFields={editShifts}
              isSignUp={false}
            />
            <div className="mt-4 flex justify-center">
              <Button
                onClick={submitShifts}
                disabled={!hasChanges}
                className="w-40 disabled:opacity-30"
              >
                Save Shifts
              </Button>
            </div>
          </div>

          {/* Special days settings */}
          <div className="px-8">
            <div className="mb-8">
              <h2 className="text-base font-semibold">Special Day Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage exceptions to your regular hours, including public
                holidays and special events.
              </p>
            </div>
            <div className="mt-8 max-w-[800px] rounded-lg bg-secondary p-8">
              {/* TODO Change className to commentout when APIs are ready */}
              {/* <div className="mt-8 rounded-lg border p-8"> */}
              <SpecialDaysForm />
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'Business Setting' && !session?.user.stripeAccount ? (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">No Stripe Account connected</h1>
          <p className="text-lg">
            Please contact our team to connect your Stripe Account
          </p>
          <Button
            onClick={() => {
              const pinPreference = localStorage.getItem('pinPreference');
              localStorage.setItem(
                'pinPreference',
                pinPreference === 'true' ? 'false' : 'true'
              );
              clearCurrentEmployee();
              router.push('/pin');
            }}
          >
            Change PIN Preference
          </Button>
        </div>
      ) : selectedTab === 'Business Setting' && loadingBranding ? (
        <div className="flex h-[60dvh] w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin">
            <Loader2 />
          </div>
        </div>
      ) : (
        selectedTab === 'Business Setting' && (
          <>
            <div className="my-8 flex w-full flex-col justify-around md:flex-row">
              <div className="flex flex-col px-6 md:w-1/2 md:border-r">
                <div className="mb-12 border-b pb-12">
                  <div className="mb-8">
                    <h2 className="text-base font-semibold">
                      Business Profile
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      View and update your business information
                    </p>
                  </div>
                  <div className="px-4 md:max-w-md">
                    <BusinessProfileForm
                      businessName={businessName}
                      setBusinessName={setBusinessName}
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-base font-semibold">Update Branding</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your restaurant&apos;s branding settings here.
                  </p>
                </div>
                <div className="px-4 md:max-w-md">
                  <BrandingSettings
                    session={session}
                    logo={logo}
                    setLogo={setLogo}
                    logoPreviewUrl={logoPreviewUrl}
                    setLogoPreviewUrl={setLogoPreviewUrl}
                    primaryColor={primaryColor}
                    setPrimaryColor={setPrimaryColor}
                    secondaryColor={secondaryColor}
                    setSecondaryColor={setSecondaryColor}
                    setLoading={setLoading}
                    loading={loading}
                    update={update}
                    router={router}
                    clearCurrentEmployee={clearCurrentEmployee}
                    originalBranding={originalBranding}
                    setOriginalBranding={setOriginalBranding}
                    handleSubmit={handleSubmit}
                  />
                </div>
              </div>
              <div className="mt-12 md:mt-0 md:w-1/2">
                <div
                  className={`invoice-preview mx-auto flex max-w-[400px] flex-col rounded p-6 shadow-md`}
                  style={{
                    backgroundColor: primaryColor
                  }}
                >
                  <div className="mb-4 flex items-center">
                    {logo && (
                      <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          // @ts-ignore
                          src={logoPreviewUrl}
                          alt="Logo Preview"
                          width={40}
                          height={40}
                          className="aspect-square object-cover"
                        />
                      </div>
                    )}
                    <h2 className="text-lg font-bold text-black">
                      {businessName}
                    </h2>
                  </div>
                  <div className="mb-4 rounded bg-gray-100 p-6">
                    <p className="mb-4 text-sm text-gray-600">
                      Invoice from
                      <span className="font-semibold"> {businessName}</span>
                    </p>
                    <h3 className="mb-2 text-4xl font-bold text-black">A$10</h3>
                    <p className="mb-4 text-gray-500">
                      Due {new Date().toDateString()}
                    </p>
                    <p className="text-gray-700">
                      <strong>To:</strong> Example Customer
                    </p>
                    <p className="text-gray-700">
                      <strong>From:</strong> {businessName}
                    </p>
                    <table className="mt-4 w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="text-black">Description</th>
                          <th className="text-right text-black">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-black">Item</td>
                          <td className="text-right text-black">$10</td>
                          <td className="text-right text-black"></td>
                        </tr>
                      </tbody>
                    </table>
                    <Button
                      className="mt-4 w-full"
                      style={{ backgroundColor: secondaryColor }}
                      onClick={() => {}}
                    >
                      Pay Now
                    </Button>
                  </div>
                  <div className="rounded bg-gray-50 p-4">
                    <p className="font-bold text-gray-700">
                      {/* {showInvoiceForm ? 'Invoice' : 'Subscription'}{' '} */}
                      #EXAMPLE-0001
                    </p>
                    <div className="mt-2 flex justify-between">
                      <p className="text-gray-500">Total due</p>
                      <p className="text-gray-700">A$10</p>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <p className="text-gray-500">Amount paid</p>
                      <p className="text-gray-700">A$0.00</p>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <p className="text-gray-500">Amount remaining</p>
                      <p className="text-gray-700">A$10</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-900">
                    <p>
                      Questions? Contact us at{' '}
                      <a
                        href={`mailto:${session?.user.email}`}
                        className="text-blue-500 underline"
                      >
                        {session?.user.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-4 bg-background py-4">
              <Button
                disabled={loading}
                onClick={() => {
                  setOpenPinModal(true);
                  const currentPref = localStorage.getItem('pinPreference');
                  setPinPreference(currentPref);
                }}
              >
                Change PIN Preference
              </Button>
            </div>
            <Modal
              isOpen={openPinModal}
              onClose={() => setOpenPinModal(false)}
              title="Change PIN Preference"
              description={
                pinPreference === 'true'
                  ? 'You will not need to enter your PIN every time you log in.'
                  : 'You will need to enter your PIN every time you log in.'
              }
              className="max-w-[600px]"
            >
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenPinModal(false)}
                  className="ml-2"
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => {
                    const pinPreference = localStorage.getItem('pinPreference');
                    localStorage.setItem(
                      'pinPreference',
                      pinPreference === 'true' ? 'false' : 'true'
                    );
                    clearCurrentEmployee();
                    router.push('/pin');
                  }}
                >
                  Change Preference
                </Button>
              </div>
            </Modal>
          </>
        )
      )}

      {selectedTab === 'Subscription' && (
        <>
          <div className="p-6">
            <>
              <div className="mb-8 items-end md:flex md:justify-between">
                <div className="">
                  <h2 className="text-base font-semibold">
                    Subscription Management
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription details and payment methods here.
                    You can also cancel or request a refund for your
                    subscription.
                  </p>
                </div>
                <Button
                  className="mt-4 w-40 md:mt-0"
                  onClick={() => window.open('/upgrade-plan', '_blank')}
                >
                  Upgrade Plan
                </Button>
              </div>
              <div>
                {loadingSubscription ? (
                  <div className="flex justify-center p-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  </div>
                ) : subscriptionData && subscriptionData.length > 0 ? (
                  <div className="space-y-8">
                    {subscriptionData.map((subscription) => {
                      const { statusText, statusColor } =
                        getSubscriptionStatus(subscription);

                      return (
                        <div
                          key={subscription.id}
                          className=" rounded-xl border bg-secondary p-6 shadow-sm"
                        >
                          {/* Header */}
                          <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                              Subscription Summary
                            </h2>
                            <span
                              className={`rounded-full border px-4 py-1 text-xs font-semibold ${statusColor}`}
                            >
                              {statusText}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            <div>
                              <h4 className="text-sm font-medium text-secondary-foreground">
                                Start Date
                              </h4>
                              <p className="text-base">
                                {new Date(
                                  subscription.started_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-secondary-foreground">
                                End Date
                              </h4>
                              <p className="text-base">
                                {new Date(
                                  subscription.ends_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-secondary-foreground">
                                Duration
                              </h4>
                              <p className="text-base">
                                {subscription.duration} days
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-secondary-foreground">
                                Base Amount
                              </h4>
                              <p className="text-base">
                                ${subscription.amount?.toFixed(2) || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-secondary-foreground">
                                Total (incl. surcharge)
                              </h4>
                              <p className="text-base">
                                $
                                {subscription.total_amount?.toFixed(2) || 'N/A'}
                              </p>
                            </div>
                            {subscription.receipt_url ? (
                              <div>
                                <h4 className="text-sm font-medium text-secondary-foreground">
                                  Receipt
                                </h4>
                                <Link
                                  href={subscription.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 underline underline-offset-4 hover:text-primary"
                                >
                                  View Receipt
                                </Link>
                              </div>
                            ) : null}
                            {subscription.refunded_at && (
                              <div>
                                <h4 className="text-sm font-medium text-secondary-foreground">
                                  Refunded At
                                </h4>
                                <p className="text-base">
                                  {new Date(
                                    subscription.refunded_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                          {/* Buttons */}
                          <div className="mt-6 flex justify-end gap-3">
                            {isEligibleForCancel(subscription) && (
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  setSubscriptionIdToCancel(subscription.id);
                                  setShowCancelModal(true);
                                }}
                              >
                                Cancel Subscription
                              </Button>
                            )}
                            {isEligibleForRefund(subscription) && (
                              <Button
                                variant="outline"
                                onClick={
                                  () => {
                                    setSubscriptionIdtoRefund(
                                      subscription.payment_intent_id.toString()
                                    );
                                    setShowRefundModal(true);
                                  }

                                  // handleRefundSubscription(
                                  //   subscription.payment_intent_id
                                  // )
                                }
                              >
                                Request Refund
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>No subscriptions found.</p>
                )}
              </div>
            </>
          </div>
          <Modal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            title="Cancel Subscription"
            description={`Are you sure you want to cancel your subscription? This action cannot be undone. Unless you request a refund, your subscription will remain active until the end date (${
              selectedSubscription
                ? new Date(selectedSubscription.ends_at).toLocaleDateString()
                : 'N/A'
            }).`}
            className="max-w-[600px]"
          >
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="ml-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (subscriptionIdToCancel !== null) {
                    handleCancelSubscription(subscriptionIdToCancel);
                  }
                  setShowCancelModal(false);
                  setSubscriptionIdToCancel(null);
                }}
              >
                Confirm Cancellation
              </Button>
            </div>
          </Modal>
          <Modal
            isOpen={showRefundModal}
            onClose={() => setShowRefundModal(false)}
            title="Request Refund"
            description={`Are you sure you want to request a refund for this subscription? Once the refund is processed, this subscription will be completely deactivated even if the end date has not yet been reached.`}
            className="max-w-[600px]"
          >
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowRefundModal(false)}
                className="ml-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (subscriptionIdToRefund !== null) {
                    handleRefundSubscription(subscriptionIdToRefund);
                  }
                  setShowRefundModal(false);
                  setSubscriptionIdtoRefund(null);
                }}
              >
                Confirm Refund
              </Button>
            </div>
          </Modal>
        </>
      )}
    </PageContainer>
  );
}
