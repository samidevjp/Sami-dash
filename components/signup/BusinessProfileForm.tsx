import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Building2, Phone, MapPin, AlertCircle } from 'lucide-react';
import FormLayout from './FormLayout';
import { Card } from '../ui/card';

type BusinessProfileFormProps = {
  businessProfile: {
    extension: string;
    business_type: string;
    phone_no: string;
    address: string;
    business_name: string;
  };
  updateFields: (
    fields: Partial<{
      businessProfile: BusinessProfileFormProps['businessProfile'];
    }>
  ) => void;
};

type FormErrors = {
  business_name?: string;
  phone_no?: string;
  address?: string;
};

export default function BusinessProfileForm({
  businessProfile,
  updateFields
}: BusinessProfileFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Don't format if less than 2 digits (country code)
    if (numbers.length < 2) return numbers;

    // Start building the formatted number
    let formatted = `(${numbers.slice(0, 2)}`;

    // Add the rest of the formatting based on length
    if (numbers.length > 2) {
      formatted += ') ';

      // Handle the next group (4 digits for 10-digit numbers, 3 digits for 9-digit numbers)
      const isLongFormat = numbers.length >= 10;
      const firstGroupLength = isLongFormat ? 4 : 3;
      formatted += numbers.slice(2, 2 + firstGroupLength);

      if (numbers.length > 2 + firstGroupLength) {
        formatted += ' ';
        formatted += numbers.slice(
          2 + firstGroupLength,
          2 + firstGroupLength + 3
        );

        if (numbers.length > 2 + firstGroupLength + 3) {
          formatted += ' ';
          formatted += numbers.slice(2 + firstGroupLength + 3);
        }
      }
    }

    return formatted;
  };

  const validateBusinessName = (name: string) => {
    if (!name.trim()) {
      return 'Business name is required';
    }
    if (name.trim().length < 2) {
      return 'Business name must be at least 2 characters long';
    }
    return '';
  };

  const validatePhoneNumber = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (!numbers) {
      return 'Phone number is required';
    }
    if (numbers.trim().length < 9 || numbers.trim().length > 12) {
      return 'Phone number must be 9 or 12 digits (excluding country code)';
    }
    return '';
  };

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      return 'Address is required';
    }
    if (address.trim().length < 5) {
      return 'Address must be at least 5 characters long';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;
    let error = '';

    // Format and validate based on field type
    switch (id) {
      case 'phone_no':
        formattedValue = formatPhoneNumber(value);
        error = validatePhoneNumber(formattedValue);
        break;
      case 'business_name':
        error = validateBusinessName(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
    }

    // Update the field value
    updateFields({
      businessProfile: { ...businessProfile, [id]: formattedValue }
    });

    // Update errors
    setErrors((prev) => ({
      ...prev,
      [id]: error
    }));
  };

  // Effect to validate all fields on initial load
  React.useEffect(() => {
    setErrors({
      business_name: validateBusinessName(businessProfile.business_name),
      phone_no: validatePhoneNumber(businessProfile.phone_no),
      address: validateAddress(businessProfile.address)
    });
  }, []);

  // Effect to disable continue button if there are errors
  React.useEffect(() => {
    const continueButton = document.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    if (continueButton) {
      const hasErrors = Object.values(errors).some((error) => error !== '');
      const hasEmptyFields =
        !businessProfile.business_name ||
        !businessProfile.phone_no ||
        !businessProfile.address;

      continueButton.disabled = hasErrors || hasEmptyFields;
      continueButton.title = hasErrors
        ? 'Please fix all errors before continuing'
        : hasEmptyFields
        ? 'Please fill in all required fields'
        : '';
    }
  }, [errors, businessProfile]);

  return (
    <FormLayout
      title="Business Details"
      description="Tell us about your business to help us customize your experience."
      fullWidth
    >
      <Card className="p-8">
        <div className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name" className="text-sm font-medium">
                Business Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  id="business_name"
                  value={businessProfile.business_name}
                  onChange={handleChange}
                  className={`h-12 bg-white pl-10 placeholder:text-gray-400 ${
                    errors.business_name ? 'border-danger' : ''
                  }`}
                  placeholder="Your Business Name"
                  required
                />
              </div>
              {errors.business_name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-danger"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.business_name}
                </motion.p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_no" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    type="tel"
                    id="phone_no"
                    value={businessProfile.phone_no}
                    onChange={handleChange}
                    className={`h-12 bg-white pl-10 placeholder:text-gray-400 ${
                      errors.phone_no ? 'border-danger' : ''
                    }`}
                    placeholder="(61) 0000 000 000"
                    required
                  />
                </div>
                {errors.phone_no && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-danger"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone_no}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Business Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  id="address"
                  value={businessProfile.address}
                  onChange={handleChange}
                  className={`h-12 bg-white pl-10 placeholder:text-gray-400 ${
                    errors.address ? 'border-danger' : ''
                  }`}
                  placeholder="123 Business Street, City, State"
                  required
                />
              </div>
              {errors.address && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-danger"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.address}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </FormLayout>
  );
}
