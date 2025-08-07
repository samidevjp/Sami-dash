import React from 'react';
import { Button } from '../ui/button';
import { CreditCard, SplitSquareVertical } from 'lucide-react';

interface SplitTypeSelectorProps {
  onSelectSplitType: (type: 'bill' | 'item') => void;
}

const SplitTypeSelector: React.FC<SplitTypeSelectorProps> = ({
  onSelectSplitType
}) => {
  return (
    <div className="flex justify-center space-x-4">
      <Button
        className="flex h-24 w-40 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]"
        onClick={() => onSelectSplitType('bill')}
      >
        <SplitSquareVertical size={24} />
        <span>Split Bill</span>
      </Button>
      <Button
        className="flex h-24 w-40 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-[#3F59E4]"
        onClick={() => onSelectSplitType('item')}
      >
        <SplitSquareVertical size={24} />
        <span>Split By Item</span>
      </Button>
    </div>
  );
};

export default SplitTypeSelector;
