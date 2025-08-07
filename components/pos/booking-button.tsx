import {
  Check,
  DoorOpen,
  NotebookText,
  Phone,
  Plus,
  Tickets,
  Waypoints
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '../ui/button';

interface BookingButtonProps {
  icon?: any;
  titleName?: string;
  propIsSelected?: boolean;
  height?: number;
  buttonOnly?: boolean;
  alwaysSelected?: boolean;
  canSelect?: boolean;
  value?: any;
  clickHandler?: any;
  isSelectedHandler?: any;
  isDisabled?: boolean;
}

const BookingButton: React.FC<BookingButtonProps> = ({
  icon,
  titleName,
  propIsSelected = false,
  height,
  buttonOnly = false,
  alwaysSelected,
  canSelect = true,
  value,
  clickHandler,
  isSelectedHandler,
  isDisabled = false
}) => {
  const [isSelected, setIsSelected] = useState(propIsSelected ?? false);

  const buttonClicked = () => {
    if (canSelect) {
      setIsSelected(!isSelected);
    }
    if (buttonOnly) {
      if (!canSelect) {
        clickHandler(value);
      } else {
        isSelectedHandler(!isSelected);
      }
    } else {
      isSelectedHandler(!isSelected);
    }
  };

  return (
    <Button
      onClick={buttonClicked}
      style={{
        height: height ? height : 'auto'
      }}
      className={`booking-button text-forground flex cursor-pointer select-none items-center justify-center rounded-lg border bg-secondary px-4 py-2 text-sm transition-all hover:opacity-60
        ${
          !buttonOnly
            ? propIsSelected
              ? 'border border-primary bg-tertiary'
              : ''
            : alwaysSelected
            ? 'booking-button--selected max-w-14'
            : propIsSelected
            ? 'max-w-14 border border-primary bg-tertiary'
            : 'max-w-14'
        } ${isDisabled ? 'pointer-events-none bg-gray opacity-60' : ''}
      `}
    >
      {typeof icon === 'string' && icon === 'note' ? (
        <NotebookText size={16} />
      ) : icon === 'check' ? (
        <Check size={16} />
      ) : icon === 'plus' ? (
        <Plus size={16} />
      ) : icon === 'phone' ? (
        <Phone size={16} />
      ) : icon === 'walkin' ? (
        <DoorOpen size={16} />
      ) : icon === 'network' ? (
        <Waypoints size={16} />
      ) : icon === 'experience' ? (
        <Tickets size={16} />
      ) : (
        icon && (
          <Image
            src={icon}
            width={24}
            height="24"
            style={
              buttonOnly
                ? {
                    textAlign: 'center',
                    margin: '5px 0'
                  }
                : { marginTop: 16, marginLeft: 22 }
            }
            alt="checker"
          />
        )
      )}
      {titleName && (
        <label
          className="cursor-pointer"
          style={buttonOnly ? { margin: '5px 0', cursor: 'pointer' } : {}}
        >
          {titleName}
        </label>
      )}
    </Button>
  );
};

export default BookingButton;
