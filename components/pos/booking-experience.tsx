import React from 'react';
import { Modal } from '../ui/modal';

interface BookingExperienceProps {
  bookingExperience: boolean;
  handleCloseBookingExperience: () => void;
  expGetAssign: (id: number) => void;
  setTicketQuantityOpen: (open: boolean) => void;
  experienceList: any;
}
const BookingExperience: React.FC<BookingExperienceProps> = ({
  bookingExperience,
  handleCloseBookingExperience,
  expGetAssign,
  setTicketQuantityOpen,
  experienceList
}) => {
  const selectExperience = (id: any) => {
    expGetAssign(id);
    handleCloseBookingExperience();
    setTicketQuantityOpen(true);
  };

  return (
    <Modal
      isOpen={bookingExperience}
      onClose={handleCloseBookingExperience}
      title="Select Experience"
      description=""
    >
      <div className="grid h-96 gap-4 overflow-auto p-4">
        {experienceList.length > 0
          ? experienceList.map((id: any) => (
              <div
                key={id.id}
                className="flex w-full cursor-pointer select-none flex-col justify-center rounded-lg bg-secondary p-2"
                onClick={() => selectExperience(id.id)}
              >
                <p className="text-xs">{id.exp_name}</p>
                <p className="text-ellipsis py-2 text-sm">
                  {id.exp_description}
                </p>
                <div className="flex justify-between">
                  <span>${id.price}.00</span>
                  <span>{id.no_of_ticket} Tickets</span>
                </div>
              </div>
            ))
          : ''}
      </div>
    </Modal>
  );
};

export default BookingExperience;
