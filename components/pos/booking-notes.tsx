import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface BookingNotesProps {
  isOpenBookingNoteModal: boolean;
  handleCloseBookingNote: (note: string) => void;
  setIsOpenBookingNoteModal: (flag: boolean) => void;
}

const BookingNotes: React.FC<BookingNotesProps> = ({
  isOpenBookingNoteModal,
  handleCloseBookingNote,
  setIsOpenBookingNoteModal
}) => {
  const [note, setNote] = useState('');

  return (
    <Modal
      isOpen={isOpenBookingNoteModal}
      title="Add Note"
      description=""
      onClose={() => setIsOpenBookingNoteModal(false)}
    >
      <div className="h-full w-full">
        <div className="">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-full w-full bg-secondary p-2"
            placeholder="Enter note…"
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => handleCloseBookingNote(note)} variant="submit">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingNotes;
