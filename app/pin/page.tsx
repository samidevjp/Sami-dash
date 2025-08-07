'use client';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEmployee } from '@/hooks/useEmployee';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { usePermissionsStore } from '@/hooks/usePermissionsStore';
import { useShiftsStore } from '@/hooks/useShiftsStore';
import { PermissionChecker } from '@/lib/permissionChecker';

export default function Page() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const {
    currentEmployee,
    setCurrentEmployee,
    clearCurrentEmployee,
    allEmployees,
    setAllEmployees
  } = useEmployee();
  const [loading, setLoading] = useState(true);
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);
  const { permissions, setPermissions } = usePermissionsStore();
  const { setShifts } = useShiftsStore();
  const [validatedEmployee, setValidatedEmployee] = useState<any>(null);
  const searchParams = useSearchParams();
  const [securityPinMode, setSecurityPinMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  useLayoutEffect(() => {
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);
  const logoSrc = isDarkMode ? '/WhiteLogo.png' : '/BlackLogo.png';
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (status === 'authenticated') {
        try {
          // Fetch employees
          if (allEmployees.length === 0) {
            const employeesResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}get_employees`,
              {},
              { headers: { Authorization: `Bearer ${session?.user?.token}` } }
            );
            setAllEmployees(employeesResponse.data.data.employees);

            // Fetch shifts
            const shiftsResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}get_shifts`,
              {},
              { headers: { Authorization: `Bearer ${session?.user?.token}` } }
            );
            setShifts(shiftsResponse.data.data.shifts);

            // Fetch business profile (for permissions)
            const businessProfileResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}get_business_profile`,
              {},
              { headers: { Authorization: `Bearer ${session?.user?.token}` } }
            );

            const rawPermissions =
              businessProfileResponse.data.data.business_profile.permissions;
            const permissionChecker = new PermissionChecker(rawPermissions);

            const processedPermissions = {
              mainNav: {
                reservations: permissionChecker.check(1 << 1, 'main_nav'),
                guestBook: permissionChecker.check(1 << 2, 'main_nav'),
                printerSettings: permissionChecker.check(1 << 3, 'main_nav'),
                tableLayout: permissionChecker.check(1 << 4, 'main_nav'),
                report: permissionChecker.check(1 << 5, 'main_nav'),
                team: permissionChecker.check(1 << 6, 'main_nav'),
                pos: permissionChecker.check(1 << 7, 'main_nav'),
                integrations: permissionChecker.check(1 << 8, 'main_nav'),
                inventory: permissionChecker.check(1 << 9, 'main_nav'),
                bump: permissionChecker.check(1 << 10, 'main_nav'),
                invoice: permissionChecker.check(1 << 11, 'main_nav'),
                messages: permissionChecker.check(1 << 12, 'main_nav'),
                online_store: permissionChecker.check(1 << 13, 'main_nav')
              },
              teams: {
                team: permissionChecker.check(1 << 1, 'team'),
                roster: permissionChecker.check(1 << 2, 'team'),
                timesheet: permissionChecker.check(1 << 3, 'team'),
                settings: permissionChecker.check(1 << 4, 'team')
              },
              pos: {
                docketView: permissionChecker.check(1 << 1, 'pos'),
                cashDrawer: permissionChecker.check(1 << 2, 'pos'),
                dayViewSales: permissionChecker.check(1 << 3, 'pos'),
                onAccount: permissionChecker.check(1 << 4, 'pos'),
                analytics: permissionChecker.check(1 << 5, 'pos'),
                registerSetting: permissionChecker.check(1 << 6, 'pos'),
                deletedItems: permissionChecker.check(1 << 7, 'pos'),
                posName: permissionChecker.check(1 << 8, 'pos'),
                surchargeSetting: permissionChecker.check(1 << 9, 'pos'),
                deviceInfo: permissionChecker.check(1 << 10, 'pos')
              }
            };
            setPermissions(processedPermissions);
          }

          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to load data. Please try again.');
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        router.push('/');
      }
    };

    fetchData();
  }, [status, session?.user?.token]);

  useEffect(() => {
    const securityMode = searchParams.get('security');
    if (securityMode) {
      setSecurityPinMode(true);
    }
  }, [searchParams]);

  const handleYesPinPreference = () => {
    setShowPinModal(false);
    localStorage.setItem('pinPreference', 'true');
    proceedToDashboard(validatedEmployee, searchParams.get('route') || '');
  };

  const handleNoPinPreference = async () => {
    setShowPinModal(false);
    localStorage.setItem('pinPreference', 'false');
    proceedToDashboard(validatedEmployee, searchParams.get('route') || '');
  };

  const handleNumberClick = (number: string) => {
    if (pin.length < 8) {
      setPin((prevPin) => prevPin + number);
    }
  };

  const handleDelete = () => {
    setPin((prevPin) => prevPin.slice(0, -1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (securityPinMode) {
      const employeeSecurity = allEmployees.find(
        (emp) => emp.system_pin === pin
      );
      if (
        !employeeSecurity ||
        (employeeSecurity.role !== 'owner' &&
          employeeSecurity.role !== 'manager')
      ) {
        setError('Invalid System PIN. Please try again.');
        setPin('');
        setLoading(false);
        return;
      }
      if (employeeSecurity) {
        const route = searchParams.get('route') || '/dashboard';
        router.push(route);
      } else {
        setError('Invalid System PIN. Please try again.');
        setPin('');
      }
    } else {
      const matchedEmployee = allEmployees.find((emp) => emp.quick_pin === pin);

      if (matchedEmployee) {
        setValidatedEmployee(matchedEmployee);
        setCurrentEmployee(matchedEmployee);
        localStorage.setItem(
          'currentEmployee',
          JSON.stringify(matchedEmployee)
        );
        const pinPreference = localStorage.getItem('pinPreference');
        if (
          pinPreference === null &&
          (matchedEmployee.role === 'owner' ||
            matchedEmployee.role === 'manager')
        ) {
          setShowPinModal(true);
        } else {
          proceedToDashboard(matchedEmployee, searchParams.get('route') || '');
        }
      } else {
        setLoading(false);
        setError('Invalid Quick PIN. Please try again.');
        clearCurrentEmployee();
        setPin('');
      }
    }

    setLoading(false);
  };

  const proceedToDashboard = async (employee: any, route: string) => {
    if (route) {
      router.push(`/${route}`);
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use PIN Code?</DialogTitle>
            <DialogDescription>
              Do you want to use a PIN code for future logins?
              <p>Note: Selecting No will always use the current account.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-center gap-8 md:gap-4">
              <Button onClick={handleYesPinPreference} className="w-20">
                Yes
              </Button>
              <Button onClick={handleNoPinPreference} className="w-20">
                No
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background ">
        <div className="mb-8">
          <Image
            width={400}
            height={400}
            className="h-full w-32 text-inherit"
            alt="logo"
            onClick={() => router.push('/')}
            src={logoSrc}
          />
        </div>
        {loading && <Loader2 className="animate-spin" />}

        {securityPinMode && (
          <p className="mb-4 text-center text-lg">Insert System PIN</p>
        )}

        <Input
          type="password"
          value={pin}
          className="mb-8 w-48 border-none text-center text-2xl text-tertiary-foreground"
          readOnly
        />

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <div className="mb-4 grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Button
              key={number}
              onClick={() => handleNumberClick(number.toString())}
              className="h-16 w-16 rounded-full bg-gray-customGrayDark text-2xl text-foreground shadow hover:opacity-80 "
            >
              {number}
            </Button>
          ))}
          <Button
            onClick={handleDelete}
            className="h-16 w-16 rounded-full bg-gray-customGrayDark  text-2xl text-foreground shadow hover:opacity-80"
          >
            ⌫
          </Button>
          <Button
            onClick={() => handleNumberClick('0')}
            className="h-16 w-16 rounded-full bg-gray-customGrayDark text-2xl text-foreground shadow hover:opacity-80"
          >
            0
          </Button>
          <Button
            onClick={handleSubmit}
            className={`h-16 w-16 rounded-full bg-gray-customGrayDark p-2 shadow`}
          >
            <Image src="/logoCircle.png" alt="login" width={140} height={140} />
          </Button>
        </div>
      </div>
    </>
  );
}
