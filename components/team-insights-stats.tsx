import React from 'react';
import moment from 'moment';

interface TeamInsightsStatsProps {
  totalWageCost: number;
  totalHours: number;
  totalEmployees: number;
  averageShiftTime: number;
}

export const TeamInsightsStats: React.FC<TeamInsightsStatsProps> = ({
  totalWageCost,
  totalHours,
  totalEmployees,
  averageShiftTime
}) => {
  return (
    <div className="px-2">
      <div className="flex items-center justify-between gap-4 border-b py-3">
        <p className="text-xs">Total Wage Cost</p>
        <div className="flex items-center gap-1">
          <span className="text-xs">$</span>
          <span className="text-sm">{totalWageCost.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-b py-3">
        <p className="text-xs">Total Hours</p>
        <div className="flex items-center gap-1">
          <span className="text-sm">
            {(() => {
              const hours = moment.duration(totalHours, 'seconds').asHours();
              return `${hours.toFixed(2)}`;
            })()}
          </span>
          <span className="text-xs">Hours</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-b py-3">
        <p className="text-xs">Employees</p>
        <div className="flex items-center gap-1">
          <span className="text-sm">{totalEmployees}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-b py-3">
        <p className="text-xs">Avg. Shift Time</p>
        <div className="flex items-center gap-1">
          <span className="text-sm">
            {(() => {
              const hours = moment
                .duration(averageShiftTime, 'seconds')
                .asHours();
              return `${hours.toFixed(2)}`;
            })()}
          </span>
          <span className="text-xs">Hours</span>
        </div>
      </div>
    </div>
  );
};
