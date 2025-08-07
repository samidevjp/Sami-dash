import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface TableSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (tableId: number) => void;
  tables: any[]; // Replace 'any' with your table type
}

const TableSelectionModal: React.FC<TableSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTable,
  tables
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Table"
      description=""
    >
      <div className="grid max-h-[80vh]  grid-cols-3 gap-4 overflow-y-scroll">
        {tables.map((table) => (
          <TooltipProvider key={table.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onSelectTable(table)}
                  className="bg-secondary p-6 text-foreground"
                >
                  {table.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimum Capacity: {table.capacity_min}</p>
                <p>Maximum Capacity: {table.capacity_max}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </Modal>
  );
};

export default TableSelectionModal;
