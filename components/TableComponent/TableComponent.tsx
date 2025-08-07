'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  getFullname,
  getTimeOnly,
  getBookingOnTableByIndex,
  getBookingTimeOnly,
  getTableImg,
  getTableWidth,
  getTableHeight,
  getRadWidth,
  getRadHeight,
  radToDeg,
  getPositionTop,
  getPositionLeft,
  tableNamePositionLeft,
  tableNamePositionMarginLeft,
  tableNamePositionMarginTop,
  tableNamePositionLeftTranslate,
  calculateElapsedPercentageByDate
} from '../../utils/Utility';
import SemiCircularProgressBar from '@/components/ProgressBar/SemiCircularProgressBar';
import { TABLETYPE } from '@/utils/enum';
import TableComponentBookingName from './TableComponentBookingName';
import Image from 'next/image';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  getBookingProgressStatusColor,
  getBookingStatusColor,
  getRoundTableBookingStatus,
  hasConflictBooking
} from '@/utils/common';
import { CircleAlert } from 'lucide-react';

function useCombinedRefs<T extends HTMLDivElement>(...refs: React.Ref<T>[]) {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T>).current = targetRef.current as T;
      }
    });
  }, [refs]);

  return targetRef;
}
interface TableComponentProps {
  table: any;
  bookings?: any;
  showTimeline?: boolean;
  selectedTableIds: any;
  latestData?: any[];
  showTableDetailsHandler?: any;
}
const TableComponent = ({
  table,
  bookings = [],
  showTimeline = false,
  selectedTableIds,
  latestData,
  showTableDetailsHandler
}: TableComponentProps) => {
  const booking = bookings.find((booking: any) =>
    booking.table.some((t: any) => t.id === table.id)
  );
  const hasConflict = hasConflictBooking(table, null, bookings);
  const isBookingNull = booking === null || booking === undefined;

  const bookingStatus = booking ? booking?.status : null;
  const guestName = booking ? getFullname(booking?.guest) : null;
  const startTime = booking ? getTimeOnly(booking?.start_date) : null;
  const tableType: number = table.table_type;
  const tableRotate = table.rotate_deg;
  const rotateVal = radToDeg(tableRotate);
  const isRoundTable = getRoundTableBookingStatus(tableType);
  const positionTop = tableNamePositionMarginTop(tableType, tableRotate);
  const tableHeight = getTableHeight(tableType);
  const tableWidth = getTableWidth(tableType);
  const commonStyle = {
    position: 'absolute',
    zIndex: 1,
    left: tableNamePositionLeft(tableType, tableRotate),
    transform: `translateX(${tableNamePositionLeftTranslate(tableType)})`,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: tableNamePositionMarginLeft(tableType, tableRotate)
  };
  const [tableAmount, setTableAmount] = useState<any>(null);

  const getProgressBarStyle = () => {
    let baseStyle = {
      position: 'absolute',
      zIndex: 1,
      borderRadius: 4,
      width: '100%',
      left: 0,
      marginLeft: 0,
      bottom: '6px',
      height: 3
    };
    if (
      tableType === TABLETYPE.twoSinglePairTable ||
      tableType === TABLETYPE.threeSinglePairTable ||
      tableType === TABLETYPE.fourSinglePairTable
    ) {
      if (rotateVal !== 90) {
        return {
          ...baseStyle,
          width: '80%',
          left: '10%',
          bottom: 0
        };
      }
    } else if (tableType === TABLETYPE.fourPersonSingleTable) {
      return {
        ...baseStyle,
        width: '80%',
        left: '10%',
        bottom: '10%'
      };
    } else if (tableType === TABLETYPE.singlePairTable && tableRotate === 0) {
      return {
        ...baseStyle,
        width: '80%',
        left: '10%',
        bottom: 0
      };
    } else if (tableType === TABLETYPE.threeSingleTable && rotateVal === 0) {
      return {
        ...baseStyle,
        width: '90%',
        left: '0%',
        bottom: '0'
      };
    } else if (tableType === TABLETYPE.twoSingleTable && rotateVal === 0) {
      return {
        ...baseStyle,
        width: '90%',
        left: '0%',
        bottom: '0'
      };
    } else if (tableType === TABLETYPE.singleTable && rotateVal === 0) {
      return {
        ...baseStyle,
        width: '90%',
        left: '0%',
        bottom: '0'
      };
    } else if (
      tableType === TABLETYPE.fourSinglePairTable &&
      rotateVal === 180
    ) {
      return {
        ...baseStyle,
        width: '80%',
        left: '10%',
        bottom: '0'
      };
    }
    return baseStyle;
  };

  useEffect(() => {
    if (booking) {
      const products = latestData
        ?.filter((val: any) => val.booking_uuid === booking?.uuid)
        .map((val: any) => val.products)[0];
      let grandTotalAmount = 0;
      if (products && products.length) {
        products.forEach((data: any) => {
          let totalAmount: number;

          // Check if product is weight-based (price_type: 2)
          if (data.price_type === 2) {
            // Calculate price based on weight ratio
            totalAmount = (data.total_weight / data.based_weight) * data.price;
          } else {
            // Regular product: price * quantity
            totalAmount = data.price * data.quantity;
          }

          data.addOns.forEach((addOn: any) => {
            totalAmount += addOn.price * addOn.quantity;
          });
          grandTotalAmount += totalAmount;
        });
      }
      setTableAmount(grandTotalAmount.toFixed(2));
    } else {
      setTableAmount(null);
    }
  }, [booking, latestData]);

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform
  } = useDraggable({
    id: table.id,
    data: {
      type: 'Table',
      table
    },
    disabled: true
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: table.id,
    data: {
      type: 'Table',
      table: table
    }
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  const combinedRef = useCombinedRefs(setDraggableNodeRef, setDroppableNodeRef);

  return (
    <div
      ref={combinedRef}
      {...attributes}
      {...listeners}
      style={{
        ...style,
        position: 'relative',
        width: getRadWidth(tableRotate, tableType),
        height: getRadHeight(tableRotate, tableType),
        cursor: 'pointer'
      }}
      onClick={() =>
        showTableDetailsHandler ? showTableDetailsHandler(table, booking) : null
      }
    >
      <span
        ref={setDroppableNodeRef}
        // @ts-ignore
        style={{
          ...commonStyle,
          marginTop: positionTop,
          lineHeight: 1.2,
          textAlign: isRoundTable ? 'center' : 'left'
        }}
        className="table-name"
      >
        {table.name}
        {tableAmount && tableAmount > 0 && (
          <span
            style={{
              display: 'block',
              color: '#7af8c8'
            }}
          >
            ${tableAmount}
          </span>
        )}
      </span>
      {hasConflict && (
        <CircleAlert
          size={18}
          className="absolute -right-1 -top-1 z-10 rounded-full bg-backgroundPos text-red"
        />
      )}
      {!showTimeline && !isBookingNull && (
        <>
          <TableComponentBookingName
            guestName={guestName}
            startTime={startTime}
            table={table}
            booking={booking}
          />
          {isRoundTable ? (
            <SemiCircularProgressBar
              percentage={calculateElapsedPercentageByDate(
                booking?.start_date,
                booking?.end_date
              )}
              bookingStatus={bookingStatus}
              startDate={booking?.start_date}
              tableType={tableType}
              tableRotate={tableRotate}
            />
          ) : (
            <div
              // @ts-ignore
              style={{
                ...getProgressBarStyle()
              }}
              className={`progress-bar ${getBookingStatusColor(
                'bg',
                bookingStatus,
                booking?.start_date || ''
              )}`}
            >
              <div
                style={{
                  width: `${calculateElapsedPercentageByDate(
                    booking?.start_date,
                    booking?.end_date
                  )}%`,
                  height: 3,
                  borderRadius: 4
                }}
                className={`progress-status ${getBookingProgressStatusColor(
                  'bg',
                  bookingStatus
                )}`}
              />
            </div>
          )}
        </>
      )}
      {showTimeline && (
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            height: '100%',
            width: 60,
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -23%)`
          }}
          className="timeline-container flex flex-col gap-1 px-1"
        >
          {[0, 1, 2].map((index) => (
            <div
              className={`timeline-item flex h-2 items-center justify-center rounded-[2px] bg-black/80 py-1 text-[8px] leading-none 
                ${getBookingStatusColor(
                  'text',
                  bookingStatus,
                  booking?.start_date
                )}`}
              key={index}
            >
              {getBookingTimeOnly(
                getBookingOnTableByIndex(table.id, bookings, index)
              ) ?? ''}
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          width: tableWidth,
          height: tableHeight,
          transformOrigin: 'top left',
          position: 'absolute',
          top: getPositionTop(tableRotate, tableType),
          left: getPositionLeft(tableRotate, tableType),
          transform: `rotate(${rotateVal}deg)`
        }}
        className="table-container-wrapper"
      >
        <Image
          draggable="false"
          // @ts-ignore
          src={getTableImg(tableType)}
          className={`
            ${
              selectedTableIds.length >= 1 &&
              selectedTableIds.includes(table.id)
                ? 'table-floor table-container img-filter'
                : 'table-floor table-container'
            } table-filter h-full w-full
          `}
          alt="checker"
        />
      </div>
    </div>
  );
};

export default TableComponent;
