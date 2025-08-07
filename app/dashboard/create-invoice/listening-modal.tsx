import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

const ListeningModal = ({ isListening, onStopListening, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50">
      <div className="rounded-lg p-6 shadow-lg">
        <h2 className="text-center text-lg font-semibold">Listening...</h2>
        <div className="mt-4 flex flex-col items-center">
          {isListening && <div className="listening-indicator"></div>}
          <Button className="mt-4" onClick={onStopListening}>
            Stop Listening
          </Button>
          <Button className="mt-2" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListeningModal;
