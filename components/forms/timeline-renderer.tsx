import React from 'react';
import { cn } from '@/lib/utils';
import { getRelativeLuminance } from '@/utils/common';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
export type Shift = {
  id: number;
  name: string;
  shift_color: string;
  start_time: number;
  end_time: number;
  floors: any[];
};
type Props = {
  shifts: Shift[];
  floor: {
    id: number;
    floor_name: string;
    color?: string;
  }[];
  onShiftClick?: (shift: Shift) => void;
  onTimeClick?: (seconds: number) => void;
};
const secondsInDay = 86400;

const assignRows = (shifts: Shift[]) => {
  const sorted = [...shifts].sort((a, b) => a.start_time - b.start_time);
  const rows: Shift[][] = [];
  const shiftRowMap: Record<number, number> = {};

  sorted.forEach((shift) => {
    let placed = false;
    for (let i = 0; i < rows.length; i++) {
      const last = rows[i][rows[i].length - 1];
      if (shift.start_time >= last.end_time) {
        rows[i].push(shift);
        shiftRowMap[shift.id] = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push([shift]);
      shiftRowMap[shift.id] = rows.length - 1;
    }
  });

  return { rowCount: rows.length, shiftRowMap };
};

const TimelineRenderer: React.FC<Props> = ({
  shifts,
  onShiftClick,
  onTimeClick,
  floor
}) => {
  const { rowCount, shiftRowMap } = assignRows(shifts);

  return (
    <div
      className="relative w-full rounded border"
      style={{ height: `${rowCount * 28}px`, minHeight: '28px' }}
    >
      <div className="relative left-0 top-0 flex h-full w-full border-b border-t">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className=" relative z-30 flex-1 cursor-pointer border-l text-xs text-muted-foreground hover:bg-secondary"
            onClick={() => onTimeClick?.(i * 3600)}
          >
            <div className="absolute -top-5 left-0 -translate-x-1/2 whitespace-nowrap">
              <span className="block md:hidden">
                {i % 2 === 0 ? i.toString().padStart(2) : ''}
              </span>

              <span className="hidden md:block">
                {i.toString().padStart(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shift blocks */}
      <div className="absolute left-0 top-0 flex h-full w-full overflow-hidden">
        <div className="relative h-full w-full">
          {shifts.map((shift) => {
            const getDuration = (start: number, end: number) => {
              if (end <= start) {
                return end + 86400 - start;
              }
              return end - start;
            };

            const leftPercent = (shift.start_time / secondsInDay) * 100;
            const duration = getDuration(shift.start_time, shift.end_time);
            const widthPercent = (duration / secondsInDay) * 100;
            const top = (shiftRowMap[shift.id] ?? 0) * 28;
            const isOverflowingRight = leftPercent + widthPercent > 100;

            return (
              <TooltipProvider key={shift.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'absolute z-40 flex h-[26px] cursor-pointer items-center rounded border-2 border-primary px-2 text-xs shadow-sm hover:opacity-70'
                      )}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        top: `${top}px`,
                        backgroundColor: shift.shift_color,
                        color: getRelativeLuminance(shift.shift_color)
                      }}
                      onClick={() => onShiftClick?.(shift)}
                    >
                      <span>{shift.name}</span>
                      {isOverflowingRight && (
                        <span className="ml-1 text-[10px] italic opacity-70">
                          (Overnight)
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    <div className="">
                      <div className="">
                        <span>{shift.name}</span>
                        {isOverflowingRight && (
                          <span className="ml-1 text-[10px] italic opacity-60">
                            (Overnight)
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {shift.floors?.length > 0 ? (
                          shift.floors.map((floorId: number, index: number) => {
                            const matchedFloor = floor?.find(
                              (f) => f.id === floorId
                            );
                            const isLast = index === shift.floors.length - 1;
                            return (
                              <div
                                key={floorId}
                                style={{
                                  backgroundColor:
                                    matchedFloor?.color || undefined,
                                  color: matchedFloor
                                    ? getRelativeLuminance(matchedFloor.color)
                                    : undefined
                                }}
                              >
                                {matchedFloor?.floor_name ??
                                  `Unknown (ID: ${floorId})`}
                                {!isLast && <>, </>}
                              </div>
                            );
                          })
                        ) : (
                          <div>No floor assigned</div>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineRenderer;
