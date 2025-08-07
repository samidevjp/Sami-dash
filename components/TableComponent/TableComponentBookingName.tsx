import React from 'react';
import {
  tableNamePositionLeft,
  tableNamePositionMarginLeft,
  tableNamePositionMarginTop,
  tableNamePositionLeftTranslate
} from '../../utils/Utility';
import { useDraggable } from '@dnd-kit/core';
import { getRoundTableBookingStatus } from '@/utils/common';

const TableComponentBookingName = ({
  guestName,
  startTime,
  table,
  booking
}: any) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `booking-${booking?.id}`,
    data: {
      type: 'Booking',
      booking: booking,
      oldTableId: booking?.table[0]?.id
    }
  });
  const tableType: number = table.table_type;
  const tableRotate = table.rotate_deg;
  const isRoundTable = getRoundTableBookingStatus(tableType);
  const positionTop = tableNamePositionMarginTop(tableType, tableRotate);
  const getBookingDetailPosition = () => {
    if (isRoundTable) {
      return {
        inset: '0',
        margin: 'auto',
        paddingTop: '8px',
        transform: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    } else {
      return {
        bottom: positionTop + 3
      };
    }
  };

  return (
    <div
      // key={Math.random()}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        cursor: 'move',
        lineHeight: '1.2',
        ...getBookingDetailPosition(),
        textAlign: isRoundTable ? 'center' : 'left',
        position: 'absolute',
        zIndex: 1,
        left: tableNamePositionLeft(tableType, tableRotate),
        transform: `translateX(${tableNamePositionLeftTranslate(tableType)})`,
        fontSize: 7,
        fontWeight: 'bold',
        marginLeft: tableNamePositionMarginLeft(tableType, tableRotate)
      }}
      className="booking-detail"
    >
      {guestName}
      <br />
      {startTime}
    </div>
  );
};

export default TableComponentBookingName;
