import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRelativeLuminance } from '@/utils/common';
const tailwindIconButton =
  'font-bold h-11 w-25 flex items-center justify-center rounded-lg text-black';
const SignupAddOnsSection = ({
  handleAddOnToggle,
  showAddOns,
  getAddOns,
  handleMouseDown,
  handleMouseUp,
  addOnType
}: {
  handleAddOnToggle: (type: number) => void;
  showAddOns: boolean;
  getAddOns: () => any;
  handleMouseDown: (addOn: any, type: string) => void;
  handleMouseUp: (addOn: any, type: string) => void;
  setOpenAllModsModal: (value: boolean) => void;
  addOnType: number;
}) => {
  return (
    <div className="add-ons-wrapper mt-auto flex flex-grow justify-between gap-2">
      <div className="w-24">
        <div className="flex flex-col gap-1">
          <Button
            className={`${tailwindIconButton} bg-secondary normal-case ${
              addOnType === 0 && showAddOns ? 'border border-primary' : ''
            }`}
            onClick={() => handleAddOnToggle(0)}
          >
            <Plus />
          </Button>
          <Button
            className={`${tailwindIconButton} bg-secondary normal-case ${
              addOnType === 1 && showAddOns ? 'border border-primary' : ''
            }`}
            onClick={() => handleAddOnToggle(1)}
          >
            <Minus />
          </Button>
        </div>
      </div>
      <div className="flex-1">
        {showAddOns && (
          <div className="flex  max-h-[90px] flex-wrap content-start justify-start gap-1 overflow-auto pb-1">
            {getAddOns().map((addOn: any) => (
              <Button
                key={addOn.id}
                style={{
                  backgroundColor: addOn.color || 'transparent',
                  color: getRelativeLuminance(addOn?.color || ''),
                  minWidth: '24%',
                  maxWidth: '24%'
                }}
                className="flex h-11 flex-col items-center justify-center rounded-lg border border-border px-1 text-xs leading-tight"
                onMouseDown={() => handleMouseDown(addOn, 'addOn')}
                onMouseUp={() => handleMouseUp(addOn, 'addOn')}
                onTouchStart={() => handleMouseDown(addOn, 'addOn')}
                onTouchEnd={() => handleMouseUp(addOn, 'addOn')}
              >
                {addOn.name}
                <span
                  className={`${addOn.color ? '' : 'text-primary'} text-[10px]`}
                >
                  {addOn.price > 0 ? `+ $${addOn.price}` : ''}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
SignupAddOnsSection.displayName = 'SignupAddOnsSection';
export default SignupAddOnsSection;
