import React, { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import TableComponent from '../TableComponent/TableComponent';
import { TableContext } from '@/hooks/useBookings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Clock3, Minus, Plus } from 'lucide-react';
import ShiftIndicator from './shift-indicator';
import ShiftSelector from './shift-selector';
import BookingCalendarArrow from './booking-calendar-arrow';
import { useCurrentShiftId } from '@/hooks/getCurrentShiftId';
import { useShiftStore } from '@/hooks/useShiftStore';
import { useShiftsStore } from '@/hooks/useShiftsStore';

interface TableFloorModalProps {
  open: boolean;
  setOpenTableFloorModal: (open: boolean) => void;
  tables: any;
  floors: any;
  setSelectedTableIds: (table: any) => void;
  selectedTableIds: any;
  closedDatesMapRef: Map<string, string>;
}
const TableFloorModal: React.FC<TableFloorModalProps> = ({
  open,
  setOpenTableFloorModal,
  floors,
  setSelectedTableIds,
  selectedTableIds,
  closedDatesMapRef
}) => {
  const { activeBookings, filteredTable, updateData } =
    useContext(TableContext);
  const handleTableClick = (table: any) => {
    setSelectedTableIds((tableIds: any) => {
      if (tableIds.some((id: any) => id === table.id)) {
        return tableIds.filter((id: any) => id !== table.id);
      }
      return [...tableIds, table.id];
    });
  };
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFloor, setSelectedFloor] = useState<number>(floors[0]?.id);
  const [showFloors, setShowFloors] = useState(false);
  const [filteredTables, setFilteredTables] = useState<any>(
    filteredTable(selectedFloor)
  );
  const [showTimeline, setShowTimeline] = useState(false);
  useEffect(() => {
    setFilteredTables(filteredTable(selectedFloor));
  }, [selectedFloor]);
  const { shifts: allShifts } = useShiftsStore();

  const currentShift: number = useCurrentShiftId(allShifts);

  const [selectedShift, setSelectedShift] = useState<number | undefined>(
    currentShift
  );

  const { setSelectedShiftId } = useShiftStore();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    updateData(selectedDate, selectedShift);
    if (allShifts) {
      setSelectedShiftId(selectedShift ? selectedShift : currentShift);
    }
  }, [selectedDate, selectedShift]);

  const formatDate2Digit = (date: any) => {
    if (!date) return selectedDate;
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const options = { weekday: 'long', day: '2-digit', month: 'short' };
    const dateStr = date.toLocaleDateString('en-AU', options);

    return dateStr.replace(/(\w+)( \d{2} )/, '$1,$2');
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpenTableFloorModal(false)}>
      <DialogContent className="m-auto flex min-h-[90vh] min-w-[90vw] flex-col overflow-auto rounded-lg">
        <div className="my-2 inline-flex w-full items-center justify-center">
          <BookingCalendarArrow
            arrowType="left"
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <div className="mx-4">
            <div className="flex h-8 w-48 items-center justify-center rounded-2xl bg-gray-dark font-medium shadow">
              {formatDate2Digit(selectedDate)}
            </div>
          </div>
          <div className="mx-4">
            <ShiftIndicator
              selectedShift={selectedShift}
              setSelectedDate={setSelectedDate}
              isSpecialDay={closedDatesMapRef.has(
                selectedDate.toLocaleDateString('en-CA')
              )}
            />
          </div>
          <ShiftSelector
            selectedDate={selectedDate}
            selectedShift={selectedShift}
            setSelectedShift={setSelectedShift}
            shifts={allShifts}
            isSpecialDay={closedDatesMapRef.has(
              selectedDate.toLocaleDateString('en-CA')
            )}
            closedDatesMapRef={closedDatesMapRef}
          />
          <BookingCalendarArrow
            arrowType="right"
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>
        <div
          className="relative max-h-[70dvh] w-full overflow-auto"
          style={{ height: 'calc( 90vh - 160px )' }}
        >
          <div style={{ transform: `scale(${scale})` }}>
            {filteredTables.map((table: any) => {
              const position = { x: table.pos_x, y: table.pos_y };
              return (
                <div
                  key={table.id}
                  style={{
                    position: 'absolute',
                    top: position.y * 0.6,
                    left: position.x * 0.6,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleTableClick(table)}
                >
                  <TableComponent
                    bookings={activeBookings}
                    selectedTableIds={selectedTableIds}
                    showTimeline={showTimeline}
                    table={table}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="fixed bottom-0 right-0 z-50 flex items-center gap-4 pb-4 pr-4">
          <Button
            variant="secondary"
            className="rounded bg-tertiary p-1"
            onClick={() => setScale((scale) => scale - 0.1)}
          >
            <Minus />
          </Button>
          <Button
            variant="secondary"
            className="rounded bg-tertiary p-1"
            onClick={() => setScale((scale) => scale + 0.1)}
          >
            <Plus />
          </Button>
          <DropdownMenu modal open={showFloors} onOpenChange={setShowFloors}>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="bg-tertiary">
                {floors.map(
                  (floor: any) => floor.id === selectedFloor && floor.floor_name
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {floors.map((floor: any) => (
                <DropdownMenuItem
                  key={floor.id}
                  onClick={() => {
                    setSelectedFloor(floor.id);
                    setShowFloors(false);
                  }}
                  className={`block w-full cursor-pointer p-2 text-left ${
                    selectedFloor === floor.id ? 'text-primary' : ''
                  }`}
                >
                  {floor.floor_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="secondary"
            className="bg-tertiary px-2 py-1"
            onClick={() => setShowTimeline(!showTimeline)}
          >
            <Clock3 size={24} />
          </Button>
          <Button
            onClick={() => setOpenTableFloorModal(false)}
            className="bg-primary "
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableFloorModal;
