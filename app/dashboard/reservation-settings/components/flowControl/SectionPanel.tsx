import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import moment from 'moment';
interface TimeItem {
  id: number;
  time: number;
  covers: number | null;
  created_at: string;
  updated_at: string;
}
interface Sections {
  id: number;
  floor_id: number;
  floor_name: string;
  booking_interval: number;
  status: boolean;
  time_items?: TimeItem[];
}
interface SectionPanelProps {
  sections: Sections[];
  setSections: (sections: Sections[]) => void;
  updateSectionsWithInterval: (sections: Sections[]) => void;
}
const SectionPanel: React.FC<SectionPanelProps> = ({
  sections,
  setSections,
  updateSectionsWithInterval
}) => {
  const [dropdownOpenStates, setDropdownOpenStates] = useState<boolean[]>(
    sections.map(() => false)
  );
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const handleBookingIntervalChange = (sectionIndex: number, value: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].booking_interval = value * 60;
    updateSectionsWithInterval(updatedSections);
    setDropdownOpenStates(sections.map(() => false));
  };
  const handleGuestChange = (
    sectionIndex: number,
    itemIndex: number,
    value: number
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].time_items![itemIndex].covers = value;
    setSections(updatedSections);
  };

  const handleSwitchChange = (index: number) => {
    const updatedSections = sections.map((section, i) =>
      i === index ? { ...section, status: !section.status } : section
    );
    setSections(updatedSections);
  };
  const handleDropdownToggle = (index: number, isOpen: boolean) => {
    const updatedDropdownStates = [...dropdownOpenStates];
    updatedDropdownStates[index] = isOpen;
    setDropdownOpenStates(updatedDropdownStates);
  };
  const handleScroll = (index: number, direction: 'left' | 'right') => {
    const scrollContainer = scrollContainerRefs.current[index];
    if (scrollContainer) {
      const scrollAmount = 200;
      scrollContainer.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  return (
    <div className="space-y-6">
      <p className="">
        Select what sections you would like open or closed for this service -
        leaving sections empty will be considered open.
      </p>
      {sections.map((section, index) => (
        <div key={section.id} className="rounded-lg border-b p-8">
          <div className="mb-8">
            <Label className="flex items-center gap-4">
              <p className="text-lg">{section.floor_name}</p>
              <Switch
                checked={section.status}
                onCheckedChange={() => handleSwitchChange(index)}
              />
            </Label>
          </div>
          <div className="relative">
            <Button
              variant={'secondary'}
              className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-secondary px-3"
              onClick={() => handleScroll(index, 'left')}
            >
              &lt;
            </Button>
            <div
              ref={(el) => (scrollContainerRefs.current[index] = el)}
              className="no-scrollbar mb-4 overflow-x-auto px-8 pb-4"
              style={{ scrollbarColor: 'transparent transparent' }}
            >
              <div className="mx-4 flex gap-6">
                {section.time_items?.map((item, itemIndex) => (
                  <div key={item.id} className="flex flex-col">
                    <p className="mb-2">
                      {moment()
                        .startOf('day')
                        .seconds(item.time)
                        .format('HH:mm')}
                    </p>
                    <Label>
                      <p className="mb-1 text-xs ">Cover</p>
                      <Input
                        type="number"
                        value={item.covers || ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const sanitizedValue = inputValue.replace(
                            /^0+(?=\d)/,
                            ''
                          );
                          handleGuestChange(
                            index,
                            itemIndex,
                            Number(sanitizedValue)
                          );
                        }}
                        className="w-20 text-center"
                      />
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant={'secondary'}
              className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-secondary px-3"
              onClick={() => handleScroll(index, 'right')}
            >
              &gt;
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <p className="">Booking Interval Time</p>
            <DropdownMenu
              open={dropdownOpenStates[index]}
              onOpenChange={(isOpen) => handleDropdownToggle(index, isOpen)}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant={'outline'}
                  className="btn btn-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {section.booking_interval / 60} minutes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBookingIntervalChange(index, 15);
                  }}
                >
                  15 minutes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBookingIntervalChange(index, 30);
                  }}
                >
                  30 minutes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBookingIntervalChange(index, 45);
                  }}
                >
                  45 minutes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBookingIntervalChange(index, 60);
                  }}
                >
                  60 minutes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};
export default SectionPanel;
