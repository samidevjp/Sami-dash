import React from 'react';
import { useDrop } from 'react-dnd';

const DroppableCell = ({ x, y, children, moveTable }: any) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'TABLE',
    drop: (item: any) => moveTable(item.id, x, y),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  return (
    <div
      ref={drop}
      style={{
        width: '20px',
        height: '20px',
        backgroundColor: isOver ? 'lightblue' : 'white',
        border: '1px solid black',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
};

export default DroppableCell;
