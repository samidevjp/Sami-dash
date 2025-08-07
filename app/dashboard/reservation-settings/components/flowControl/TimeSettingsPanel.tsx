import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SquarePlus, EllipsisVertical } from 'lucide-react';
import moment from 'moment';
import { now } from 'lodash';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
interface TimeSettingsPanelProps {
  serviceStartTime: number;
  bookingEndTime: number;
  bookingDuration: number;
  setBookingDuration: React.Dispatch<React.SetStateAction<number>>;
  isEnableCustomTurnTimes: boolean;
  setIsEnableCustomTurnTimes: React.Dispatch<React.SetStateAction<boolean>>;
  customeTurnTimes: any[];
  setCustomeTurnTimes: React.Dispatch<React.SetStateAction<any[]>>;
  allowableDaysBooking: string;
  setAllowableDaysBooking: React.Dispatch<React.SetStateAction<string>>;
  isWaitlistEnabled: boolean;
  setIsWaitlistEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  weitlistCapacity: string;
  setWeitlistCapacity: React.Dispatch<React.SetStateAction<string>>;
  isChooseSection: boolean;
  setIsChooseSection: React.Dispatch<React.SetStateAction<boolean>>;
  setCreateTurnTimeData: React.Dispatch<React.SetStateAction<any[]>>;
  handleStartTimeChange: (time: string) => void;
  handleEndTimeChange: (time: string) => void;
}
const TimeSettingsPanel: React.FC<TimeSettingsPanelProps> = ({
  serviceStartTime,
  bookingEndTime,
  bookingDuration,
  setBookingDuration,
  isEnableCustomTurnTimes,
  setIsEnableCustomTurnTimes,
  customeTurnTimes,
  setCustomeTurnTimes,
  allowableDaysBooking,
  setAllowableDaysBooking,
  isWaitlistEnabled,
  setIsWaitlistEnabled,
  weitlistCapacity,
  setWeitlistCapacity,
  isChooseSection,
  setIsChooseSection,
  setCreateTurnTimeData,
  handleStartTimeChange,
  handleEndTimeChange
}) => {
  const [isOptionDropdownOpen, setIsOptionDropdownOpen] = React.useState(false);
  const [isDaysOptionDropdownOpen, setIsDaysOptionDropdownOpen] =
    useState(false);
  const [partySizeInput, setPartySizeInput] = useState<number>(2);
  const [turnTimeInput, setTurnTimeInput] = useState<number>(10);
  const [selectedTurnTime, setSelectedTurnTime] = useState<any>({});
  const [moreModalOpen, setMoreModalOpen] = useState<boolean>(false);
  const [createTurnTimeModalOpen, setCreateTurnTimeModalOpen] =
    useState<boolean>(false);
  const [serviceStartTimeFormatted, setServiceStartTimeFormatted] =
    useState('00:00');
  const [bookingEndTimeFormatted, setBookingEndTimeFormatted] =
    useState('00:00');
  const [bookingDurationFormatted, setBookingDurationFormatted] = useState('');
  const handleMinutesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10) || 0;
    setTurnTimeInput(minutes * 60);
  };

  // :::::::::: Service start time :::::::::::
  useEffect(() => {
    setServiceStartTimeFormatted(
      moment.utc(serviceStartTime * 1000).format('HH:mm')
    );
  }, [serviceStartTime]);
  // :::::::::: Booking end time :::::::::::
  useEffect(() => {
    setBookingEndTimeFormatted(
      moment.utc(bookingEndTime * 1000).format('HH:mm')
    );
  }, [bookingEndTime]);
  // ::::::::::  Booking duration :::::::::::
  useEffect(() => {
    const hours = Math.floor(bookingDuration / 3600);
    const minutes = Math.floor((bookingDuration % 3600) / 60);
    setBookingDurationFormatted(`${hours}h ${minutes}m`);
  }, [bookingDuration]);
  const handleDurationChange = (time: string) => {
    const momentTime = moment(time, 'HH:mm');
    const seconds = momentTime.hours() * 3600 + momentTime.minutes() * 60;
    setBookingDuration(seconds);
  };
  // :::::::::: Custom Turn Times :::::::::::
  const handleMoreModalOpen = (item: any) => {
    setSelectedTurnTime(item);
    setPartySizeInput(item.covers);
    setTurnTimeInput(item.time);
    setMoreModalOpen(true);
  };
  const handleCreateTurnTime = () => {
    if (selectedTurnTime && selectedTurnTime.id) {
      const updatedTurnTime = {
        ...selectedTurnTime,
        covers: partySizeInput,
        time: turnTimeInput
      };
      setCustomeTurnTimes((prev) =>
        prev.map((item) =>
          item.id === updatedTurnTime.id ? updatedTurnTime : item
        )
      );
      setCreateTurnTimeData((prev) => {
        const updated = prev.map((item) =>
          item.id === updatedTurnTime.id ? updatedTurnTime : item
        );
        const exists = prev.some((item) => item.id === updatedTurnTime.id);
        return exists ? updated : [...updated, updatedTurnTime];
      });
      setMoreModalOpen(false);
    } else {
      const newTurnTime = {
        id: now(),
        covers: partySizeInput,
        time: turnTimeInput,
        is_new: true
      };
      setCustomeTurnTimes((prev) => [...prev, newTurnTime]);
      setCreateTurnTimeData((prev) => [...prev, newTurnTime]);
      setMoreModalOpen(false);
    }
    setSelectedTurnTime({});
    setCreateTurnTimeModalOpen(false);
  };
  const handleDeleteTurnTime = (id: number) => {
    console.log('id', id);
    setCustomeTurnTimes((prev) => prev.filter((item) => item.id !== id));
    setCreateTurnTimeData((prev) => prev.filter((item) => item.id !== id));
    setMoreModalOpen(false);
  };
  useEffect(() => {
    console.log('selectedTurnTime', selectedTurnTime);
  }, [selectedTurnTime]);
  return (
    <div className="space-y-6">
      {/* Set Time */}
      <div>
        <p className="">Set Time</p>
        <p className="mb-2 text-sm">Service start time to last booking time</p>
        <div className="flex items-center space-x-4">
          <Input
            type="time"
            value={serviceStartTimeFormatted}
            onChange={(e) => handleStartTimeChange(e.target.value)}
          />
          <span className="">→</span>
          <Input
            type="time"
            value={bookingEndTimeFormatted}
            onChange={(e) => handleEndTimeChange(e.target.value)}
          />
        </div>
      </div>
      {/* Booking Duration */}
      <div>
        <div>
          <p className="mb-2">
            Default Booking Duration for Online Booking Size
          </p>
          <DropdownMenu
            open={isOptionDropdownOpen}
            onOpenChange={setIsOptionDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant={'outline'}
                className="w-40"
                onClick={(e) => e.stopPropagation()}
              >
                {bookingDurationFormatted}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {Array.from({ length: 9 }, (_, index) => {
                const hours = 2 + Math.floor((index * 15) / 60);
                const minutes = (index * 15) % 60;
                const label = `${hours}h${
                  minutes === 0 ? '' : `${minutes}min`
                }`;
                return (
                  <DropdownMenuItem
                    key={label}
                    onSelect={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDurationChange(
                        `${hours}:${minutes.toString().padStart(2, '0')}`
                      );
                      setIsOptionDropdownOpen(false);
                    }}
                  >
                    {label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Enable Custom Turn Times */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="">Enable Custom Turn Times</p>
          <Switch
            checked={isEnableCustomTurnTimes}
            onCheckedChange={(checked) => setIsEnableCustomTurnTimes(checked)}
          />
        </div>
        <Button
          variant={'ghost'}
          className="p-1"
          onClick={() => setCreateTurnTimeModalOpen(true)}
          disabled={!isEnableCustomTurnTimes}
        >
          <SquarePlus
            className={`h-8 w-8 ${
              isEnableCustomTurnTimes ? 'text-primary' : 'text-gray-500'
            }`}
          />
        </Button>
      </div>
      {/* Custom Turn Times */}
      {isEnableCustomTurnTimes && (
        <div className="flex space-x-2">
          {customeTurnTimes && customeTurnTimes.length > 0 ? (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
              }}
            >
              {customeTurnTimes.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-4"
                >
                  <Label className="flex w-full cursor-pointer items-center justify-between">
                    <div className="">
                      <p className="mb-1">Party Size: {item.covers}</p>
                      <p className="text-sm ">
                        Turn Time: {Math.floor(item.time / 3600)}h{' '}
                        {Math.floor((item.time % 3600) / 60)}min
                      </p>
                    </div>
                  </Label>
                  <Button
                    className="p-2"
                    variant={'ghost'}
                    onClick={() => handleMoreModalOpen(item)}
                  >
                    <EllipsisVertical size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="">No custom turn time</p>
          )}
        </div>
      )}
      {/* Days Allowed for Online Bookings */}
      <div>
        <p className="mb-2">
          How many days in the future will you allow online bookings
        </p>
        <p className="mb-2 text-sm">
          Leaving this empty will be considered unlimited
        </p>
        <DropdownMenu
          open={isDaysOptionDropdownOpen}
          onOpenChange={setIsDaysOptionDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant={'outline'}
              className="w-56"
              onClick={(e) => e.stopPropagation()}
            >
              {allowableDaysBooking === undefined
                ? '--'
                : `${allowableDaysBooking} days`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAllowableDaysBooking('0');
                setIsDaysOptionDropdownOpen(false);
              }}
            >
              --
            </DropdownMenuItem>
            {[15, 30, 60, 90].map((days) => (
              <DropdownMenuItem
                key={days}
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAllowableDaysBooking(days.toString());
                  setIsDaysOptionDropdownOpen(false);
                }}
              >
                {days} days
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Waitlist Toggle */}
      <div className="flex items-center space-x-4">
        <p className="">
          Do you want to allow people to ask to be added to a waitlist
        </p>
        <Switch
          checked={isWaitlistEnabled}
          onCheckedChange={(checked) => setIsWaitlistEnabled(checked)}
        />
      </div>
      {/* Waitlist Capacity */}
      {isWaitlistEnabled && (
        <div>
          <Label>
            <p className="mb-2">Waitlist Capacity</p>
            <Input
              type="number"
              value={weitlistCapacity}
              onChange={(e) => setWeitlistCapacity(e.target.value)}
            />
          </Label>
        </div>
      )}
      {/* Section/Specific Table Choice */}
      <div className="flex items-center space-x-4">
        <p className="">
          Would you like to allow customers to choose a section
        </p>
        <Switch
          checked={isChooseSection}
          onCheckedChange={(checked) => setIsChooseSection(checked)}
        />
      </div>
      <Modal
        isOpen={createTurnTimeModalOpen}
        onClose={() => setCreateTurnTimeModalOpen(false)}
        title="Create custom turn time"
        description="Please enter Party Size and Turn Time."
      >
        <Label>
          <p className="mb-2">Party Size</p>
          <Input
            type="number"
            value={partySizeInput}
            onChange={(e) => setPartySizeInput(parseInt(e.target.value))}
            className="mb-4"
          />
        </Label>
        <Label>
          <p className="mb-2">Turn Time (minutes)</p>
          <Input
            type="number"
            value={Math.floor(turnTimeInput / 60)}
            onChange={handleMinutesInputChange}
            className="mb-4"
          />
        </Label>
        <div className="flex justify-end gap-2">
          <Button
            className=""
            onClick={() => setCreateTurnTimeModalOpen(false)}
            variant={'secondary'}
          >
            Cancel
          </Button>
          <Button className="" onClick={handleCreateTurnTime}>
            Create
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={moreModalOpen}
        onClose={() => setMoreModalOpen(false)}
        title="Edit Party Size and Turn Time."
        description="Please enter Party Size and Turn Time."
      >
        <Label>
          <p className="mb-2">Party Size</p>
          <Input
            type="number"
            value={partySizeInput}
            onChange={(e) => setPartySizeInput(parseInt(e.target.value))}
            className="mb-4"
          />
        </Label>
        <Label>
          <p className="mb-2">Turn Time (minutes)</p>
          <Input
            type="number"
            value={Math.floor(turnTimeInput / 60)}
            onChange={handleMinutesInputChange}
            className="mb-4"
          />
        </Label>
        <div className="flex justify-between gap-4">
          <Button
            className="w-full"
            onClick={() => {
              handleDeleteTurnTime(selectedTurnTime.id);
            }}
            variant={'danger'}
          >
            Delete
          </Button>
          <Button className="w-full" onClick={handleCreateTurnTime}>
            Apply
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default TimeSettingsPanel;
