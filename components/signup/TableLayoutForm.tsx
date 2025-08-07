import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { Plus, Minus, Save, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Image from 'next/image';
import {
  getTableImg,
  getTableWidth,
  getTableHeight,
  radToDeg
} from '@/utils/Utility';
import { TABLETYPE } from '@/utils/enum';
import FormLayout from '@/components/signup/FormLayout';
import { toast } from '@/components/ui/use-toast';

type Table = {
  id: number;
  name: string;
  capacity_min: number;
  capacity_max: number;
  floor_id: number;
  pos_x: number;
  pos_y: number;
  table_type: number;
  rotate_deg: number;
  can_rotate: boolean;
  widget_is_non_reservable: boolean;
  widget_start_date_time?: string;
  widget_end_date_time?: string;
  color?: string;
};

type TableLayoutFormProps = {
  tables: Table[];
  floors: { id: number; floor_name: string }[];
  updateFields: (fields: Partial<{ tables: Table[] }>) => void;
};

const TABLE_OPTIONS = [
  { type: 'singleTable', label: 'Single Table', capacity: { min: 1, max: 2 } },
  {
    type: 'twoSingleTable',
    label: 'Two Single Table',
    capacity: { min: 2, max: 4 }
  },
  {
    type: 'threeSingleTable',
    label: 'Three Single Table',
    capacity: { min: 3, max: 6 }
  },
  {
    type: 'singlePairTable',
    label: 'Single Pair Table',
    capacity: { min: 2, max: 4 }
  },
  {
    type: 'twoSinglePairTable',
    label: 'Two Single Pair',
    capacity: { min: 4, max: 8 }
  },
  {
    type: 'threeSinglePairTable',
    label: 'Three Single Pair',
    capacity: { min: 6, max: 12 }
  },
  {
    type: 'fourSinglePairTable',
    label: 'Four Single Pair',
    capacity: { min: 8, max: 16 }
  },
  {
    type: 'fourPersonSingleTable',
    label: '4 Person Single',
    capacity: { min: 2, max: 4 }
  },
  {
    type: 'fourPersonRoundTable',
    label: '4 Person Round',
    capacity: { min: 2, max: 4 }
  },
  {
    type: 'sixPersonRoundTable',
    label: '6 Person Round',
    capacity: { min: 4, max: 6 }
  },
  {
    type: 'eightPersonRoundTable',
    label: '8 Person Round',
    capacity: { min: 6, max: 8 }
  },
  {
    type: 'tenPersonRoundTable',
    label: '10 Person Round',
    capacity: { min: 8, max: 10 }
  },
  {
    type: 'halfSeatRoundTable',
    label: 'Half Seat Round',
    capacity: { min: 2, max: 4 }
  },
  {
    type: 'twoPersonRoundTable',
    label: '2 Person Round',
    capacity: { min: 1, max: 2 }
  }
];

export default function TableLayoutForm({
  tables,
  floors,
  updateFields
}: TableLayoutFormProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(() =>
    floors.length > 0 ? floors[0].id : null
  );
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [positions, setPositions] = useState<
    Record<number, { x: number; y: number }>
  >({});

  // Update selected floor if floors change and current selection is invalid
  useEffect(() => {
    if (
      floors.length > 0 &&
      (selectedFloor === null || !floors.find((f) => f.id === selectedFloor))
    ) {
      setSelectedFloor(floors[0].id);
    }
  }, [floors, selectedFloor]);

  const handleFloorChange = (floorId: number) => {
    setSelectedFloor(floorId);
    setEditingTable(null); // Clear editing table when changing floors
    setPositions({}); // Reset positions when changing floors
  };

  const handleDrag = (
    tableId: number,
    e: any,
    data: { x: number; y: number }
  ) => {
    setPositions((prev) => ({
      ...prev,
      [tableId]: { x: data.x, y: data.y }
    }));

    updateFields({
      tables: tables.map((table) =>
        table.id === tableId
          ? { ...table, pos_x: data.x, pos_y: data.y }
          : table
      )
    });
  };

  const addTable = (
    e: React.MouseEvent,
    tableOption: (typeof TABLE_OPTIONS)[0]
  ) => {
    e.preventDefault();
    if (selectedFloor === null) return;

    const floorTables = tables.filter((t) => t.floor_id === selectedFloor);

    // Generate a unique negative ID for new tables (will be replaced by server-generated ID later)
    const newId =
      tables.length > 0 ? Math.min(...tables.map((t) => t.id)) - 1 : -1;

    // Calculate new position based on existing tables in this floor
    const baseOffset = 50;
    const spacing = 100;
    const tablesPerRow = 4;
    const row = Math.floor(floorTables.length / tablesPerRow);
    const col = floorTables.length % tablesPerRow;

    const newTable: Table = {
      id: newId,
      name: `Table ${floorTables.length + 1}`,
      capacity_min: tableOption.capacity.min,
      capacity_max: tableOption.capacity.max,
      floor_id: selectedFloor,
      pos_x: baseOffset + col * spacing,
      pos_y: baseOffset + row * spacing,
      table_type: TABLETYPE[tableOption.type as keyof typeof TABLETYPE],
      rotate_deg: 0,
      can_rotate: true,
      widget_is_non_reservable: false,
      color: ''
    };
    updateFields({ tables: [...tables, newTable] });

    // Automatically select the newly added table
    setEditingTable(newTable);
  };

  const deleteTable = (tableId: number) => {
    updateFields({
      tables: tables.filter((t) => t.id !== tableId)
    });
    setEditingTable(null);
  };

  const updateTable = (id: number, updates: Partial<Table>) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    const updatedTable = { ...table, ...updates };

    // Ensure capacity_min is always less than or equal to capacity_max
    if ('capacity_max' in updates) {
      updatedTable.capacity_min = Math.min(
        updatedTable.capacity_min,
        updatedTable.capacity_max
      );
    }
    if ('capacity_min' in updates) {
      updatedTable.capacity_max = Math.max(
        updatedTable.capacity_max,
        updatedTable.capacity_min
      );
    }

    updateFields({
      tables: tables.map((t) => (t.id === id ? updatedTable : t))
    });

    // Update the editing table state
    setEditingTable(updatedTable);
  };

  const getTableSize = (capacity: number) => {
    const baseSize = 60;
    const scale = Math.min(1.5, Math.max(1, capacity / 4));
    return Math.floor(baseSize * scale);
  };

  const handleCapacityChange = (
    tableId: number,
    field: 'capacity_min' | 'capacity_max',
    increment: boolean
  ) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const value = table[field];
    const newValue = increment ? value + 1 : value - 1;

    // Ensure min capacity is not less than 1 and max capacity is not less than min
    if (
      field === 'capacity_min' &&
      newValue >= 1 &&
      newValue <= table.capacity_max
    ) {
      updateTable(tableId, { capacity_min: newValue });
    } else if (field === 'capacity_max' && newValue >= table.capacity_min) {
      updateTable(tableId, { capacity_max: newValue });
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col rounded-lg bg-white p-6">
      <div className="flex flex-col items-start gap-4 bg-white px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <Label className="font-medium text-black">Select Floor:</Label>
            <Select
              value={selectedFloor?.toString() || ''}
              onValueChange={(value) => handleFloorChange(Number(value))}
            >
              <SelectTrigger className="w-full text-black md:w-[200px]">
                <SelectValue placeholder="Select a floor" />
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <SelectItem key={floor.id} value={floor.id.toString()}>
                    {floor.floor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editingTable && (
            <div className="flex flex-wrap items-start gap-4 rounded-lg bg-muted/10 px-4 md:flex-nowrap md:items-center">
              <div className="flex w-full items-center gap-2 md:w-auto">
                <Label className="font-medium text-black">Table Name:</Label>
                <Input
                  value={editingTable.name}
                  onChange={(e) =>
                    updateTable(editingTable.id, { name: e.target.value })
                  }
                  className="w-full text-black md:w-[150px]"
                  placeholder="Table name"
                />
              </div>

              <div className="flex flex-wrap gap-4 md:flex-nowrap">
                <div className="flex items-center gap-2">
                  <Label className="font-medium text-black">Min:</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCapacityChange(
                          editingTable.id,
                          'capacity_min',
                          false
                        );
                      }}
                    >
                      <Minus className="h-3 w-3 text-black" />
                    </Button>
                    <span className="w-6 text-center text-black">
                      {editingTable.capacity_min}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCapacityChange(
                          editingTable.id,
                          'capacity_min',
                          true
                        );
                      }}
                    >
                      <Plus className="h-3 w-3 text-black" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-medium text-black">Max:</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCapacityChange(
                          editingTable.id,
                          'capacity_max',
                          false
                        );
                      }}
                    >
                      <Minus className="h-3 w-3 text-black" />
                    </Button>
                    <span className="w-6 text-center text-black">
                      {editingTable.capacity_max}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCapacityChange(
                          editingTable.id,
                          'capacity_max',
                          true
                        );
                      }}
                    >
                      <Plus className="h-3 w-3 text-black" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteTable(editingTable.id);
                    }}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingTable(null);
                    }}
                    className="text-black"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="w-full flex-shrink-0 overflow-auto border-b bg-white md:w-[200px] md:border-b-0 md:border-r lg:w-[250px]">
          <div className="p-4">
            <h3 className="mb-4 font-semibold text-black">Table Types</h3>
            <div className="grid max-h-[200px] grid-cols-2 gap-2 md:max-h-[800px] md:grid-cols-1 md:gap-0 md:space-y-2">
              {TABLE_OPTIONS.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className="h-16 w-full justify-start p-2 text-black hover:bg-gray-50"
                  onClick={(e) => {
                    if (selectedFloor === null) {
                      toast({
                        title: 'No floor selected',
                        description:
                          'Please select a floor first before adding tables.',
                        variant: 'destructive'
                      });
                      return;
                    }
                    addTable(e, option);
                  }}
                  disabled={selectedFloor === null}
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="relative h-10 w-10 flex-shrink-0">
                      <Image
                        src={
                          getTableImg(
                            TABLETYPE[option.type as keyof typeof TABLETYPE]
                          ) || ''
                        }
                        alt={option.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="truncate text-sm">{option.label}</span>
                      <span className="text-xs text-gray-600">
                        {option.capacity.min}-{option.capacity.max}p
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[300px] flex-1 overflow-auto bg-[#1a1a1a] md:min-h-0">
          {selectedFloor === null ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-lg text-gray-400">
                Please select a floor to start adding tables
              </p>
            </div>
          ) : (
            <div className="relative h-[1000px] w-full p-4">
              {/* Grid Background */}
              <div
                className="absolute inset-0 bg-[#1a1a1a]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #ccc 1px, transparent 1px),
                    linear-gradient(to bottom, #ccc 1px, transparent 1px)
                  `,
                  backgroundSize: '25px 25px',
                  backgroundPosition: '0 0',
                  opacity: 0.3
                }}
              />
              {tables
                .filter((table) => table.floor_id === selectedFloor)
                .map((table) => (
                  <Draggable
                    key={table.id}
                    position={
                      positions[table.id] || {
                        x: table.pos_x,
                        y: table.pos_y
                      }
                    }
                    onDrag={(e, data) => handleDrag(table.id, e, data)}
                    bounds="parent"
                  >
                    <div
                      className={`absolute cursor-move ${
                        editingTable?.id === table.id
                          ? 'ring-2 ring-primary ring-offset-2'
                          : ''
                      }`}
                      onClick={() => setEditingTable(table)}
                    >
                      <div className="relative">
                        <Image
                          src={getTableImg(table.table_type) || ''}
                          alt={table.name}
                          width={getTableWidth(table.table_type)}
                          height={getTableHeight(table.table_type)}
                          className="table-floor table-container brightness-200"
                          style={{
                            transform: `rotate(${table.rotate_deg}deg)`
                          }}
                        />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-medium text-white">
                          <span>
                            {table.name}
                            <br />
                            {table.capacity_min}-{table.capacity_max}p
                          </span>
                        </div>
                      </div>
                    </div>
                  </Draggable>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
