import React from 'react';
import { ChevronRight } from 'lucide-react';
import { daysOfWeek } from '@/app/dashboard/team/components/common/const';
interface FlowControlDateTabProps {
  selectedDay: any;
  setSelectedDay: React.Dispatch<React.SetStateAction<any>>;
  widgetSettingsData: any;
}
const FlowControlDateTab: React.FC<FlowControlDateTabProps> = ({
  selectedDay,
  widgetSettingsData,
  setSelectedDay
}) => {
  return (
    <div className="h-screen w-[300px] overflow-y-scroll border-r p-6">
      <h2 className="text-md mb-1 font-semibold">Select Days</h2>
      <p className="mb-8 text-xs">
        Service flow activation and detailed flow settings for each day
      </p>
      <div className="flex flex-col space-y-8">
        {Object.keys(daysOfWeek).map((key) => {
          const dayData = widgetSettingsData[daysOfWeek[key]];
          const isSelected = selectedDay?.day === Number(key);
          return (
            <div
              key={key}
              className={`border-b ${isSelected ? 'border-primary' : ''}`}
            >
              <div
                className="flex cursor-pointer items-center justify-between pb-4"
                onClick={() => setSelectedDay(dayData)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${
                      dayData?.is_open ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
                  <span>{dayData?.name}</span>
                </div>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default FlowControlDateTab;
