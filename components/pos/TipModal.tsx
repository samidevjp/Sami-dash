import React, { useState } from 'react';
import { Dialog, DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  setTip: (tip: number) => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  setTip
}) => {
  const [tipValue, setTipValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericTip = parseFloat(tipValue);
    if (!isNaN(numericTip) && numericTip >= 0) {
      setTip(numericTip);
      onClose();
    } else {
      // You might want to show an error message here
      console.error('Invalid tip value');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay
        className="flex flex-col items-center justify-center bg-black/50 backdrop-blur-3xl"
        style={{ zIndex: 1000 }}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <h2 className="text-lg font-semibold">Add Tip</h2>
          <Input
            type="number"
            placeholder="Enter tip amount"
            value={tipValue}
            onChange={(e) => setTipValue(e.target.value)}
            min="0"
            step="0.01"
          />
          <div className="flex justify-between   gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Tip</Button>
          </div>
        </form>
      </DialogOverlay>
    </Dialog>
  );
};
