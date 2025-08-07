import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailIcon, Lock, Loader2 } from 'lucide-react';
import FormLayout from './FormLayout';
import { Card } from '../ui/card';
import axios from 'axios';
import { useDebounce } from '@/hooks/useDebounce';

type EmailPasswordFormProps = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  updateFields: (
    fields: Partial<{
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }>
  ) => void;
  onEmailValidation: (isValid: boolean) => void;
};

export default function EmailPasswordForm({
  email,
  password,
  first_name,
  last_name,
  updateFields,
  onEmailValidation
}: EmailPasswordFormProps) {
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const debouncedEmail = useDebounce(email, 500);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    updateFields({ password: newPassword });

    if (newPassword.length > 0 && newPassword.length < 8) {
      console.log('Password too short1111');

      setPasswordError('Password must be at least 8 characters long');
    } else {
      setPasswordError('');
    }
  };

  // Validate email when it changes (debounced)
  React.useEffect(() => {
    const validateEmail = async () => {
      if (!debouncedEmail || !debouncedEmail.includes('@')) {
        setEmailError('');
        onEmailValidation(false);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}user/validate-email`,
          { email: debouncedEmail }
        );

        if (response.data.status_code === 412) {
          setEmailError('This email is already registered');
          onEmailValidation(false);
        } else {
          setEmailError('');
          onEmailValidation(true);
        }
      } catch (error) {
        console.error('Email validation error:', error);
        setEmailError(
          // @ts-ignore
          error?.response?.data.message || 'Error checking email availability'
        );
        onEmailValidation(false);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    validateEmail();
  }, [debouncedEmail, onEmailValidation]);

  return (
    <FormLayout
      title="Account Details"
      description="Please enter your account details"
      fullWidth
    >
      <Card className="space-y-4 p-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-medium">
              First Name
            </Label>
            <Input
              type="text"
              id="first_name"
              value={first_name}
              onChange={(e) => updateFields({ first_name: e.target.value })}
              className="h-12 placeholder:text-gray-400"
              placeholder="John"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium">
              Last Name
            </Label>
            <Input
              type="text"
              id="last_name"
              value={last_name}
              onChange={(e) => updateFields({ last_name: e.target.value })}
              className="h-12 placeholder:text-gray-400"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <MailIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => updateFields({ email: e.target.value })}
              className={`h-12 pl-10 placeholder:text-gray-400 ${
                emailError ? 'border-red-500' : ''
              }`}
              placeholder="john@example.com"
              required
            />
            {isCheckingEmail && (
              <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
          {emailError && (
            <p className="mt-1 text-sm text-destructive">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="h-12 pl-10 placeholder:text-gray-400"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          {passwordError && (
            <p className="mt-1 text-sm text-destructive">{passwordError}</p>
          )}
        </div>
      </Card>
    </FormLayout>
  );
}
