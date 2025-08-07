import React, { useState, useEffect } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import DraggableBooking from './DraggableBooking';

interface TableCardProps {
  table: any;
  bookings: any[];
  onPrintBill: (table: any, booking: any) => void;
  createBooking: (table: any, token: any) => void;
  moveBooking: (bookingId: number, toTableId: number, token: any) => void;
  token: any;
  rearrangeMode: boolean;
}

const BookingStatus: { [key: number]: string } = {
  0: 'Unconfirmed',
  1: 'All',
  2: 'Billed',
  3: 'Unbill',
  4: 'Seated',
  5: 'Unseat',
  6: 'Finished',
  7: 'NoShow',
  8: 'Cancelled',
  9: 'SeatNotWaitList',
  10: 'WaitList',
  11: 'OverTime',
  12: 'Upcoming',
  13: 'Late',
  14: 'NeedAttention',
  15: 'PartiallySeated',
  16: 'Unfinished',
  17: 'Pending'
};

const TableCard: React.FC<TableCardProps> = ({
  table,
  bookings,
  onPrintBill,
  createBooking,
  moveBooking,
  token,
  rearrangeMode
}) => {
  const [position, setPosition] = useState({ x: table.pos_x, y: table.pos_y });

  const booking = bookings.find((booking: any) =>
    booking.table.some((t: any) => t.id === table.id)
  );
  const getBookingStatusName = (status: number) => {
    return BookingStatus[status] || 'Unknown status';
  };

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: table.id,
    data: {
      type: 'Table',
      tableId: table.id
    }
  });

  const getSizeAndShape = (capacity_min: any, capacity_max: any) => {
    const capacity = (capacity_min + capacity_max) / 2;
    if (capacity <= 2) return { width: '100px', height: '100px', image: '' };
    if (capacity <= 4) return { width: '200px', height: '100px', image: '' };
    if (capacity <= 6) return { width: '280px', height: '100px', image: '' };
    return { width: '2000px', height: '100px', image: '' };
  };

  const { width, height } = getSizeAndShape(
    table.capacity_min,
    table.capacity_max
  );
  const haveBooking = booking !== undefined;

  const {
    setNodeRef: setDraggableNodeRef,
    attributes,
    listeners,
    transform,
    isDragging
  } = useDraggable({
    id: table.id,
    data: {
      type: 'Table',
      table
    },
    disabled: !rearrangeMode
  });

  useEffect(() => {
    if (transform) {
      setPosition({
        x: table.pos_x + transform.x,
        y: table.pos_y + transform.y
      });
    }
  }, [transform]);

  return (
    <div
      ref={setDroppableNodeRef}
      className={`absolute p-4 shadow-md transition-transform duration-150 ${
        isOver ? 'bg-blue-200' : 'bg-transparent'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width,
        height,
        // borderRadius: borderRadius || '0%',
        borderColor: haveBooking ? 'red' : 'black',
        transform: `rotate(${
          table.can_rotate
            ? table.rotate_deg > 2
              ? table.rotate_deg > 3
                ? '90'
                : '30'
              : table.rotate_deg === 0
              ? '90'
              : '0'
            : '0'
        }deg)`,
        // backgroundImage: `url(${image.src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <div
        ref={setDraggableNodeRef}
        {...attributes}
        {...listeners}
        className={`flex h-full w-full cursor-move flex-col items-center justify-center ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
        style={{
          transform: `rotate(${
            table.can_rotate
              ? table.rotate_deg > 2
                ? table.rotate_deg > 3
                  ? -'90'
                  : -'30'
                : table.rotate_deg === 0
                ? -'90'
                : '0'
              : '0'
          }deg)`
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="text-center text-lg font-semibold text-black">
            {table.name}
          </div>
          {booking && (
            <div
              className={`mt-2 rounded-full px-3 py-1 text-xs text-white ${
                booking.status === 4 || booking.status === 6
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
              {getBookingStatusName(booking.status)}
            </div>
          )}
        </div>
        <div className="mt-2 text-center">
          {booking && (
            <>
              <DraggableBooking booking={booking} />
              <div className="mt-2 text-sm">
                Total: $
                {booking.products
                  .reduce(
                    (acc: number, item: any) =>
                      acc + item.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableCard;
