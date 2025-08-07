'use client';

import React, { useState, useEffect } from 'react';
import useMultistepForm from '@/hooks/useMultistepForm';
import EmailPasswordForm from '@/components/signup/EmailPasswordForm';
import BusinessProfileForm from '@/components/signup/BusinessProfileForm';
import ShiftsForm from '@/components/signup/ShiftsForm';
import FloorsForm from '@/components/signup/FloorsForm';
import TableLayoutForm from '@/components/signup/TableLayoutForm';
import { useApi } from '@/hooks/useApi';
import SubscriptionForm from '@/components/signup/SubscriptionForm';
import { motion } from 'framer-motion';
import Image from 'next/image';
import wabiLogo from '@/public/wabi-black.svg';
import PageContainer from '@/components/layout/page-container';
import MenuImportForm from '@/components/signup/MenuImportForm';
import TeamMemberForm from '@/components/signup/TeamMemberForm';
import { StripeProvider } from '@/components/signup/StripeProvider';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import CheckoutForm from '@/components/signup/CheckoutForm';

type Shift = {
  id: number;
  name: string;
  start_time: number;
  end_time: number;
  day_of_week: number[];
  shift_color: string;
  floors: number[];
  turn_time: number;
};

type Floor = {
  id: number;
  floor_name: string;
};

type Table = {
  id: number;
  name: string;
  capacity_min: number;
  capacity_max: number;
  floor_id: number;
  pos_x: number;
  pos_y: number;
  table_type: number;
  rotate_deg: number;
  can_rotate: boolean;
  widget_is_non_reservable: boolean;
  widget_start_date_time?: string;
  widget_end_date_time?: string;
  color?: string;
};

type TeamMember = {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  role: string;
  quick_pin: string;
};

type FormData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  cardToken?: string;
  businessProfile: {
    extension: string;
    business_type: string;
    phone_no: string;
    address: string;
    business_name: string;
  };
  subscriptions: any[];
  selectedSubscription: any[];
  teamMembers: TeamMember[];
  customRoles: string[];
  shifts: Shift[];
  floors: Floor[];
  tables: Table[];
  menuData?: {
    categories: Array<{
      name: string;
      color: string;
      order: number;
    }>;
    products: Array<{
      title: string;
      price: number;
      code: string;
      stock: string;
      description: string;
      category_id: number;
    }>;
  };
};

export default function SignUpPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, []);

  const [formData, setFormData] = useState<FormData>(() => {
    // Try to load saved form data from localStorage
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('signupFormData');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Error parsing saved form data:', e);
        }
      }
    }
    // Return default values if no saved data exists
    return {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      businessProfile: {
        extension: '61',
        business_type: 'restaurant',
        phone_no: '',
        address: '',
        business_name: ''
      },
      selectedSubscription: undefined,
      teamMembers: [],
      customRoles: [],
      shifts: [],
      floors: [],
      tables: []
    };
  });

  // const { data: session, update } = useSession();

  // const [windowSize, setWindowSize] = useState({
  //   width: typeof window !== 'undefined' ? window.innerWidth : 0,
  //   height: typeof window !== 'undefined' ? window.innerHeight : 0
  // });
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('signupFormData', JSON.stringify(formData));
  }, [formData]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowSize({
  //       width: window.innerWidth,
  //       height: window.innerHeight
  //     });
  //   };

  //   if (typeof window !== 'undefined') {
  //     window.addEventListener('resize', handleResize);
  //     return () => window.removeEventListener('resize', handleResize);
  //   }
  // }, []);

  const updateFields = <K extends keyof FormData>(
    fields: Partial<Pick<FormData, K>>
  ) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleMenuImport = async (menuData?: any) => {
    if (menuData) {
      // Format the menu data to match the FormData structure
      const formattedMenuData = {
        categories: menuData.categories.map((cat: any) => ({
          name: cat.name,
          color: cat.color,
          order: cat.order || 0
        })),
        products: menuData.products.map((prod: any) => ({
          title: prod.title,
          price:
            typeof prod.price === 'string'
              ? parseFloat(prod.price)
              : prod.price,
          code: prod.code || '',
          stock: prod.stock || '0',
          description: prod.description || '',
          category_id:
            typeof prod.category_id === 'string'
              ? parseInt(prod.category_id)
              : prod.category_id,
          color: prod.color || '#000000'
        }))
      };

      // Update the form data with the formatted menu data
      updateFields({ menuData: formattedMenuData });
    }
  };

  // Get the available features based on selected subscription
  const getAvailableFeatures = () => {
    if (!formData.selectedSubscription?.length) {
      return {
        hasReservations: false,
        hasPos: false,
        hasTeam: false
      };
    }
    const main_nav =
      formData.selectedSubscription?.reduce(
        (acc, subscription) => {
          const permissions = subscription.account_permissions?.main_nav || {};
          Object.keys(permissions).forEach((key) => {
            if (permissions[key]) {
              acc[key] = true;
            }
          });
          return acc;
        },
        {} as Record<string, boolean>
      ) || {};
    return {
      hasReservations: main_nav.reservations,
      hasPos: main_nav.pos,
      hasTeam: main_nav.team
    };
  };
  const handleNext = () => {
    next();
  };

  // Get the steps based on subscription features
  const getSteps = () => {
    const steps = [
      <SubscriptionForm
        key="subscription"
        selectedSubscription={formData.selectedSubscription}
        updateFields={updateFields}
        handleNext={handleNext}
      />,
      <EmailPasswordForm
        key="email"
        {...formData}
        updateFields={updateFields}
        onEmailValidation={setIsEmailValid}
      />,
      <BusinessProfileForm
        key="business"
        {...formData}
        updateFields={updateFields}
      />
    ];

    const { hasReservations, hasPos, hasTeam } = getAvailableFeatures();
    steps.push(
      <ShiftsForm
        key="shifts"
        shifts={formData.shifts}
        updateFields={updateFields}
      />
    );
    if (hasPos) {
      steps.push(
        <MenuImportForm
          key="menu"
          onComplete={handleMenuImport}
          initialData={formData.menuData}
        />
      );
    }

    if (hasTeam) {
      steps.push(
        <TeamMemberForm
          key="team"
          teamMembers={formData.teamMembers}
          customRoles={formData.customRoles}
          updateFields={updateFields}
        />
      );
    }

    if (hasReservations) {
      steps.push(
        <FloorsForm
          key="floors"
          floors={formData.floors}
          updateFields={updateFields}
        />,
        <TableLayoutForm
          key="tables"
          tables={formData.tables}
          floors={formData.floors}
          updateFields={updateFields}
        />
      );
    }

    // Add the checkout form as the last step
    steps.push(
      <StripeProvider key="checkout-provider">
        <CheckoutForm
          key="checkout"
          selectedSubscription={formData.selectedSubscription}
          subscriptions={formData.subscriptions}
          updateFields={updateFields}
        />
      </StripeProvider>
    );

    return steps;
  };

  const {
    step,
    steps,
    currentStepIndex,

    isSecondLastStep,
    next
  } = useMultistepForm(getSteps());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <PageContainer scrollable className="light min-h-screen bg-gray-50 pt-8">
      <div
        className={`mx-auto ${
          isSecondLastStep ? 'max-w-sm md:max-w-7xl' : 'max-w-sm md:max-w-6xl'
        }`}
        style={{ colorScheme: 'auto' }}
      >
        <div className="mb-8 flex flex-col items-center justify-center space-y-4">
          <Image
            src={wabiLogo}
            alt="Wabi Logo"
            width={120}
            height={120}
            className="mb-4"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="relative mb-8">
            <div className="mb-12">
              <SubscriptionForm
                key="subscription"
                selectedSubscription={formData.selectedSubscription}
                updateFields={updateFields}
                handleNext={handleNext}
                type="upgrade"
              />
              ,
            </div>

            <div className="flex items-center justify-center gap-8">
              <p className="">Do you need help?</p>
              <Button
                className="w-40 md:mt-0"
                onClick={() =>
                  window.open('https://wabify.com/contact', '_blank')
                }
                variant={'outline'}
              >
                Contact us
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageContainer>
  );
}
