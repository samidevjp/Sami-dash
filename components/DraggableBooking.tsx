import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableBookingProps {
  booking: any;
}

const DraggableBooking: React.FC<DraggableBookingProps> = ({ booking }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `booking-${booking?.id}`,
      data: {
        type: 'BOOKING',
        bookingId: booking?.id,
        oldTableId: booking?.table[0]?.id
      }
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    fontSize: '8px'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="draggable-booking"
    >
      {booking?.guest?.first_name} {booking?.guest?.last_name} -{' '}
      {booking?.party_size} guest(s)
    </div>
  );
};

export default DraggableBooking;
