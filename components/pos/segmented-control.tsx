import React, { useState } from 'react';
import { Bell, CalendarRange, LayoutGrid, ScrollText } from 'lucide-react';

interface SegmentedControlProps {
  selectedSegment: (option: string) => void;
}

const options = [
  {
    id: '1',
    Icon: ScrollText,
    className: 'rotate-180',
    style: { transform: 'scale(-1, 1)' }
  },
  { id: '2', Icon: CalendarRange },
  { id: '3', Icon: LayoutGrid },
  { id: '4', Icon: Bell }
];

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  selectedSegment
}) => {
  const [selectedOption, setSelectedOption] = useState('1');

  const handleChange = (value: string) => {
    setSelectedOption(value);
    selectedSegment(value);
  };

  return (
    <div className="segmented-control relative flex h-12 w-full rounded-lg border border-border bg-secondary">
      {options.map(({ id, Icon, className = '', style = {} }) => (
        <div className="flex-1" key={id}>
          <input
            id={`rad${id}`}
            type="radio"
            name="radioBtn"
            value={id}
            hidden
            checked={selectedOption === id}
            onChange={() => handleChange(id)}
          />
          <label
            htmlFor={`rad${id}`}
            className="flex h-full cursor-pointer items-center justify-center"
          >
            <Icon
              size={22}
              className={`${
                selectedOption === id ? 'opacity-100' : 'opacity-50'
              } transition-opacity ${className}`}
              style={style}
            />
          </label>
        </div>
      ))}
    </div>
  );
};

export default SegmentedControl;
