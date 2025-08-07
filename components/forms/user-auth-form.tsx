'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { toast } from '../ui/use-toast';
import { useEmployee } from '@/hooks/useEmployee';
import axios from 'axios';
import { useApi } from '@/hooks/useApi';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showNoServicesModal, setShowNoServicesModal] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const defaultValues = {
  // email: 'santonifunctions@gmail.com'
  // password: 'tonisabi007'
  // };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      const response = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: '/pin'
      });
      if (response?.error) {
        setErrorMessage(response.error);
      } else if (response?.url) {
        localStorage.setItem('LoggedIn', 'true');
        window.location.href = response.url;
      }
    } catch (error) {
      console.log('error', error);
      console.error('Sign in error:', error);
      setErrorMessage(error as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('no-services') === 'true') {
      setShowNoServicesModal(true);
    }
    if (searchParams.size === 1) {
      setErrorMessage('Credentials Incorrect');
    }
  }, []);
  if (
    session.data?.user?.token &&
    localStorage.getItem('LoggedIn') === 'true'
  ) {
    toast({
      title: 'Already logged In, redirecting..',
      variant: 'success'
    });
    localStorage.getItem('pinPreference') === 'true'
      ? router.push('/pin')
      : router.push('/dashboard');
  }

  return (
    <>
      <Dialog open={showNoServicesModal} onOpenChange={setShowNoServicesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Services Available</DialogTitle>
            <DialogDescription>
              You have no services available. Please contact our team for
              assistance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowNoServicesModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage} </p>
          )}

          <Button
            disabled={loading}
            className="ml-auto mt-8 w-full"
            type="submit"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Log in'}
          </Button>
        </form>
      </Form>
      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GoogleSignInButton /> */}
    </>
  );
}
