import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WeightInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  product: any;
}

export const WeightInputModal: React.FC<WeightInputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product
}) => {
  const [weight, setWeight] = useState('');

  const handleConfirm = () => {
    const weightValue = parseFloat(weight);
    if (!isNaN(weightValue) && weightValue > 0) {
      onConfirm(weightValue);
      setWeight('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const getMeasurementUnit = () => {
    if (!product?.measurement_type) return 'g';

    const kg = 1;
    const g = 2;
    const oz = 3;
    const lb = 4;

    switch (product.measurement_type) {
      case kg:
        return 'kg';
      case g:
        return 'g';
      case oz:
        return 'oz';
      case lb:
        return 'lb';
      default:
        return 'g';
    }
  };

  const getMeasurementLabel = () => {
    const unit = getMeasurementUnit();
    switch (unit) {
      case 'kg':
        return 'Kilogram';
      case 'g':
        return 'Gram';
      case 'oz':
        return 'Ounce';
      case 'lb':
        return 'Pound';
      default:
        return 'Gram';
    }
  };

  const calculatePrice = (weightValue: number) => {
    if (!product || !weightValue) return 0;
    const baseWeight = product.based_weight || 100; // Default to 100g if not set
    const basePrice = product.price || 0;
    return (weightValue / baseWeight) * basePrice;
  };

  return (
    <Modal
      title="Confirm"
      description={`Please enter weight by ${getMeasurementLabel()} for ${
        product?.title || 'this product'
      }`}
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="number"
            placeholder={`Enter weight (${getMeasurementUnit()})`}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyPress={handleKeyPress}
            min="0"
            step="0.1"
            className="text-center text-lg"
            autoFocus
          />
          {weight && !isNaN(parseFloat(weight)) && (
            <div className="text-center text-sm text-muted-foreground">
              Weight: {parseFloat(weight).toFixed(1)} {getMeasurementUnit()} |
              Price: ${calculatePrice(parseFloat(weight)).toFixed(2)}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleConfirm}
            disabled={
              !weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0
            }
            className="w-full"
          >
            Confirm
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
