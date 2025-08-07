'use client';

import React, { useState, useEffect } from 'react';
import useMultistepForm from '@/hooks/useMultistepForm';
import EmailPasswordForm from '@/components/signup/EmailPasswordForm';
import BusinessProfileForm from '@/components/signup/BusinessProfileForm';
import ShiftsForm from '@/components/signup/ShiftsForm';
import FloorsForm from '@/components/signup/FloorsForm';
import TableLayoutForm from '@/components/signup/TableLayoutForm';
import { useApi } from '@/hooks/useApi';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import wabiLogo from '@/public/wabi-black.svg';
import PageContainer from '@/components/layout/page-container';
import { toast } from '@/components/ui/use-toast';
import MenuImportForm from '@/components/signup/MenuImportForm';
import SubscriptionForm from '@/components/signup/SubscriptionForm';
import TeamMemberForm from '@/components/signup/TeamMemberForm';
import { useRouter } from 'next/navigation';
import ReactConfetti from 'react-confetti';
import { Loader2 } from 'lucide-react';
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

// Add type definitions for the validation payload
type ValidationPayload = {
  register: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  };
  set_business_profile: {
    extension: string;
    business_type: string;
    phone_no: string;
    address: string;
    business_name: string;
  };
  update_stripe_cc: {
    token: string;
  };
  attached_subscription: {
    admin_subscription_ids: number[];
    started_at: string;
    ends_at: string;
  };
  set_staffs?: {
    id: number;
    photo: string;
    first_name: string;
    last_name: string;
    address: string;
    mobile_no: string;
    emailAddress: string;
    date_hired: string;
    tax_no: string;
    bank_account: string;
    bank_name: string;
    quick_pin: string;
    system_pin: string;
    pin: string;
    pin_confirmation: string;
    color: string;
    role: string;
    roles: string[];
    employment_contract_id: number;
    employment_role_id: number;
    contract: string;
    level: number;
    pay_rates: Array<{
      day_number: number;
      rate: number;
    }>;
    pay_basis: number;
    pay_cycle: number;
    annual_salary: number;
    hourly_rate: number;
    hours_pay_cycle: number;
    pay_wages_item: Array<{
      title: string;
      price: number;
    }>;
    permissions: {
      home: number;
      pos_setting: number;
      team: number;
    };
  };
  set_shifts?: {
    shifts: Array<{
      id: number;
      name: string;
      start_time: number;
      end_time: number;
      day_of_week: number[];
      shift_color: string;
      floors: number[];
      turn_time: number;
    }>;
  };
  set_floors?: Array<{
    floor_name: string;
    tables: Array<{
      name: string;
      capacity_min: number;
      capacity_max: number;
      pos_x: number;
      pos_y: number;
      table_type: number;
      rotate_deg: number;
      can_rotate: boolean;
      widget_is_non_reservable: boolean;
      color: string;
    }>;
  }>;
  tax_setting_add?: {
    name: string;
    value: string;
  };
  categories?: Array<{
    name: string;
    color: string;
    products: Array<{
      title: string;
      price: number;
    }>;
  }>;
};

const validateSignUpData = async (formData: FormData, api: any) => {
  try {
    // Prepare the validation payload
    const payload: ValidationPayload = {
      register: {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name
      },
      set_business_profile: {
        extension: formData.businessProfile.extension,
        business_type: formData.businessProfile.business_type,
        phone_no: formData.businessProfile.phone_no,
        address: formData.businessProfile.address,
        business_name: formData.businessProfile.business_name
      },
      update_stripe_cc: {
        token: formData.cardToken || ''
      },
      attached_subscription: {
        admin_subscription_ids:
          formData.selectedSubscription?.map((val) => val.id) || [],
        started_at: new Date().toISOString().split('T')[0],
        ends_at: new Date(new Date().setMonth(new Date().getMonth() + 1))
          .toISOString()
          .split('T')[0]
      }
    };

    // Add staff members if they exist
    if (formData.teamMembers.length > 0) {
      const staffMember = formData.teamMembers[0]; // For now, just take the first team member
      payload.set_staffs = {
        id: 0,
        photo: '',
        first_name: staffMember.first_name,
        last_name: staffMember.last_name,
        address: '',
        mobile_no: staffMember.mobile_no || '',
        emailAddress: staffMember.email,
        date_hired: '',
        tax_no: '',
        bank_account: '',
        bank_name: '',
        quick_pin: staffMember.quick_pin,
        system_pin: staffMember.quick_pin,
        pin: staffMember.quick_pin,
        pin_confirmation: staffMember.quick_pin,
        color: '#cccccc',
        role: staffMember.role,
        roles: [],
        employment_contract_id: 0,
        employment_role_id: 0,
        contract: '',
        level: 1,
        pay_rates: [1, 2, 3, 4, 5, 6, 7].map((day) => ({
          day_number: day,
          rate: 0
        })),
        pay_basis: 0,
        pay_cycle: 0,
        annual_salary: 0,
        hourly_rate: 0,
        hours_pay_cycle: 0,
        pay_wages_item: [],
        permissions: {
          home: 0,
          pos_setting: 0,
          team: 0
        }
      };
    }

    // Add shifts if they exist
    if (formData.shifts.length > 0) {
      payload.set_shifts = {
        shifts: formData.shifts.map((shift) => ({
          ...shift,
          id: 0
        }))
      };
    }

    // Add floors and tables if they exist
    if (formData.floors.length > 0) {
      const floorsWithTables = formData.floors.map((floor) => {
        const floorTables = formData.tables.filter(
          (table) => table.floor_id === floor.id
        );
        return {
          floor_name: floor.floor_name,
          tables: floorTables.map((table) => ({
            name: table.name,
            capacity_min: table.capacity_min,
            capacity_max: table.capacity_max,
            pos_x: table.pos_x,
            pos_y: table.pos_y,
            table_type: table.table_type,
            rotate_deg: table.rotate_deg,
            can_rotate: true,
            widget_is_non_reservable: false,
            color: table.color || ''
          }))
        };
      });

      payload.set_floors = floorsWithTables;
    }

    // Add tax settings
    payload.tax_setting_add = {
      name: 'GST',
      value: '10'
    };

    // Add menu categories and products if they exist
    if (formData.menuData?.categories && formData.menuData?.products) {
      payload.categories = formData.menuData.categories.map(
        (category, index) => ({
          name: category.name,
          color: category.color,
          products: formData
            .menuData!.products.filter(
              (product) => product.category_id === index + 1
            )
            .map((product) => ({
              title: product.title,
              price: product.price
            }))
        })
      );
    }

    // Validate the data with the API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Validation failed');
    }

    return { isValid: true, payload };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'An error occurred during validation'
    };
  }
};

export default function SignUpPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, []);

  const router = useRouter();
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
  const api = useApi();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('signupFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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
    isFirstStep,
    isLastStep,
    isSecondLastStep,
    next,
    back
  } = useMultistepForm(getSteps());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check password length and email validation if we're on the first step
    if (currentStepIndex === steps.findIndex((step) => step.key === 'email')) {
      if (formData.password.length < 8) {
        toast({
          title: 'Invalid Password',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive'
        });
        return;
      }

      if (
        currentStepIndex === steps.findIndex((step) => step.key === 'email') &&
        !isEmailValid
      ) {
        toast({
          title: 'Invalid Email',
          description:
            'Please enter a valid email address that is not already registered',
          variant: 'destructive'
        });
        return;
      }
    }

    // Check if at least one shift is created in the ShiftsForm
    if (currentStepIndex === steps.findIndex((step) => step.key === 'shifts')) {
      if (formData.shifts.length === 0) {
        toast({
          title: 'Shifts Required',
          description: 'Please create at least one shift before continuing',
          variant: 'destructive'
        });
        return;
      }
    }

    // Check if at least one floor is created in the FloorsForm
    if (currentStepIndex === steps.findIndex((step) => step.key === 'floors')) {
      if (formData.floors.length === 0) {
        toast({
          title: 'Floors Required',
          description: 'Please create at least one floor before continuing',
          variant: 'destructive'
        });
        return;
      }
    }

    // Check if at least one table is created in the TableLayoutForm
    if (currentStepIndex === steps.findIndex((step) => step.key === 'tables')) {
      if (formData.tables.length === 0) {
        toast({
          title: 'Tables Required',
          description: 'Please create at least one table before continuing',
          variant: 'destructive'
        });
        return;
      }
    }

    if (!isLastStep) return next();

    setIsLoading(true);
    try {
      // Validate the data before making the actual API calls
      const validation = await validateSignUpData(formData, api);
      if (!validation?.isValid) {
        toast({
          title: 'Validation Error',
          description: validation?.error || 'Validation failed',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Verify account
      try {
        // Clear saved form data from localStorage
        localStorage.removeItem('signupFormData');

        // Show confetti
        setShowConfetti(true);

        toast({
          title: 'Account created and verified successfully',
          description: 'Redirecting to dashboard...',
          variant: 'success'
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          setShowConfetti(false);
          router.push('/');
        }, 3000);
      } catch (verificationError: any) {
        console.error('Verification error:', verificationError);
        const errorMessage =
          verificationError.response?.data?.message ||
          'Please try logging in to verify your account';
        toast({
          title: 'Account created but verification failed',
          description: errorMessage,
          className: 'bg-yellow-500 text-white'
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.message || 'Please try again later';
      toast({
        title: 'Error creating account',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer scrollable className="light min-h-screen bg-gray-50 pt-8">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={200}
        />
      )}
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
          {/* <h1 className="text-3xl font-bold text-primary">
            Create Your Account
          </h1> */}
          <p className="text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
          <Progress
            value={((currentStepIndex + 1) / steps.length) * 100}
            className="w-full max-w-md"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="relative mb-36">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {step}
              </motion.div>
            </AnimatePresence>
            {error && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="fixed bottom-0 left-0 mt-6  w-full  bg-white shadow-md">
              <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-4 md:h-28">
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={back}
                    className="w-40 gap-2 rounded-lg border border-primary bg-white py-2 text-center text-sm font-medium text-black transition-colors hover:bg-accent"
                    disabled={isLoading}
                  >
                    ← Back
                  </button>
                )}
                {!isLastStep && (
                  <Button
                    variant="submit"
                    type="submit"
                    disabled={
                      isLoading ||
                      (currentStepIndex ===
                        steps.findIndex(
                          (step) => step.key === 'subscription'
                        ) &&
                        (!Array.isArray(formData.selectedSubscription) ||
                          formData.selectedSubscription.length === 0))
                    }
                    className={`w-40 rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-50 ${
                      isFirstStep && 'absolute right-4'
                    }`}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Continue →
                  </Button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </PageContainer>
  );
}
