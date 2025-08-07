import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Draggable from 'react-draggable';
import { Plus, Minus, Trash2, PlusCircle } from 'lucide-react';
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
  radToDeg,
  getRadWidth,
  getRadHeight,
  getPositionTop,
  getPositionLeft
} from '@/utils/Utility';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { TABLETYPE } from '@/utils/enum';
import { toast } from '@/components/ui/use-toast';
import { useApi } from '@/hooks/useApi';
import { useFloor } from '@/hooks/floorStore';
import { Modal } from '@/components/ui/modal';
import { Floor, Table } from '@/types';

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

export default function TableLayoutEditor() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [positions, setPositions] = useState<
    Record<number, { x: number; y: number }>
  >({});
  const [newFloorName, setNewFloorName] = useState('');

  const [editingFloorId, setEditingFloorId] = useState<number | null>(null);
  const [editingFloorName, setEditingFloorName] = useState('');
  const [editingFloors, setEditingFloors] = useState<Floor[]>([]);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [deleteTargetFloor, setDeleteTargetFloor] = useState<Floor | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { setFloor } = useFloor();
  const { getFloors, setFloors: saveFloors, setTables: saveTables } = useApi();

  // const router = useRouter();

  // Fetch floors and tables on component mount
  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    setLoading(true);
    try {
      const response = await getFloors();
      const fetchedFloors = response.data.floors;
      setFloors(fetchedFloors);

      // Extract all tables from floors
      const allTables = fetchedFloors.flatMap((floor: any) =>
        floor.tables.map((table: any) => ({
          ...table,
          floor_id: floor.id
        }))
      );

      setTables(allTables);

      // Set the first floor as selected
      if (fetchedFloors.length > 0) {
        setSelectedFloor(fetchedFloors[0].id);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load floor plan data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
    // Update the positions state for the UI (scaled)
    setPositions((prev) => ({
      ...prev,
      [tableId]: { x: data.x, y: data.y }
    }));

    // Update the actual table data with the real position (unscaled)
    // We divide by 0.6 to convert from display scale to actual scale
    updateTable(tableId, {
      pos_x: Math.round(data.x / 0.6),
      pos_y: Math.round(data.y / 0.6)
    });

    console.log(
      `Table ${tableId} display position: (${data.x}, ${
        data.y
      }), actual position: (${Math.round(data.x / 0.6)}, ${Math.round(
        data.y / 0.6
      )})`
    );
  };

  const addTable = (
    e: React.MouseEvent,
    tableOption: (typeof TABLE_OPTIONS)[0]
  ) => {
    e.preventDefault();
    if (selectedFloor === null) return;

    const floorTables = tables.filter((t) => t.floor_id === selectedFloor);

    // Generate a unique negative ID for new tables (will be replaced by server-generated ID later)
    // Use current timestamp to ensure uniqueness
    const newId = -Date.now() - Math.floor(Math.random() * 1000);

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

    // Add the new table to the tables array
    setTables([...tables, newTable]);

    // Initialize the position for the new table in the positions state
    setPositions((prev) => ({
      ...prev,
      [newId]: {
        x: Math.round(newTable.pos_x * 0.6),
        y: Math.round(newTable.pos_y * 0.6)
      }
    }));

    console.log(`Added new table with ID: ${newId}`);
  };

  const deleteTable = (tableId: number) => {
    setTables(tables.filter((t) => t.id !== tableId));
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

    setTables(tables.map((t) => (t.id === id ? updatedTable : t)));

    // Update the editing table state
    setEditingTable(updatedTable);
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

  const addFloor = () => {
    if (!newFloorName.trim()) {
      toast({
        title: 'Error',
        description: 'Floor name cannot be empty.',
        variant: 'destructive'
      });
      return;
    }

    const newFloor: Floor = {
      id: -Date.now(), // Temporary negative ID to identify new floors in the UI
      floor_name: newFloorName
    };

    setFloors([...floors, newFloor]);
    setSelectedFloor(newFloor.id);
    setNewFloorName('');
    // setIsAddingFloor(false);
  };

  const deleteFloor = (floorId: number) => {
    // Check if this is the only floor
    if (floors.length <= 1) {
      toast({
        title: 'Error',
        description: 'You must have at least one floor',
        variant: 'destructive'
      });
      return;
    }

    // Remove the floor
    const updatedFloors = floors.filter((f) => f.id !== floorId);
    setFloors(updatedFloors);

    // Remove all tables associated with this floor
    const updatedTables = tables.filter((t) => t.floor_id !== floorId);
    setTables(updatedTables);

    // Select another floor if the current one was deleted
    if (selectedFloor === floorId && updatedFloors.length > 0) {
      setSelectedFloor(updatedFloors[0].id);
    }
  };

  const handleSaveFloors = async () => {
    try {
      const cleanedFloors = floors.map((floor) => ({
        id: floor.id < 0 ? 0 : floor.id,
        floor_name: floor.floor_name
      }));

      const res = await saveFloors(cleanedFloors);
      toast({
        title: 'Success',
        description: 'Floors saved successfully',
        variant: 'success'
      });

      setIsFloorModalOpen(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to save floors',
        variant: 'destructive'
      });
    }
    fetchFloors();
  };
  const saveTableLayout = async () => {
    setSaving(true);
    setError(null);

    // Ensure positions are consistent before saving
    ensureConsistentPositioning();

    try {
      // First, save floors - send just the array of floors
      const floorsToSave = floors.map((floor) => ({
        // Always set ID to 0 for new floors (negative IDs)
        id: floor.id < 0 ? 0 : floor.id,
        floor_name: floor.floor_name
      }));

      console.log('Saving floors:', floorsToSave);
      const response = await saveFloors(floorsToSave);
      console.log('Floors API response:', response);

      // Extract saved floors from the response
      const savedFloors = response.floors || [];
      console.log('Saved floors:', savedFloors);

      // Create a mapping of temporary IDs to new IDs
      const floorIdMap: Record<number, number> = {};

      // Check if savedFloors exists and has the expected structure
      if (savedFloors && Array.isArray(savedFloors)) {
        // For each floor in our original array
        floors.forEach((originalFloor) => {
          // If it was a new floor (had negative ID)
          if (originalFloor.id < 0) {
            // Find the corresponding saved floor by name
            const savedFloor = savedFloors.find(
              (sf) => sf.floor_name === originalFloor.floor_name
            );
            if (savedFloor) {
              // Map the temporary ID to the new server-generated ID
              floorIdMap[originalFloor.id] = savedFloor.id;
              // console.log(
              //   `Mapped floor ID ${originalFloor.id} to ${savedFloor.id}`
              // );
            }
          }
        });
      }

      // console.log('Floor ID mapping:', floorIdMap);

      // Now save tables for each floor
      for (const floor of floors) {
        // Get the correct floor ID (either existing or mapped)
        const actualFloorId = floor.id < 0 ? floorIdMap[floor.id] : floor.id;

        if (!actualFloorId) {
          console.error(
            `Could not find actual floor ID for floor: ${floor.floor_name}`
          );
          continue;
        }

        // console.log(
        //   `Processing tables for floor: ${floor.floor_name} (ID: ${actualFloorId})`
        // );

        // Get tables for this floor
        const floorTables = tables
          .filter((table) => table.floor_id === floor.id)
          .map((table) => ({
            // Always set ID to 0 for new tables (negative IDs)
            id: table.id < 0 ? 0 : table.id,
            floor_id: actualFloorId, // Use the actual floor ID
            name: table.name,
            table_type: table.table_type,
            capacity_min: table.capacity_min,
            capacity_max: table.capacity_max,
            pos_x: table.pos_x,
            pos_y: table.pos_y,
            rotate_deg: table.rotate_deg,
            can_rotate: true,
            widget_is_non_reservable: false,
            widget_start_date_time: '2025-03-03 00:00:00',
            widget_end_date_time: '2025-12-03 00:00:00',
            color: table.color || ''
          }));

        // console.log(`Tables for floor ${actualFloorId}:`, floorTables);

        if (floorTables.length > 0) {
          // console.log(
          //   `Saving ${floorTables.length} tables for floor ${actualFloorId}`
          // );
          try {
            // Create the payload with the correct format
            // const payload = {
            //   floor_id: actualFloorId,
            //   tables: floorTables
            // };
            // console.log('Tables payload:', payload);

            const tableResponse = await saveTables(floorTables, actualFloorId);
            // console.log('Tables API response:', tableResponse);
          } catch (tableError) {
            console.error(
              `Error saving tables for floor ${actualFloorId}:`,
              tableError
            );
            setError(
              `Failed to save tables for floor "${floor.floor_name}". Please try again.`
            );
          }
        } else {
          console.log(`No tables to save for floor ${actualFloorId}`);
        }
      }

      setFloor(floors);
      toast({
        title: 'Success',
        description: 'Table layout saved successfully.',
        variant: 'success'
      });

      // Refresh data after saving
      fetchFloors();
    } catch (error) {
      console.error('Error saving table layout:', error);
      setError('Failed to save table layout. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to save table layout.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to ensure consistent positioning between editor and POS
  const ensureConsistentPositioning = () => {
    // Update all tables to ensure positions are consistent
    const updatedTables = tables.map((table) => {
      // If the table has a position in the positions state, use that
      if (positions[table.id]) {
        return {
          ...table,
          // Convert from display scale to actual scale
          pos_x: Math.round(positions[table.id].x / 0.6),
          pos_y: Math.round(positions[table.id].y / 0.6)
        };
      }
      return table;
    });

    setTables(updatedTables);
    console.log('Positions synchronized for all tables');
  };

  // Call this function when component mounts to ensure positions are consistent
  useEffect(() => {
    if (!loading && tables.length > 0) {
      // Initialize positions state from table data
      const initialPositions: Record<number, { x: number; y: number }> = {};
      tables.forEach((table) => {
        // Convert from actual scale to display scale (0.6x)
        initialPositions[table.id] = {
          x: Math.round(table.pos_x * 0.6),
          y: Math.round(table.pos_y * 0.6)
        };
      });
      setPositions(initialPositions);
      console.log('Initial positions set from table data (scaled to 0.6x)');
    }
  }, [loading, tables]);

  const handleRotateTable = (tableId: number) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Toggle between 0 and 90 degrees (0 and PI/2 radians)
    // If rotation is close to 0, set to 90 degrees, otherwise set to 0
    const newRotation = Math.abs(table.rotate_deg) < 0.1 ? Math.PI / 2 : 0;

    updateTable(tableId, {
      rotate_deg: newRotation
    });

    console.log(
      `Table ${tableId} rotated to ${radToDeg(newRotation)} degrees (${
        newRotation === 0 ? 'horizontal' : 'vertical'
      })`
    );
  };
  useEffect(() => {
    if (isFloorModalOpen) {
      setEditingFloors([...floors]);
    }
  }, [isFloorModalOpen, floors]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg p-4">
      <div className="mb-4 flex flex-col items-start gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <Label className="font-medium text-foreground">Select Floor:</Label>
            <Select
              value={selectedFloor?.toString() || ''}
              onValueChange={(value) => handleFloorChange(Number(value))}
            >
              <SelectTrigger className="w-full text-foreground md:w-[200px]">
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFloorModalOpen(true)}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Manage Floor
            </Button>

            <Modal
              title="Edit Floor"
              description="Edit the floor name"
              isOpen={isFloorModalOpen}
              onClose={() => setIsFloorModalOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Input
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  placeholder="Floor name"
                  className="w-full"
                />
                <Button size="sm" className="w-20" onClick={addFloor}>
                  Add
                </Button>
              </div>
              <div className="my-8 max-h-72 space-y-4 overflow-y-auto">
                {floors.map((floor) => (
                  <div key={floor.id} className="border-b py-1">
                    <div className="flex items-center justify-between">
                      {editingFloorId === floor.id ? (
                        <div className="flex w-full items-center gap-2">
                          <Input
                            value={editingFloorName}
                            onChange={(e) =>
                              setEditingFloorName(e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              setFloors((prev) =>
                                prev.map((f) =>
                                  f.id === floor.id
                                    ? { ...f, floor_name: editingFloorName }
                                    : f
                                )
                              );
                              setEditingFloorId(null);
                              setEditingFloorName('');
                            }}
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingFloorId(null);
                              setEditingFloorName('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p>{floor.floor_name}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingFloorId(floor.id);
                                setEditingFloorName(floor.floor_name);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteTargetFloor(floor)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveFloors}>Save Floors</Button>
              </div>
            </Modal>
            {deleteTargetFloor && (
              <AlertDialog
                open={!!deleteTargetFloor}
                onOpenChange={() => setDeleteTargetFloor(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete this floor?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Deleting the floor{' '}
                      <strong>{deleteTargetFloor.floor_name}</strong> will also
                      remove any associated table layout data. This change will
                      be applied when you click{' '}
                      <strong>&quot;Save Floors&quot;</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setDeleteTargetFloor(null)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteFloor(deleteTargetFloor.id);
                        setDeleteTargetFloor(null);
                      }}
                      className="bg-destructive text-white hover:bg-destructive/80"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {editingTable && (
            <div className="mt-4 rounded-lg border p-4">
              <h3 className="mb-2 text-lg font-medium">
                Edit Table: {editingTable?.name}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={editingTable?.name || ''}
                    onChange={(e) => {
                      if (editingTable) {
                        setEditingTable({
                          ...editingTable,
                          name: e.target.value
                        });
                      }
                    }}
                    onBlur={() => {
                      if (editingTable) {
                        updateTable(editingTable.id, {
                          name: editingTable.name
                        });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-4 md:flex-nowrap">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium text-foreground">Min:</Label>
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
                        <Minus className="h-3 w-3 text-foreground" />
                      </Button>
                      <span className="w-6 text-center text-foreground">
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
                        <Plus className="h-3 w-3 text-foreground" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="font-medium text-foreground">Max:</Label>
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
                        <Minus className="h-3 w-3 text-foreground" />
                      </Button>
                      <span className="w-6 text-center text-foreground">
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
                        <Plus className="h-3 w-3 text-foreground" />
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
                      className="text-foreground"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="w-full flex-shrink-0 overflow-auto border-b md:w-[200px] md:border-b-0 md:border-r lg:w-[250px]">
          <div className="p-4">
            <h3 className="mb-4 font-semibold text-foreground">Table Types</h3>
            <div className="grid max-h-[200px] grid-cols-2 gap-2 md:max-h-[800px] md:grid-cols-1 md:gap-0 md:space-y-2">
              {TABLE_OPTIONS.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className="h-16 w-full justify-start p-2 text-foreground hover:bg-muted/50"
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
                      <span className="text-xs text-muted-foreground">
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
                .map((table) => {
                  const rotateVal = radToDeg(table.rotate_deg);
                  // Get the display position (scaled to 0.6x)
                  const displayPos = positions[table.id] || {
                    x: Math.round(table.pos_x * 0.6),
                    y: Math.round(table.pos_y * 0.6)
                  };

                  // Calculate table dimensions for proper text positioning
                  const tableWidth = getRadWidth(
                    table.rotate_deg,
                    table.table_type
                  );
                  const tableHeight = getRadHeight(
                    table.rotate_deg,
                    table.table_type
                  );

                  return (
                    <Draggable
                      key={table.id}
                      position={displayPos}
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
                          <div
                            style={{
                              width: getTableWidth(table.table_type),
                              height: getTableHeight(table.table_type),
                              transformOrigin: 'top left',
                              position: 'absolute',
                              top: getPositionTop(
                                table.rotate_deg,
                                table.table_type
                              ),
                              left: getPositionLeft(
                                table.rotate_deg,
                                table.table_type
                              ),
                              transform: `rotate(${rotateVal}deg)`
                            }}
                            className="table-container-wrapper"
                          >
                            <Image
                              src={getTableImg(table.table_type) || ''}
                              alt={table.name}
                              width={tableWidth}
                              height={tableHeight}
                              className="table-floor table-container brightness-200"
                            />

                            {/* Table info overlay - inside the rotated container with counter-rotation */}
                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{
                                transform: `rotate(${-rotateVal}deg)`, // Counter-rotate to keep text horizontal
                                transformOrigin: 'center center',
                                pointerEvents: 'none' // Prevents interfering with drag
                              }}
                            >
                              <div className="rounded bg-black/50 px-2 py-1 text-center text-xs font-medium text-white">
                                <span>
                                  {table.name}
                                  <br />
                                  {table.capacity_min}-{table.capacity_max}p
                                  <br />
                                  {/* <span className="text-[8px] opacity-70">
                                    ({Math.round(table.pos_x)}, {Math.round(table.pos_y)})
                                  </span> */}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Rotate button */}
                          {editingTable?.id === table.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRotateTable(table.id);
                              }}
                              className="absolute -top-8 right-0 z-20 rounded-full bg-primary p-1 text-white hover:bg-primary/80"
                              title="Rotate table"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                <path d="M3 3v5h5"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </Draggable>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 flex justify-end gap-2 bg-background pt-4">
        <Button
          variant="outline"
          onClick={() => {
            fetchFloors(); // Reset to original data
            setEditingTable(null);
          }}
        >
          Reset
        </Button>
        {/* <Button
          variant="outline"
          onClick={() => router.push('/pos')}
        >
          Go to POS
        </Button> */}
        <Button onClick={saveTableLayout} disabled={saving}>
          {saving ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Layout'
          )}
        </Button>
      </div>

      {error && <div className="mt-2 text-sm text-destructive">{error}</div>}
    </div>
  );
}
