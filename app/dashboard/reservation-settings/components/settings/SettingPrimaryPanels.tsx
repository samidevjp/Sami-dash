import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SquarePlus, EllipsisVertical } from 'lucide-react';
import { now } from 'lodash';
interface SettingPrimaryPanelsProps {
  largeParties: number;
  isLateArrivals: boolean;
  isEnableCreditCardDetails: boolean;
  setLargeParties: React.Dispatch<React.SetStateAction<number>>;
  setIsLateArrivals: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEnableCreditCardDetails: React.Dispatch<React.SetStateAction<boolean>>;
  partysizeTurnTime: any[];
  setPartysizeTurnTime: React.Dispatch<React.SetStateAction<any[]>>;
  createTurnTimeData: any[];
  setCreateTurnTimeData: React.Dispatch<React.SetStateAction<any[]>>;
  setDeleteTurnTimeData: React.Dispatch<React.SetStateAction<number[]>>;
}
const SettingPrimaryPanels: React.FC<SettingPrimaryPanelsProps> = ({
  largeParties,
  isLateArrivals,
  isEnableCreditCardDetails,
  setLargeParties,
  setIsLateArrivals,
  setIsEnableCreditCardDetails,
  partysizeTurnTime,
  setPartysizeTurnTime,
  createTurnTimeData,
  setCreateTurnTimeData,
  setDeleteTurnTimeData
}) => {
  const [createTurnTimeModalOpen, setCreateTurnTimeModalOpen] =
    useState<boolean>(false);
  const [partySizeInput, setPartySizeInput] = useState<number>(2);
  const [turnTimeInput, setTurnTimeInput] = useState<number>(10);
  const [moreModalOpen, setMoreModalOpen] = useState<boolean>(false);
  const [selectedTurnTime, setSelectedTurnTime] = useState<any>({});
  const handleCreateTurnTime = () => {
    if (selectedTurnTime && selectedTurnTime.id) {
      const updatedTurnTime = {
        ...selectedTurnTime,
        party_size: partySizeInput,
        turn_time: turnTimeInput
      };
      setPartysizeTurnTime((prev) =>
        prev.map((item) =>
          item.id === updatedTurnTime.id ? updatedTurnTime : item
        )
      );
      setCreateTurnTimeData((prev) => {
        return [...prev, updatedTurnTime];
      });
    } else {
      const newTurnTime = {
        id: now(),
        party_size: partySizeInput,
        turn_time: turnTimeInput,
        active: true,
        is_new: true
      };
      setPartysizeTurnTime((prev) => [...prev, newTurnTime]);
      setCreateTurnTimeData((prev) => [...prev, newTurnTime]);
    }

    setCreateTurnTimeModalOpen(false);
    setMoreModalOpen(false);
  };
  const handleTurnTimeActiveChange = (checked: any, index: any) => {
    const updatedTurnTime = [...partysizeTurnTime];
    updatedTurnTime[index] = {
      ...updatedTurnTime[index],
      active: checked
    };
    setPartysizeTurnTime(updatedTurnTime);
    setCreateTurnTimeData((prev) => {
      const updateData = updatedTurnTime[index];
      const existingIndex = prev.findIndex((item) => item.id === updateData.id);
      if (existingIndex !== -1) {
        const updatedPrev = [...prev];
        updatedPrev[existingIndex] = {
          ...updatedPrev[existingIndex],
          ...updateData
        };
        return updatedPrev;
      }
      return [...prev, updateData];
    });
  };
  const handleDeleteTurnTime = (id: number) => {
    setPartysizeTurnTime((prev) => prev.filter((item) => item.id !== id));
    setCreateTurnTimeData((prev) => prev.filter((item) => item.id !== id));
    setDeleteTurnTimeData((prev) => {
      const isNewlyAdded = createTurnTimeData.some((item) => item.id === id);
      if (!isNewlyAdded) {
        return [...prev, id];
      }
      return prev;
    });
    setMoreModalOpen(false);
    setSelectedTurnTime({});
  };
  const handleMoreModalOpen = (item: any) => {
    setSelectedTurnTime(item);
    setPartySizeInput(item.party_size);
    setTurnTimeInput(item.turn_time);
    setMoreModalOpen(true);
  };
  const onCreateTurnTimeModalOpen = () => {
    setPartySizeInput(2);
    setTurnTimeInput(10);
    setSelectedTurnTime({});
    setCreateTurnTimeModalOpen(true);
  };

  return (
    <>
      {/* Large Parties */}
      <div className="border-b pb-6">
        <Label>
          <p className="mb-2 text-base font-semibold">Large Parties</p>
        </Label>
        <p className="text-sm">What do you consider a large party?</p>
        <p className="mb-2 text-xs text-red">
          *Large parties will be called out for hots in the Shift Notes
        </p>
        <Input
          type="number"
          placeholder="Enter a number"
          value={largeParties}
          onChange={(e) => setLargeParties(parseInt(e.target.value))}
          className="w-40"
        />
      </div>
      {/* Late Arrivals */}
      <div className="border-b py-6">
        <Label className="flex cursor-pointer items-center justify-between">
          <span className="mb-2 text-base font-semibold">Late Arrivals</span>
          <Switch
            checked={isLateArrivals}
            onCheckedChange={(checked) => setIsLateArrivals(checked)}
          />
        </Label>
        <p className="text-sm">
          Maintain original out time when parties are seated late.
        </p>
      </div>
      {/* Enabale Credit Card Details */}
      <div className="border-b py-6">
        <Label className="flex cursor-pointer items-center justify-between">
          <span className="mb-2 text-base font-semibold">
            Enabale Credit Card Details
          </span>
          <Switch
            checked={isEnableCreditCardDetails}
            onCheckedChange={(checked) => setIsEnableCreditCardDetails(checked)}
          />
        </Label>
        <p className="text-sm">
          Maintain original out time when parties are seated late.
        </p>
      </div>
      {/* Widget Custom Turn Time */}
      <div className="py-6">
        <Label className="flex justify-between gap-4">
          <div>
            <p className="mb-2 text-base font-semibold">
              Widget Custom Turn Time
            </p>
            <p className="mb-8 text-sm">
              You can add custom turn the depending on the party size selected
              on the widget.
            </p>
          </div>
          <Button
            variant={'ghost'}
            className="p-1"
            onClick={onCreateTurnTimeModalOpen}
          >
            <SquarePlus className="h-8 w-8 text-primary" />
          </Button>
        </Label>
        {partysizeTurnTime.length > 0 ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}
          >
            {partysizeTurnTime.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-4"
              >
                <Label className="flex w-full cursor-pointer items-center justify-between">
                  <div className="">
                    <p className="mb-1">Party Size: {item.party_size}</p>
                    <p className="text-sm text-muted-foreground">
                      Turn Time: {Math.floor(item.turn_time / 3600)}h{' '}
                      {Math.floor((item.turn_time % 3600) / 60)}min
                    </p>
                  </div>
                  <Switch
                    checked={item.active}
                    onCheckedChange={(checked) =>
                      handleTurnTimeActiveChange(checked, index)
                    }
                  />
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
          <p className="text-muted-foreground">No custom turn time</p>
        )}
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
            value={turnTimeInput}
            onChange={(e) => setTurnTimeInput(parseInt(e.target.value))}
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
        title="Edit custom turn time"
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
            value={turnTimeInput}
            onChange={(e) => setTurnTimeInput(parseInt(e.target.value))}
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
    </>
  );
};
export default SettingPrimaryPanels;
