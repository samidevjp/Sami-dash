'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ProductCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  showInvoiceForm: boolean;
  newProductName: string;
  setNewProductName: (name: string) => void;
  newProductPrice: string;
  setNewProductPrice: (price: string) => void;
  recurringInterval: string;
  setRecurringInterval: (interval: string) => void;
  handleCreateProduct: () => void;
}

export const ProductCreationModal: React.FC<ProductCreationModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  showInvoiceForm,
  newProductName,
  setNewProductName,
  newProductPrice,
  setNewProductPrice,
  recurringInterval,
  setRecurringInterval,
  handleCreateProduct
}) => {
  return (
    <Modal
      isOpen={isOpen}
      description={
        showInvoiceForm
          ? 'Create a new product to add to the invoice.'
          : 'Create a new subscription plan.'
      }
      onClose={onClose}
      title={
        showInvoiceForm ? 'Create New Product' : 'Create Subscription Plan'
      }
    >
      <div className="space-y-4">
        <Input
          placeholder="Product Name"
          type="text"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          disabled={isLoading}
        />
        <Input
          placeholder="Price"
          type="number"
          value={newProductPrice}
          onChange={(e) => setNewProductPrice(e.target.value)}
          disabled={isLoading}
        />
        {!showInvoiceForm && (
          <Input
            placeholder="Recurring Interval (e.g., month, year)"
            type="text"
            value={recurringInterval}
            onChange={(e) => setRecurringInterval(e.target.value)}
            disabled={isLoading}
          />
        )}
        <Button
          onClick={handleCreateProduct}
          disabled={
            isLoading ||
            !newProductName ||
            !newProductPrice ||
            (!showInvoiceForm && !recurringInterval)
          }
        >
          {isLoading
            ? 'Creating...'
            : showInvoiceForm
            ? 'Create Product'
            : 'Create Plan'}
        </Button>
      </div>
    </Modal>
  );
};
