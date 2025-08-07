import React, { useState } from 'react';
import { getTimeStr } from '@/utils/Utility';
interface TimeTableProps {
  timeList: any;
  selectedTimeHandler: any;
}
const TimeTable: React.FC<TimeTableProps> = ({
  timeList,
  selectedTimeHandler
}) => {
  const [selectedTime, setSelectedTime] = useState(null);

  const selectTime = (time: any) => {
    setSelectedTime(time);
    selectedTimeHandler(time);
  };

  return (
    <div className="time-table mt-2 w-full select-none overflow-x-auto overflow-y-hidden">
      <div className="time-table-item-container gap-2">
        {timeList.length > 0
          ? timeList.map((time: any) => {
              return (
                <div
                  key={Math.random()}
                  onClick={() => selectTime(time)}
                  className={`cursor-pointer rounded-lg border py-2 text-center text-sm 
                    ${
                      selectedTime === time
                        ? 'border-primary bg-tertiary'
                        : 'border-secondary bg-secondary'
                    }
                  `}
                >
                  {getTimeStr(time)}
                </div>
              );
            })
          : ''}
      </div>
    </div>
  );
};

export default TimeTable;
