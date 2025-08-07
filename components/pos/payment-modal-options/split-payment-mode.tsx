import { Receipt, Package } from 'lucide-react';
import { Button } from '../../ui/button';
import { PaymentOptionMode } from '@/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../ui/dialog';
import { Input } from '../../ui/input';

interface SplitPaymentModeProps {
  splitStep: 'select-type' | 'select-number' | 'select-split';
  setSplitStep: (
    step: 'select-type' | 'select-number' | 'select-split'
  ) => void;
  splitType: 'bill' | 'item' | null;
  setSplitType: (type: 'bill' | 'item' | null) => void;
  numberOfSplits: number;
  setNumberOfSplits: (number: number) => void;
  handleSplitTypeSelection: (type: 'bill' | 'item') => void;
  handleNumberOfSplitsSelection: (number: number) => void;
  setOptionMode: (mode: PaymentOptionMode) => void;
}

const SplitPaymentMode = ({
  splitStep,
  setSplitStep,
  splitType,
  setSplitType,
  numberOfSplits,
  setNumberOfSplits,
  handleSplitTypeSelection,
  handleNumberOfSplitsSelection,
  setOptionMode
}: SplitPaymentModeProps) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customNumber, setCustomNumber] = useState('');

  const handleCustomSubmit = () => {
    const number = parseInt(customNumber);
    if (number >= 2 && number <= 20) {
      handleNumberOfSplitsSelection(number);
      setShowCustomModal(false);
      setCustomNumber('');
    }
  };

  const handleCustomModalClose = () => {
    setShowCustomModal(false);
    setCustomNumber('');
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mb-6 w-full">
        <div className="mb-4 text-center text-xl font-semibold text-white">
          Split Payment
        </div>

        {/* Step 1: Split Type Selection */}
        {splitStep === 'select-type' && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleSplitTypeSelection('bill')}
              className="flex h-20 flex-col items-center justify-center gap-2 bg-[#1F2122] text-white hover:bg-primary"
              variant="outline"
            >
              <Receipt className="h-6 w-6" />
              <span className="font-semibold">Split Bill</span>
            </Button>
            <Button
              onClick={() => handleSplitTypeSelection('item')}
              className="flex h-20 flex-col items-center justify-center gap-2 bg-[#1F2122] text-white hover:bg-primary"
              variant="outline"
            >
              <Package className="h-6 w-6" />
              <span className="font-semibold">Split Item</span>
            </Button>
          </div>
        )}

        {/* Step 2: Number of Splits Selection */}
        {splitStep === 'select-number' && (
          <div className="mb-6">
            <div className="mb-3 text-center text-lg text-white">
              How many ways to split?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4, 5, 6].map((number) => (
                <Button
                  key={number}
                  onClick={() => handleNumberOfSplitsSelection(number)}
                  className="h-12 bg-[#1F2122] text-white hover:bg-primary"
                  variant="outline"
                >
                  {number}
                </Button>
              ))}
              <Button
                onClick={() => setShowCustomModal(true)}
                className="h-12 bg-[#1F2122] text-white hover:bg-primary"
                variant="outline"
              >
                Other
              </Button>
            </div>
          </div>
        )}

        {/* Back Button */}
        {/* <Button
          onClick={() => {
            if (splitStep === 'select-number') {
              setSplitStep('select-type');
            } else if (splitStep === 'select-split') {
              setSplitStep('select-number');
            } else {
              setOptionMode('default');
            }
          }}
          className="w-full bg-gray-600 text-white hover:bg-gray-700"
        >
          {splitStep === 'select-type' ? 'Back to Payment Options' : 'Back'}
        </Button> */}
      </div>

      {/* Custom Number Modal */}
      <Dialog open={showCustomModal} onOpenChange={handleCustomModalClose}>
        <DialogContent className="border-gray-600 bg-[#2A2D2E]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Custom Split Number
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Number of splits (2-20)
              </label>
              <Input
                type="number"
                min="2"
                max="20"
                value={customNumber}
                onChange={(e) => setCustomNumber(e.target.value)}
                placeholder="Enter number of splits"
                className="border-gray-600 bg-[#1F2122] text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomSubmit();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCustomModalClose}
                variant="outline"
                className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomSubmit}
                disabled={
                  !customNumber ||
                  parseInt(customNumber) < 2 ||
                  parseInt(customNumber) > 20
                }
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SplitPaymentMode;
