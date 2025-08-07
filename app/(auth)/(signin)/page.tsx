import { Metadata } from 'next';
import Link from 'next/link';
import UserAuthForm from '@/components/forms/user-auth-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from './logo';

export const metadata: Metadata = {
  title: 'Wabi',
  description: 'Wabi Login Page.',
  keywords:
    'Wabi, Company, Management, Business Management, Business, Management, Company Management, Wabi Company Management, Wabi Business Management, Wabi Management, Wabi Company, Wabi Business, Wabi Login, Wabi Login Page'
};

export default function AuthenticationPage() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-no-repeat" />
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Wabi changed the way we manage our business.&rdquo;
            </p>
            <footer className="text-sm">Bruno</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="relative -top-24 z-20 flex items-center justify-center text-lg font-medium">
            <Logo />
          </div>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to log in your account
            </p>
          </div>
          <UserAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking Log in, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <div className="text-center">
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
