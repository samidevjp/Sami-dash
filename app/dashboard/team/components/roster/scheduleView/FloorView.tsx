import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Position {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle';
  position: Position;
  size: { width: number; height: number };
  color?: string;
}

interface EmployeePosition {
  employeeId: number;
  position: Position;
}

interface FloorViewProps {
  schedule: any;
  employeesSchedule: any;
}

interface DraggableStyle extends React.CSSProperties {
  transform?: string;
  transition?: string;
}

const DraggableShape = ({
  shape,
  isOverlay,
  onColorChange,
  onDelete
}: {
  shape: Shape;
  isOverlay?: boolean;
  onColorChange: (id: string, color: string) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: shape.id,
    data: {
      type: 'Shape',
      shape
    }
  });

  const style: DraggableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'absolute' as const,
    left: shape.position.x,
    top: shape.position.y,
    width: shape.size.width,
    height: shape.size.height,
    backgroundColor: shape.color || '#f3f4f6'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`absolute cursor-move ${isDragging ? 'opacity-50' : ''} ${
        isOverlay ? 'ring-2 ring-primary' : ''
      }`}
    >
      {renderShape(shape)}
      <input
        type="color"
        value={shape.color || '#ffffff'}
        onChange={(e) => onColorChange(shape.id, e.target.value)}
        className="absolute right-0 top-0 z-10"
        onMouseDown={(e) => e.stopPropagation()}
      />

      <button
        onClick={(e) => {
          onDelete(shape.id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute left-0 top-0 z-10 rounded bg-red-500 p-1 text-white"
      >
        X
      </button>
    </div>
  );
};

const DraggableEmployee = ({ employee, position, isOverlay }: any) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `employee_${employee.id}`,
    data: {
      type: 'Employee',
      employee
    }
  });

  const style: DraggableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'absolute' as const,
    left: position?.x || 0,
    top: position?.y || 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`absolute cursor-move rounded-lg bg-white p-2 shadow-md ${
        isDragging ? 'opacity-50' : ''
      } ${isOverlay ? 'ring-2 ring-primary' : ''}`}
    >
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{
          backgroundColor:
            employee.color === '#ffffff' ? '#000' : employee.color
        }}
      >
        {employee.photo && (
          <img
            src={employee.photo}
            alt={`${employee.first_name} ${employee.last_name}`}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="whitespace-nowrap text-sm font-medium text-white">
          {employee.first_name} {employee.last_name}
        </span>
      </div>
    </div>
  );
};

const FloorView: React.FC<FloorViewProps> = ({
  schedule,
  employeesSchedule
}) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [employeePositions, setEmployeePositions] = useState<
    EmployeePosition[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#f3f4f6');
  const [size, setSize] = useState({ width: 100, height: 100 });

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    const savedFloorPlan = localStorage.getItem(`floorPlan_${schedule.id}`);
    if (savedFloorPlan) {
      const { shapes: savedShapes, positions: savedPositions } =
        JSON.parse(savedFloorPlan);
      setShapes(savedShapes);
      setEmployeePositions(savedPositions);
    }
  }, [schedule.id]);

  const addShape = (type: 'rectangle' | 'circle' | 'triangle') => {
    const newShape: Shape = {
      id: `shape_${Date.now()}`,
      type,
      position: { x: 50, y: 50 },
      size,
      color: backgroundColor
    };
    setShapes([...shapes, newShape]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const id = active.id.toString();

    if (id.startsWith('shape_')) {
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.id === id
            ? {
                ...shape,
                position: {
                  x: shape.position.x + delta.x,
                  y: shape.position.y + delta.y
                }
              }
            : shape
        )
      );
    } else if (id.startsWith('employee_')) {
      const employeeId = parseInt(id.replace('employee_', ''));
      setEmployeePositions((prevPositions) => {
        const existingPosition = prevPositions.find(
          (pos) => pos.employeeId === employeeId
        );
        const newPosition = {
          x: (existingPosition?.position.x || 0) + delta.x,
          y: (existingPosition?.position.y || 0) + delta.y
        };

        if (existingPosition) {
          return prevPositions.map((pos) =>
            pos.employeeId === employeeId
              ? { ...pos, position: newPosition }
              : pos
          );
        }

        return [...prevPositions, { employeeId, position: newPosition }];
      });
    }

    setActiveId(null);
  };

  const handleColorChange = (id: string, newColor: string) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id ? { ...shape, color: newColor } : shape
      )
    );
  };

  const handleDeleteShape = (id: string) => {
    setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== id));
  };

  const saveFloorPlan = () => {
    localStorage.setItem(
      `floorPlan_${schedule.id}`,
      JSON.stringify({
        shapes,
        positions: employeePositions
      })
    );
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex gap-4">
        <Button onClick={() => addShape('rectangle')} variant="outline">
          Add Rectangle
        </Button>
        <Button onClick={() => addShape('circle')} variant="outline">
          Add Circle
        </Button>
        <Button onClick={() => addShape('triangle')} variant="outline">
          Add Triangle
        </Button>
        <Button onClick={saveFloorPlan} variant="default">
          Save Floor Plan
        </Button>
      </div>
      <div className="mb-2 flex w-full flex-col items-center gap-4 md:flex-row md:gap-12">
        <div className="flex flex-col gap-2">
          <Label>Floor Color</Label>
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Width</Label>
          <Input
            type="number"
            value={size.width}
            className="w-16"
            placeholder="Width"
            onChange={(e) =>
              setSize({ ...size, width: parseInt(e.target.value) })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Height</Label>
          <Input
            type="number"
            value={size.height}
            className="w-16"
            placeholder="Height"
            onChange={(e) =>
              setSize({ ...size, height: parseInt(e.target.value) })
            }
          />
        </div>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="floor-container relative h-[600px] overflow-hidden rounded-lg border border-dashed border-gray-300"
          style={{ backgroundColor }}
        >
          {shapes.map((shape) => (
            <DraggableShape
              key={shape.id}
              shape={shape}
              onColorChange={handleColorChange}
              onDelete={handleDeleteShape}
            />
          ))}

          {employeesSchedule?.employee_shifts?.map((employee: any) => (
            <DraggableEmployee
              key={`employee_${employee.id}`}
              employee={employee}
              position={
                employeePositions.find((p) => p.employeeId === employee.id)
                  ?.position
              }
            />
          ))}

          <DragOverlay>
            {activeId && activeId.startsWith('shape_') && (
              <DraggableShape
                shape={shapes.find((s) => s.id === activeId)!}
                isOverlay
                onColorChange={handleColorChange}
                onDelete={handleDeleteShape}
              />
            )}
            {activeId && activeId.startsWith('employee_') && (
              <DraggableEmployee
                employee={employeesSchedule.employee_shifts.find(
                  (e: any) => `employee_${e.id}` === activeId
                )}
                position={
                  employeePositions.find(
                    (p) => `employee_${p.employeeId}` === activeId
                  )?.position
                }
                isOverlay
              />
            )}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  );
};
const renderShape = (shape: Shape) => {
  switch (shape.type) {
    case 'rectangle':
      return (
        <div
          style={{
            backgroundColor: shape.color || '#f3f4f6',
            border: '2px solid #ccc',
            width: '100%',
            height: '100%'
          }}
          className="rounded-md shadow-sm"
        />
      );

    case 'circle':
      return (
        <div
          style={{
            backgroundColor: shape.color || '#f3f4f6',
            border: '2px solid #ccc',
            borderRadius: '50%',
            width: '100%',
            height: '100%'
          }}
          className="shadow-sm"
        />
      );

    case 'triangle':
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${shape.size.width / 2}px solid transparent`,
            borderRight: `${shape.size.width / 2}px solid transparent`,
            borderBottom: `${shape.size.height}px solid ${shape.color}`,
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0))'
          }}
        />
      );

    default:
      return null;
  }
};

export default FloorView;
