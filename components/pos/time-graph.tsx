import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getBookingStatusColor } from '@/utils/common';

interface TimeGraphProps {
  selectedShiftId: any;
  bookingsOnTable: any;
  allShifts: any;
}

const TimeGraph: React.FC<TimeGraphProps> = ({
  selectedShiftId,
  bookingsOnTable,
  allShifts
}) => {
  const [shift, setShift] = useState<any>(
    allShifts.find((shift: any) => shift.id === selectedShiftId)
  );
  useEffect(() => {
    setShift(allShifts.find((shift: any) => shift.id === selectedShiftId));
  }, [selectedShiftId, allShifts]);

  const [expanded, setExpanded] = useState(false);
  const divideInto15mins = 900;
  const divideInto60mins = 3600;

  const start = shift
    ? moment(new Date()).startOf('day').second(shift.start_time)
    : '';
  const diff = shift
    ? Math.floor((shift.end_time - shift.start_time) / divideInto60mins)
    : 0;
  let time = shift ? (start ? start.format('h') : '') : '';

  const lineClasses = expanded
    ? 'w-full h-px bg-foreground'
    : 'min-w-[1px] h-10 bg-foreground relative';
  const thickLineClass = expanded
    ? 'w-full h-2 bg-foreground'
    : 'min-w-[2px] h-10 bg-foreground';
  const timeLabelClasses = expanded
    ? 'absolute text-xs -left-3 -bottom-5 w-3 text-right'
    : 'absolute text-xs -translate-x-1/2 -bottom-5 w-3 text-center';

  const returnValue = [];
  for (let i = 0; i <= diff; i++) {
    let thickLine = (
      <div key={Math.random()} className={thickLineClass}>
        <p className={timeLabelClasses}>{time}</p>
      </div>
    );
    if (i === diff) {
      time = start ? start.add(1, 'h').format('h') : '';
      returnValue.push(thickLine);
    } else {
      returnValue.push(thickLine);
      for (let j = 1; j <= 3; j++) {
        returnValue.push(
          <div key={`line-${i}-${j}`} className={lineClasses} />
        );
      }
      time = start ? start.add(1, 'h').format('h') : '';
    }
  }

  const getBookingPosition = (booking: any) => {
    const startBarNum =
      (booking.start_time - roundToHourSeconds(shift?.start_time)) /
      divideInto15mins;
    const totalBars = diff * 4;

    return (startBarNum / totalBars) * 100;
  };

  const getBookingWidth = (booking: any) => {
    return `calc( 100% / ${diff} * ${
      (booking.end_time - booking.start_time) / divideInto60mins
    })`;
  };

  function roundToHourSeconds(timeInSeconds: any) {
    // secondsInAnHour = 3600
    const secondsInAnHour = 3600;
    // cut off the minutes and seconds
    const roundedTime =
      Math.floor(timeInSeconds / secondsInAnHour) * secondsInAnHour;
    return roundedTime;
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="relative h-5/6 w-full">
      <div
        id="graph-wrapper"
        className={`relative inline-flex w-full justify-between transition-all ${
          expanded ? 'flex-col gap-3' : 'gap-1'
        }`}
      >
        {returnValue}
      </div>

      {bookingsOnTable.length > 0 &&
        bookingsOnTable.map((booking: any, key: number) => (
          <div
            key={key}
            style={{
              left: expanded ? 0 : `${getBookingPosition(booking)}%`,
              top: expanded ? getBookingPosition(booking) : 8 * key,
              width: expanded ? '100%' : getBookingWidth(booking),
              height: expanded ? getBookingWidth(booking) : '16px'
            }}
            className={`absolute left-0 top-0 h-5 ${
              key > 0 ? 'mt-1' : ''
            } ${getBookingStatusColor(
              'bg',
              booking.status,
              booking.start_date
            )}`}
          />
        ))}

      {false && (
        <div className="mt-3 flex justify-center">
          <span onClick={handleExpandClick}>
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </span>
        </div>
      )}
    </div>
  );
};

export default TimeGraph;
