import React, { useState, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface TableFilterProps {
  floor: any;
  handleSelectFloor: (floor: any) => void;
}

const TableFilter: React.FC<TableFilterProps> = ({
  floor,
  handleSelectFloor
}) => {
  const [selectedFloor, setSelectedFloor] = useState(floor[0]);
  const [showFloors, setShowFloors] = useState(false);

  const handleSelectedOption = (floorItem: any) => {
    if (selectedFloor.id !== floorItem.id) {
      setSelectedFloor(floorItem);
      handleSelectFloor(floorItem);
    }
    setShowFloors(false);
  };

  // Memoize the floor items to avoid re-renders if the floor prop doesn't change
  const floorItems = useMemo(() => floor, [floor]);

  return (
    <DropdownMenu open={showFloors} onOpenChange={setShowFloors}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="bg-tertiary">
          {selectedFloor.floor_name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50">
        {floorItems.map((floorItem: any) => (
          <DropdownMenuItem
            key={floorItem.id}
            onClick={() => handleSelectedOption(floorItem)}
            className={`block w-full cursor-pointer p-2 text-left ${
              selectedFloor.id === floorItem.id ? 'text-primary' : ''
            }`}
          >
            {floorItem.floor_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableFilter;
