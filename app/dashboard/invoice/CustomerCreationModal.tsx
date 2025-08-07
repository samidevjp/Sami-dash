'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface CustomerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  newCustomerEmail: string;
  setNewCustomerEmail: (email: string) => void;
  newCustomerDescription: string;
  setNewCustomerDescription: (description: string) => void;
  handleCreateCustomer: () => void;
  customers: any[];
}

export const CustomerCreationModal: React.FC<CustomerCreationModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  newCustomerEmail,
  setNewCustomerEmail,
  newCustomerDescription,
  setNewCustomerDescription,
  handleCreateCustomer,
  customers
}) => {
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const isDuplicate = customers.some(
      (c) => c?.email?.toLowerCase() === newCustomerEmail.toLowerCase()
    );
    if (isDuplicate) {
      setEmailError('This email is already registered.');
    } else {
      setEmailError('');
    }
  }, [newCustomerEmail, customers]);

  return (
    <Modal
      description="Create a new customer to add to the invoice or subscription."
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer"
    >
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Customer Email"
            type="email"
            value={newCustomerEmail}
            onChange={(e) => setNewCustomerEmail(e.target.value)}
            disabled={isLoading}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>

        <Input
          placeholder="Customer Description"
          type="text"
          value={newCustomerDescription}
          onChange={(e) => setNewCustomerDescription(e.target.value)}
          disabled={isLoading}
        />
        <Button
          onClick={handleCreateCustomer}
          disabled={isLoading || !newCustomerEmail || !!emailError}
        >
          {isLoading ? 'Creating...' : 'Create Customer'}
        </Button>
      </div>
    </Modal>
  );
};
