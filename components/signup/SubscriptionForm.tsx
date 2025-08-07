import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { useToast } from '@/components/ui/use-toast';
import { signOut } from 'next-auth/react';
import { FadeInBottom } from '../ui/fade-in-bottom';
import { Button } from '../ui/button';
import { customPricingInfo } from '@/constants/data';
import TextLink from '../ui/text-link';
import { TransactionFee } from './TransactionFee';
import { useApi } from '@/hooks/useApi';
import { useSession } from 'next-auth/react';
import { Modal } from '@/components/ui/modal';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
type Subscription = {
  id: number;
  name: string;
  type: number;
  plan: number;
  monthly_price: string | number;
  annual_price: string | number;
  unsubscribed_at: string | null;
  account_permissions: {
    main_nav: Record<string, boolean>;
    team: Record<string, boolean>;
    pos: Record<string, boolean>;
  };

  refund_id?: number | null;
  refunded_at?: string | null;
  amount?: number;
  surcharge?: number;
  total_amount?: number;
  payment_intent_id?: string;
  subscription_type?: string;
  receipt_url?: string | null;
  purchase_type?: string;
  user_id?: number;
  admin_subscription_id?: number | null;
  admin_subscription_ids?: string;
  started_at?: string;
  ends_at?: string;
  terminated_at?: string | null;
  duration?: number;
  main_nav?: number;
  team?: number;
  pos?: number;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  failed_attempts?: number;
};

type SubscriptionFormProps = {
  selectedSubscription?: any[];
  updateFields: any;
  handleNext: () => void;
  type?: string;
};

export default function SubscriptionForm({
  selectedSubscription = [],
  updateFields,
  handleNext,
  type = 'signup'
}: SubscriptionFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const hasHandledNext = useRef(false);
  const [fullPackage, setFullPackage] = useState<any>(null);
  const [trialPackage, setTrialPackage] = useState<any>(null);
  const [customPackages, setCustomPackages] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);

  const {
    getSubscriptionList,
    removeSubscription,
    refundSubscription,
    getUserSubscription,
    getStripeAccount,
    attachAdminSubscriptions
  } = useApi();
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (type === 'upgrade' && !session) {
      router.push('/');
    }
  }, [type, session]);

  const isAnyCustomSelected =
    Array.isArray(selectedSubscription) &&
    selectedSubscription.some((sub) => sub.plan === 3);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const fetchedSubscriptions = await getSubscriptionList();
        setSubscriptions(fetchedSubscriptions);
        const packageIds = searchParams
          .get('package')
          ?.split(',')
          .map((id) => parseInt(id));
        if (packageIds) {
          const matchedSubscriptions = fetchedSubscriptions.filter((sub: any) =>
            packageIds.includes(sub.id)
          );
          if (matchedSubscriptions.length > 0 && !hasHandledNext.current) {
            updateFields({ selectedSubscription: matchedSubscriptions });
            hasHandledNext.current = true;
            const params = new URLSearchParams(window.location.search);
            params.delete('package');
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
            setTimeout(() => handleNext(), 100);
          }
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    // plan: 1 for trial, 2 for full, 3 for custom
    setTrialPackage(subscriptions?.find((sub) => sub.plan === 1));
    setFullPackage(subscriptions.find((sub) => sub.plan === 2));
    setCustomPackages(subscriptions.filter((sub) => sub.plan === 3));
    updateFields({
      subscriptions: subscriptions
    });
  }, [subscriptions]);

  const handleSubscriptionClick = (
    subscription: Subscription,
    isSinglePackage = false
  ) => {
    if (!Array.isArray(selectedSubscription)) {
      updateFields({ selectedSubscription: [subscription] });
      return;
    }

    if (isSinglePackage) {
      updateFields({
        selectedSubscription: [subscription]
      });
      return;
    }

    const isSelected = selectedSubscription.some(
      (sub) => sub.id === subscription.id
    );

    const filteredSelection = selectedSubscription.filter(
      (sub) => sub.id !== fullPackage?.id && sub.id !== trialPackage?.id
    );

    updateFields({
      selectedSubscription: isSelected
        ? filteredSelection.filter((sub) => sub.id !== subscription.id)
        : [...filteredSelection, subscription]
    });
  };
  const handleGetSubscription = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await getUserSubscription(session.user.id);
      setSubscriptionData(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription details',
        variant: 'destructive'
      });
    }
  };
  useEffect(() => {
    handleGetSubscription();
  }, []);

  const handlePlanChange = async (newPlanId: number) => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      // // Step 1: Unsubscribe current plan
      const currentSubscription = subscriptionData[0];
      if (currentSubscription?.id) {
        const unsubscribedAt = new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
        await removeSubscription(currentSubscription.id, unsubscribedAt);
      }
      // // Step 2: Subscribe to new plan
      const params = {
        admin_subscription_ids: selectedSubscription.map((sub) => sub.id),
        user_id: session.user.id,
        started_at: new Date().toISOString().split('T')[0],
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      };
      console.log(params, 'params');
      const response = await attachAdminSubscriptions(params);
      console.log(response, 'response');
      // if (response.status !== 200) {
      //   throw new Error('Failed to attach subscriptions');
      // }

      // step 3: Refund previous plan
      if (currentSubscription?.payment_intent_id) {
        try {
          await refundSubscription(currentSubscription.payment_intent_id);
        } catch (error) {
          console.error('Failed to refund previous plan:', error);
          toast({
            title: 'Warning',
            description:
              'Refund for previous plan failed, but your new plan has been updated.',
            variant: 'default'
          });
        }
      }

      // Step 4: Log out
      setShowUpgradeModal(false);
      setIsLoading(false);
      setTimeout(() => {
        toast({
          title: 'Success',
          description: 'Your plan has been successfully upgraded.',
          variant: 'success'
        });

        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 3000);
      }, 0);
    } catch (error) {
      console.error('Failed to change plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to change plan',
        variant: 'destructive'
      });
      setShowUpgradeModal(false);
      setIsLoading(false);
      return;
    } finally {
    }
  };
  const totalCost = useMemo(() => {
    if (!Array.isArray(selectedSubscription)) return 0;

    return selectedSubscription.reduce((sum, sub) => {
      const price =
        typeof sub.monthly_price === 'string'
          ? parseFloat(sub.monthly_price)
          : sub.monthly_price || 0;
      return sum + price;
    }, 0);
  }, [selectedSubscription]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 pt-8 text-center">
        <h2 className="text-2xl font-semibold">Choose Your Plan</h2>
        <p className="text-gray-600">
          Select the perfect plan for your business.
        </p>
      </div>
      <FadeInBottom variant="bottom">
        <div className="flex-wrap justify-center pb-16 pt-4 md:flex md:gap-4">
          {fullPackage && (
            <div
              className={clsx(
                'relative mb-4 flex flex-1 flex-col gap-4 rounded-xl border px-6 pb-10 text-sm md:mb-0 md:max-w-96 md:pb-6',
                'shadow',
                isAnyCustomSelected
                  ? 'bg-white pt-6'
                  : 'border-primary bg-primary/5 pt-10 md:-my-4 md:min-h-[20rem]'
              )}
            >
              <div className="absolute right-2 top-2 m-2 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-black shadow">
                Recommended
              </div>
              <h2 className="text-xl font-semibold">{fullPackage.name}</h2>
              <div className="relative text-4xl font-bold">
                <span className="absolute left-0 top-0 mb-auto text-xl font-semibold text-foreground">
                  $
                </span>
                <p className="pl-4">
                  {fullPackage.monthly_price}
                  <span className="text-sm font-normal"> / month</span>
                </p>
              </div>
              <Button
                className="h-12 w-full rounded-lg font-semibold"
                onClick={() => {
                  handleSubscriptionClick(fullPackage, true);

                  if (type === 'upgrade') {
                    setShowUpgradeModal(true);
                  }
                }}
              >
                Select
              </Button>
              <p className="my-2 text-sm">{fullPackage.description}</p>
              <ul className="mb-4 space-y-1 text-sm">
                {[
                  'Reservations',
                  'Point of Sale',
                  'Team Management',
                  'Inventory Management',
                  'Online Store',
                  'Additional features'
                ].map((feature: any, i: number) => (
                  <li key={i} className="flex items-baseline">
                    <span className="relative mr-3 h-2 min-h-2 w-2 min-w-2 animate-bounce rounded-full bg-primary"></span>
                    <p>{feature}</p>
                  </li>
                ))}
              </ul>
              <TransactionFee
                isShowPersonTransactionFee={
                  fullPackage.display_in_person_transaction_rate === 1
                }
                isShowOnlineTransactionFee={
                  fullPackage.display_online_transaction_rate
                }
              />
            </div>
          )}
          <div
            key={customPricingInfo.Custom.title}
            className={clsx(
              'relative flex flex-1 flex-col gap-4 rounded-xl border px-6 pb-10 text-sm md:max-w-96 md:pb-6',
              'shadow',
              isAnyCustomSelected
                ? 'border-primary bg-primary/5 pt-10 md:-my-4 md:min-h-[20rem]'
                : 'bg-white pt-6'
            )}
          >
            <h2 className="text-xl font-semibold">
              {customPricingInfo.Custom.title}
            </h2>
            <div className="relative text-4xl font-bold">
              <span className="absolute left-0 top-0 mb-auto text-xl font-semibold text-foreground">
                $
              </span>
              <p className="pl-4">
                Custom
                <span className="text-sm font-normal"> / month</span>
              </p>
            </div>
            <Button
              className="h-12 w-full rounded-lg font-semibold"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('custom-pricing')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Customize Your Plan
            </Button>
            <p className="my-2 text-sm">
              {customPricingInfo.Custom.description}
            </p>
            <ul className="mb-4 space-y-1 text-sm">
              {customPricingInfo.Custom.features.map(
                (feature: any, i: number) => (
                  <li key={i} className="flex items-baseline">
                    <span className="relative mr-3 h-2 min-h-2 w-2 min-w-2 animate-bounce rounded-full bg-primary"></span>
                    <p>{feature}</p>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </FadeInBottom>
      <div id="custom-pricing" className="space-y-8">
        <div>
          <h2 className="text-heading mt-12 text-center text-2xl font-bold md:mt-32 md:text-4xl">
            Customize Your Feature Package
          </h2>
          <p className="text-description my-4 text-center text-sm">
            ※You can check if your custom selection matches the full package
            before final registration.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customPackages.map((sub: any, index: number) => {
            const isSelected =
              Array.isArray(selectedSubscription) &&
              selectedSubscription.some(
                (selectedSub) => selectedSub.id === sub?.id
              );
            return (
              <div
                key={index}
                onClick={() => {
                  handleSubscriptionClick(sub as Subscription);
                }}
                className={cn(
                  'group relative flex cursor-pointer flex-col rounded-lg border-2 p-6 pt-8 text-left transition-all duration-500 hover:scale-105',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-white'
                )}
              >
                <div key={index} className="mb-4">
                  <div className="mt-4 text-center text-4xl">
                    <div
                      className={`text-heading } mb-1 text-lg
                      font-semibold`}
                    >
                      {sub.name}
                    </div>

                    {sub.monthly_price && (
                      <div className="relative inline-flex items-baseline gap-2">
                        <span className="absolute left-0 top-0 mb-auto text-xl font-semibold text-foreground">
                          $
                        </span>
                        <span className="text-heading pl-4 text-4xl font-bold">
                          {typeof sub.monthly_price === 'number'
                            ? sub.monthly_price.toFixed(2)
                            : sub.monthly_price}
                        </span>
                        <span className="text-sm"> / month</span>
                      </div>
                    )}
                  </div>

                  <div className="py-8">
                    <SvgIcon base64={sub.icon_url} isSelected={isSelected} />
                  </div>

                  {sub.description && (
                    <div className="mb-4">
                      <p className="text-description text-sm">
                        {sub.description}
                      </p>

                      <TextLink
                        className="mt-1 text-sm "
                        url={'https://wabify.com/' + sub.learn_more_link || ''}
                        value="Learn more"
                        isTargetBlank={true}
                      />
                    </div>
                  )}
                  <TransactionFee
                    isShowPersonTransactionFee={
                      sub.display_in_person_transaction_rate === 1
                    }
                    isShowOnlineTransactionFee={
                      sub.display_online_transaction_rate === 1
                    }
                  />
                </div>

                <div className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Select
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {type === 'upgrade' && mounted && (
        <div
          className={cn(
            'fixed right-6 top-6 z-50 transform rounded-lg bg-white p-4 shadow-lg transition-all duration-300',
            isAnyCustomSelected
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-full opacity-0'
          )}
        >
          <div className="mb-4 text-sm font-medium text-gray-700">
            Total Cost:{' '}
            <span className="text-xl font-bold text-primary">
              ${mounted ? totalCost.toFixed(2) : '...'} / month{' '}
            </span>
          </div>
          <div className="w-full text-right">
            <Button
              onClick={() => {
                setShowUpgradeModal(true);
              }}
              className="px-8"
            >
              Confirm Upgrade
            </Button>
          </div>
        </div>
      )}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade Plan"
        description="You're about to change your current subscription plan. Please confirm the details below."
        className="max-w-[600px]"
      >
        <div className="text-sm text-gray-700">
          <div className="mb-8 rounded-lg bg-secondary p-4">
            <p className="mb-2 font-semibold">Current Plan</p>
            {subscriptionData[0] ? (
              <div className="pl-2">
                <p>
                  <span className="font-medium">Amount:</span> $
                  {(subscriptionData[0]?.amount ?? 0).toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Period:</span>{' '}
                  {new Date(
                    subscriptionData[0]?.started_at
                      ? new Date(subscriptionData[0].started_at)
                      : new Date()
                  ).toLocaleDateString()}{' '}
                  –{' '}
                  {subscriptionData[0].ends_at
                    ? new Date(subscriptionData[0].ends_at).toLocaleDateString()
                    : 'N/A'}
                </p>
                {subscriptionData[0].receipt_url && (
                  <p>
                    <a
                      href={subscriptionData[0].receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Receipt
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No current subscription found.</p>
            )}
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <p className="mb-2 font-semibold">New Plan</p>
            <div className="pl-2">
              <p>
                <span className="font-medium">Total Cost:</span>{' '}
                <span className="font-bold text-primary">
                  ${totalCost.toFixed(2)} / month
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => setShowUpgradeModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handlePlanChange(fullPackage.id);
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Upgrade'
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
const SvgIcon = ({
  base64,
  isSelected
}: {
  base64: string;
  isSelected: boolean;
}) => {
  const svgString = useMemo(() => {
    const decoded = atob(base64.replace(/^data:image\/svg\+xml;base64,/, ''));
    return decoded.replace('<svg', '<svg class="w-full h-full"');
  }, [base64]);

  return (
    <div
      className={`mx-auto flex h-[60px] w-[60px] items-center justify-center transition-all text-${
        isSelected ? 'purple' : 'foreground'
      }`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};
