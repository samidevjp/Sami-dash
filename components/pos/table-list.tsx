import React, { useEffect } from 'react';

import { getFloorName } from '@/utils/Utility';
import { CircleAlert, Loader2, UsersRound } from 'lucide-react';
interface TableListProps {
  tables: any;
  selectedTableIds?: any;
  isMultipleTable?: boolean;
  setSelectedTableIds?: (tableId: any) => void;
  floors: any;
  isLoading: boolean;
  bookedTableIds?: any;
  selectedTables?: any;
  setSelectedTables?: any;
}

const TableList = ({
  tables,
  selectedTableIds,
  isMultipleTable = true,
  setSelectedTableIds,
  floors,
  isLoading,
  bookedTableIds,
  selectedTables,
  setSelectedTables
}: TableListProps) => {
  const handleSelectTable = (table: any) => {
    if (setSelectedTableIds) {
      let tableId = table.id;
      if (isMultipleTable) {
        setSelectedTableIds((prevItems: any) => {
          const isSelected = prevItems.includes(tableId);

          if (isSelected) {
            return prevItems.filter((id: number) => id !== tableId);
          } else {
            return [...prevItems, tableId];
          }
        });
      } else {
        setSelectedTableIds([tableId]);
      }
    } else if (setSelectedTables) {
      if (isMultipleTable) {
        let tables = selectedTables !== null ? [].concat(selectedTables) : [];
        if (tables !== null) {
          if (tables.length !== 0) {
            const index = tables.findIndex((e: any) => e?.id === table.id);
            if (index !== -1) {
              tables.splice(index, 1);
              setSelectedTables(tables);
            } else {
              setSelectedTables([...tables, table]);
            }
          } else {
            setSelectedTables([...tables, table]);
          }
        } else {
          setSelectedTables([table]);
        }
      } else {
        setSelectedTables([table]);
      }
    }
  };

  return (
    <div className="table-list relative h-60 w-full overflow-y-auto rounded-lg border border-secondary bg-secondary text-center text-xs">
      {tables === null ? (
        <label className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-sm font-semibold">
          ※Select date & time to show tables availability
        </label>
      ) : isLoading === true ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>
      ) : tables.length === 0 ? (
        <label className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          No available tables
        </label>
      ) : (
        tables.map((item: any) => {
          return (
            <div
              key={Math.random()}
              className={`table-list-item relative h-10 flex-1 cursor-pointer border-b font-semibold transition-all hover:bg-hoverTable ${
                selectedTableIds?.some((id: any) => id === item.id)
                  ? ' bg-tertiary text-primary'
                  : ' bg-secondary'
              }${
                selectedTables?.some((table: any) => table?.id === item.id)
                  ? ' bg-tertiary text-primary'
                  : ' bg-secondary'
              }`}
              onClick={() => handleSelectTable(item)}
            >
              <div
                key={Math.random()}
                className="absolute left-5 top-1/2 flex -translate-y-1/2 gap-2"
              >
                {item.name}
              </div>
              <div
                key={Math.random()}
                className="list-center absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer gap-2"
              >
                <label key={Math.random()}>
                  {getFloorName(item.floor_id, floors)}
                </label>
              </div>
              <div
                key={Math.random()}
                className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-4"
              >
                {bookedTableIds?.includes(item.id) && (
                  <span
                    className="flex gap-2 text-red-500"
                    title="Already booked"
                  >
                    <CircleAlert size={16} />
                    Booked
                  </span>
                )}
                <div>
                  <label
                    className="cursor-pointer text-xs font-semibold"
                    key={Math.random()}
                  >
                    {item.capacity_min + '-' + item.capacity_max}
                  </label>
                  <UsersRound width={20} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TableList;
